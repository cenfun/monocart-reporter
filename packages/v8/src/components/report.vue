<script setup>
import {
    ref, watch, inject, onMounted, shallowReactive
} from 'vue';

import { components } from 'vine-ui';
import { microtask } from 'async-tick';

import Util from '../utils/util.js';

import { createCodeViewer } from 'monocart-code-viewer';

import { format, Mapping } from 'monocart-formatter';

const {
    VuiFlex, VuiSelect, VuiSwitch, VuiLoading
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

const setUncoveredLines = (coverage, line, value) => {
    const uncoveredMap = coverage.uncoveredLines;
    const prev = uncoveredMap[line];
    if (prev && prev !== value) {
        if (prev === 'uncovered') {
            return prev;
        }
        // console.log('previous line', line, prev, value);
    }
    uncoveredMap[line] = value;
};

const setUncoveredPieces = (coverage, line, value) => {
    const uncoveredMap = coverage.uncoveredPieces;
    const prevList = uncoveredMap[line];
    if (prevList) {
        prevList.push(value);
        return;
    }
    uncoveredMap[line] = [value];
};

const setExecutionCounts = (formattedMapping, range, coverage) => {
    const executionMap = coverage.executionCounts;

    const {
        startOffset, endOffset, count
    } = range;

    const sLoc = formattedMapping.getFormattedLocation(startOffset);
    const line = sLoc.line;
    const column = sLoc.column;

    const eLoc = formattedMapping.getFormattedLocation(endOffset);
    const end = eLoc.start + eLoc.column;

    // console.log(endOffset, end);

    const execution = {
        // for start position
        column,
        value: count,
        // for end position
        end
    };

    const prevList = executionMap[line];
    if (prevList) {
        prevList.push(execution);
        return;
    }
    executionMap[line] = [execution];
};

const singleLineHandler = (sLoc, eLoc, coverage, formattedMapping) => {
    // console.log(sLoc, eLoc);

    // nothing between
    if (sLoc.column >= eLoc.column) {
        return;
    }

    const lineInfo = formattedMapping.getFormattedLine(sLoc.line);
    const realStart = lineInfo.text.search(/\S/g);
    // console.log(sLoc.line, codeOffset, sLoc.column);

    // multiple line end line, start code offset
    if (sLoc.column < realStart) {
        sLoc.column = realStart;
    }

    // nothing between after code offset
    if (sLoc.column >= eLoc.column) {
        return;
    }

    // console.log(sLoc, codeOffset, eLoc);

    if (sLoc.column === realStart && eLoc.column === eLoc.length) {
        // console.log('single', sLoc.line);
        setUncoveredLines(coverage, sLoc.line, 'uncovered');
        return;
    }

    // already uncovered, should not sub partial
    const prevUncovered = setUncoveredLines(coverage, sLoc.line, 'partial');
    if (prevUncovered) {
        // console.log(sLoc.line);
        return;
    }

    setUncoveredPieces(coverage, sLoc.line, {
        start: sLoc.column,
        end: eLoc.column
    });

};

const multipleLinesHandler = (sLoc, eLoc, coverage, formattedMapping) => {

    const firstELoc = {
        ... sLoc,
        column: sLoc.length
    };
    singleLineHandler(sLoc, firstELoc, coverage, formattedMapping);


    for (let i = sLoc.line + 1; i < eLoc.line; i++) {

        // console.log('multiple', i);
        // if empty line
        const isEmpty = formattedMapping.isFormattedLineEmpty(i);
        if (isEmpty) {
            continue;
        }

        setUncoveredLines(coverage, i, 'uncovered');

    }

    const lastSLoc = {
        ... eLoc,
        column: 0
    };
    singleLineHandler(lastSLoc, eLoc, coverage, formattedMapping);

};

const rangeLinesHandler = (formattedMapping, start, end, coverage) => {
    const sLoc = formattedMapping.getFormattedLocation(start);
    const eLoc = formattedMapping.getFormattedLocation(end);

    if (eLoc.line === sLoc.line) {
        singleLineHandler(sLoc, eLoc, coverage, formattedMapping);
        return;
    }

    multipleLinesHandler(sLoc, eLoc, coverage, formattedMapping);

};

const getUncoveredFromCovered = (ranges, contentLength) => {
    const uncoveredRanges = [];
    if (!ranges || !ranges.length) {

        // nothing covered
        uncoveredRanges.push({
            start: 0,
            end: contentLength
        });

        return uncoveredRanges;
    }

    ranges.sort((a, b) => a.start - b.start);

    let pos = 0;
    ranges.forEach((range) => {
        if (range.start > pos) {
            uncoveredRanges.push({
                start: pos,
                end: range.start
            });
        }
        pos = range.end;
    });

    if (pos < contentLength) {
        uncoveredRanges.push({
            start: pos,
            end: contentLength
        });
    }

    return uncoveredRanges;
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

    const maxNumber = parseInt(state.topNumber) || 3;

    if (list.length > maxNumber) {
        list.length = maxNumber;
    }

    data.topExecutions = list;
};

const getCoverage = (item, text, formattedMapping) => {

    const coverage = {
        totalLines: formattedMapping.formattedLines.length,
        uncoveredLines: {},
        uncoveredPieces: {},
        executionCounts: {}
    };

    // css, text, ranges: [ {start, end} ]
    // js, source, functions:[ {functionName, isBlockCoverage, ranges: [{startOffset, endOffset, count}] } ]
    if (item.type === 'css') {
        const ranges = getUncoveredFromCovered(item.ranges, text.length);
        ranges.forEach((range) => {
            const { start, end } = range;
            rangeLinesHandler(formattedMapping, start, end, coverage);
        });

        return coverage;
    }

    const flatRanges = Util.getFlatRanges(item.functions);
    flatRanges.forEach((range) => {
        const {
            startOffset, endOffset, count
        } = range;
        if (count === 0) {
            rangeLinesHandler(formattedMapping, startOffset, endOffset, coverage);
        } else if (count > 1) {
            setExecutionCounts(formattedMapping, range, coverage);
        }
    });

    return coverage;

};

const autoDetectType = (item) => {
    const { type, source } = item;

    const src = source.trim();
    if (src.startsWith('<') && src.endsWith('>')) {
        return 'html';
    }

    // const lastDot = item.sourcePath.lastIndexOf('.');
    // if (lastDot !== -1) {
    //     const ext = item.sourcePath.slice(lastDot);
    //     if (ext === '.vue') {
    //         return 'html';
    //     }
    // }

    return type;
};

const formatSource = (item) => {
    const source = item.source;

    // console.log('formatSource', data.formatted);

    // no format for distFile item, may vue format or others
    if (!data.formatted) {
        // codemirror will replace all \r\n to \n, so end position will be mismatched
        // just replace all \r\n with \n
        const formatted = source.replace(Util.lineBreakPattern, '\n');
        const mapping = Mapping.generate(source, formatted);
        // console.log(mapping);
        return {
            content: formatted,
            mapping
        };
    }

    let type = item.type;
    if (item.distFile && type === 'js') {
        type = autoDetectType(item);
    }

    return format(source, type);
};

const getReport = async (item) => {

    const cacheKey = ['report', 'formatted', data.formatted].join('_');

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

    const formattedMapping = new Mapping(content, mapping);

    const coverage = getCoverage(item, item.source, formattedMapping);

    // console.log(cacheKey, coverage);
    // console.log([item.source]);
    // console.log([content]);

    const report = {
        formatted: data.formatted,
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
        console.log(`failed to format source: ${item.filename}`);
        data.list = [summary];
        return;
    }

    const {
        totalLines, uncoveredLines, executionCounts
    } = report.coverage;
    let uncovered = 0;
    Object.values(uncoveredLines).forEach((v) => {
        if (v === 'uncovered') {
            uncovered += 1;
            return;
        }
        uncovered += 0.5;
    });

    uncovered = Math.floor(uncovered);

    const covered = totalLines - uncovered;

    const pct = Util.PF(totalLines - uncovered, totalLines, 1, '');
    const percentChart = Util.generatePercentChart(pct);

    const lineInfo = {
        indicator: 'line',
        indicatorName: 'Lines',
        total: totalLines,
        totalTooltip: '',
        covered,
        coveredTooltip: '',
        coveredClass: covered > 0 ? 'mcr-covered' : '',
        uncovered,
        uncoveredTooltip: '',
        uncoveredClass: uncovered > 0 ? 'mcr-uncovered' : '',
        pct,
        status: Util.getStatus(pct, state.watermarks),
        percentChart
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

    data.formatted = !item.distFile;

    renderReportAsync();
};


watch(() => state.flyoverData, (v) => {
    showReport();
});

watch(() => data.formatted, (v) => {
    renderReportAsync();
});

watch(() => state.topNumber, (v) => {
    updateTopExecutions();
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
        padding="5px"
        gap="10px"
        wrap
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
      </VuiFlex>

      <VuiFlex
        gap="10px"
        padding="5px"
        wrap
      >
        <VuiFlex gap="5px">
          <b>Formatted</b>
          <VuiSwitch
            v-model="data.formatted"
            tooltip="Will automatically turn off formatting if the file was unpacked from a source map file"
          />
        </VuiFlex>

        <span v-if="data.distFile">
          <b>Dist File</b> {{ data.distFile }}
        </span>
      </VuiFlex>

      <VuiFlex
        v-if="data.topExecutions"
        gap="10px"
      >
        <VuiFlex
          gap="5px"
          padding="5px"
        >
          <div><b>Top Executions</b></div>
          <VuiSelect
            v-model="state.topNumber"
            class="mcr-top-number"
          >
            <option>3</option>
            <option>5</option>
            <option>10</option>
          </VuiSelect>
        </VuiFlex>

        <VuiFlex
          class="vui-flex-auto"
          gap="8px"
          wrap
        >
          <VuiFlex
            v-for="(item, i) in data.topExecutions"
            :key="i"
            gap="5px"
          >
            <div
              class="mcr-line"
              @click="scrollToLine(item.line)"
            >
              line {{ Util.NF(item.line) }}
            </div>
            <div class="mcr-count">
              x{{ item.count }}
            </div>
          </VuiFlex>
        </VuiFlex>
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

.mcr-line {
    cursor: pointer;

    &:hover {
        text-decoration: underline;
    }
}

.mcr-count {
    padding: 0 3px;
    font-size: 12px;
    border: 1px solid #4eb62f;
    border-radius: 3px;
    background-color: #e6f5d0;
}

</style>
