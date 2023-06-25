<script setup>
import {
    ref, watch, inject, onMounted, shallowReactive
} from 'vue';

import { components } from 'vine-ui';

import { microtask } from 'monocart-common';
import { createCodeViewer } from 'monocart-code-viewer';
import { format, Mapping } from 'monocart-formatter';

import Util from '../utils/util.js';

import { getCoverage } from '../utils/coverage.js';

const {
    VuiFlex, VuiSwitch, VuiLoading
} = components;

const state = inject('state');

const data = shallowReactive({

});

const el = ref(null);
let $el;
let codeViewer;

const scrollToLine = (line) => {
    if (codeViewer) {
        const viewer = codeViewer.viewer;
        const top = (line - 1) * viewer.defaultLineHeight;
        if (top >= 0) {
            viewer.scrollDOM.scrollTo({
                top,
                behavior: 'auto'
            });
        }
    }
};


const updateTopExecutions = () => {

    const executionCounts = data.executionCounts;
    if (!executionCounts) {
        data.topExecutions = null;
        return;
    }

    const list = [];
    Object.keys(executionCounts).forEach((line) => {
        const arr = executionCounts[line];
        arr.forEach((item) => {
            list.push({
                // line index to line number
                line: parseInt(line) + 1,
                count: item.value
            });
        });
    });

    if (!list.length) {
        data.topExecutions = null;
        return;
    }

    list.sort((a, b) => {
        return b.count - a.count;
    });

    const maxNumber = 5;
    if (list.length > maxNumber) {
        list.length = maxNumber;
    }

    data.topExecutions = list;
};

const autoDetectType = (item) => {
    const {
        type, source, originalType
    } = item;

    if (originalType) {
        return originalType;
    }

    const regS = /^\s*</;
    const regE = />\s*$/;
    if (regS.test(source) && regE.test(source)) {
        item.originalType = 'html';
        return 'html';
    }

    return type;
};

const formatSource = (item) => {
    const source = item.source;

    // console.log('formatSource', state.formatted);

    // no format for distFile item, may vue format or others
    if (!state.formatted) {
        // codemirror will replace all \r\n to \n, so end position will be mismatched
        // just replace all \r\n with \n
        const formattedContent = source.replace(Util.lineBreakPattern, '\n');
        const mapping = Mapping.generate(source, formattedContent);
        // console.log(mapping);
        return {
            content: formattedContent,
            mapping
        };
    }

    let type = item.type;
    if (item.distFile) {
        type = autoDetectType(item);
    }

    return format(source, type);
};

const getReport = async (item) => {

    const cacheKey = ['report', 'formatted', state.formatted].join('_');

    if (item[cacheKey]) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(item[cacheKey]);
            });
        });
    }

    const res = await formatSource(item);
    if (res.error) {
        console.log(res.error.message);
        return;
    }

    const { content, mapping } = res;

    const coverage = getCoverage(item, content, mapping);

    // console.log(cacheKey);
    console.log(coverage);
    // console.log([item.source]);
    // console.log([content]);

    const report = {
        coverage,
        content
    };

    item[cacheKey] = report;

    return report;
};

const renderReport = async () => {
    state.loading = true;

    const item = data.item;
    const summary = item.summary;

    const report = await getReport(item);
    if (!report) {
        console.log(`failed to format source: ${item.sourcePath}`);
        data.list = [summary];
        return;
    }

    const {
        uncoveredLines, executionCounts, totalLines, commentedLines, blankLines, codeLines
    } = report.coverage;
    let uncovered = 0;
    Object.values(uncoveredLines).forEach((v) => {
        if (v === 'uncovered') {
            uncovered += 1;
            return;
        }
        if (v === 'partial') {
            uncovered += 0.5;
        }
    });

    uncovered = Math.floor(uncovered);

    const covered = codeLines - uncovered;

    const pct = Util.PF(codeLines - uncovered, codeLines, 1, '');
    const percentChart = Util.generatePercentChart(pct);

    const list = [];
    if (commentedLines) {
        list.push({
            name: 'Comments',
            value: commentedLines,
            tooltip: Util.PSF(commentedLines, totalLines)
        });
    }
    if (blankLines) {
        list.push({
            name: 'Blanks',
            value: blankLines,
            tooltip: Util.PSF(blankLines, totalLines)
        });
    }

    const lineInfo = {
        indicator: 'line',
        indicatorName: 'Lines',
        total: codeLines,
        totalTooltip: '',
        covered,
        coveredTooltip: '',
        coveredClass: covered > 0 ? 'mcr-covered' : '',
        uncovered,
        uncoveredTooltip: '',
        uncoveredClass: uncovered > 0 ? 'mcr-uncovered' : '',
        pct,
        status: Util.getStatus(pct, state.watermarks),
        percentChart,
        list
    };

    data.list = [summary, lineInfo];

    // console.log('showReport executionCounts', executionCounts);

    data.executionCounts = executionCounts;
    updateTopExecutions();

    // for code viewer debug
    // console.log(report);

    if (codeViewer) {
        codeViewer.update(report);
    } else {
        codeViewer = createCodeViewer($el, report);
    }

    state.loading = false;
};

const renderReportAsync = microtask(renderReport);

const showReport = () => {
    const id = state.flyoverData;
    if (!id) {
        return;
    }
    const item = state.fileMap[id];

    data.item = item;
    data.url = item.url;
    data.sourcePath = item.sourcePath;
    data.distFile = item.distFile;

    const summary = item.summary;
    summary.indicatorName = 'Bytes';
    summary.totalTooltip = `Total ${Util.BSF(summary.total)}`;
    summary.coveredTooltip = `Covered ${Util.BSF(summary.covered)}`;
    summary.coveredClass = summary.covered > 0 ? 'mcr-covered' : '';
    summary.uncoveredTooltip = `Uncovered ${Util.BSF(summary.uncovered)}`;
    summary.uncoveredClass = summary.uncovered > 0 ? 'mcr-uncovered' : '';

    renderReportAsync();
};


watch(() => state.flyoverData, (v) => {
    showReport();
});

watch(() => state.formatted, (v) => {
    if (!state.flyoverData) {
        return;
    }

    renderReportAsync();
});

onMounted(() => {
    $el = el.value;
});

</script>

<template>
  <VuiFlex
    direction="column"
    class="mcr-report"
  >
    <VuiFlex
      direction="column"
      padding="5px"
      class="mcr-report-head"
    >
      <VuiFlex
        v-for="(item, i) in data.list"
        :key="i"
        gap="10px"
        padding="5px"
        wrap
        class="mcr-report-item"
      >
        <div>
          <b>{{ item.indicatorName }}</b> <span :tooltip="item.totalTooltip">{{ Util.NF(item.total) }}</span>
        </div>

        <div>
          Covered: <span
            :tooltip="item.coveredTooltip"
            :class="item.coveredClass"
          >{{ Util.NF(item.covered) }}</span>
        </div>
        <div>
          Uncovered: <span
            :tooltip="item.uncoveredTooltip"
            :class="item.uncoveredClass"
          >{{ Util.NF(item.uncovered) }}</span>
        </div>
        <div
          style="width: 100px;"
          v-html="item.percentChart"
        />
        <div
          style="padding: 0 5px;"
          :class="'mcr-'+item.status"
        >
          {{ Util.PF(item.pct, 100) }}
        </div>
        <div
          v-for="(it, j) in item.list"
          :key="j"
        >
          {{ it.name }}:
          <span :tooltip="it.tooltip">{{ Util.NF(it.value) }}</span>
        </div>
      </VuiFlex>

      <VuiFlex
        v-if="data.topExecutions"
        gap="10px"
        padding="5px"
        wrap
        class="mcr-report-item"
      >
        <div><b>Top Executions</b></div>
        <VuiFlex
          v-for="(item, i) in data.topExecutions"
          :key="i"
          gap="5px"
          class="mcr-top-item"
          @click="scrollToLine(item.line)"
        >
          <div class="mcr-top-line">
            L{{ item.line }}
          </div>
          <div class="mcr-top-count">
            x{{ item.count }}
          </div>
        </VuiFlex>
      </VuiFlex>

      <VuiFlex
        gap="10px"
        padding="5px"
        wrap
        class="mcr-report-item"
      >
        <VuiSwitch
          v-model="state.formatted"
          :label-clickable="true"
        >
          <b>Pretty Print</b>
        </VuiSwitch>

        <span v-if="data.distFile">
          <b>From Dist File</b> {{ data.distFile }}
        </span>
      </VuiFlex>
    </VuiFlex>
    <div
      ref="el"
      class="mcr-report-code vui-flex-auto"
    />
    <VuiLoading
      center
      :visible="state.loading"
    />
  </VuiFlex>
</template>

<style lang="scss">
.mcr-report {
    position: relative;
    height: 100%;
}

.mcr-report-head {
    width: 100%;
    border-bottom: 1px solid #dae9fa;
    background-color: #eef6ff;

    a {
        word-break: break-all;
    }
}

@media (hover: none) {
    .mcr-report-item {
        flex-wrap: nowrap;
        overflow-x: auto;
    }
}

.mcr-report-code {
    position: relative;
}

.mcr-top-number {
    width: 42px;

    .vui-select-view {
        min-width: 42px;
        text-align: center;
    }
}

.mcr-covered {
    color: green;
}

.mcr-uncovered {
    color: red;
}

.mcr-top-item {
    cursor: pointer;

    &:hover {
        .mcr-top-line {
            text-decoration: underline;
        }
    }

    .mcr-top-count {
        padding: 0 3px;
        font-size: 12px;
        font-family: monospace;
        border: 1px solid #4eb62f;
        border-radius: 3px;
        background-color: #e6f5d0;
    }
}

</style>
