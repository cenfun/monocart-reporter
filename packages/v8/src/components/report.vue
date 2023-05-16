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
      <VuiFlex padding="5px">
        <div class="vui-flex-auto">
          <b>URL:</b> <a
            :href="summary.url"
            target="_blank"
          >{{ summary.url }}</a>
        </div>
      </VuiFlex>
      <VuiFlex
        padding="5px"
        gap="10px"
      >
        <div><b>Bytes</b></div>
        <div>Total: {{ Util.NF(summary.total) }}</div>
        <div>Unused: <span :class="summary.unusedClass">{{ Util.NF(summary.unused) }}</span></div>
        <div
          style="width: 100px;"
          v-html="summary.percentChart"
        />
        <div
          style="padding: 0 5px;"
          :class="'mcr-'+summary.status"
        >
          {{ Util.PF(summary.pct, 100) }}
        </div>
      </VuiFlex>
      <VuiFlex
        v-if="summary.lines"
        padding="5px"
        gap="10px"
      >
        <div><b>Formatted Lines</b></div>
        <div>Total: {{ Util.NF(summary.lines.total) }}</div>
        <div>Uncovered: <span :class="summary.lines.uncoveredClass">{{ Util.NF(summary.lines.uncovered) }}</span></div>
        <div
          style="width: 100px;"
          v-html="summary.lines.percentChart"
        />
        <div>{{ Util.PF(summary.lines.pct, 100) }}</div>
      </VuiFlex>
      <VuiFlex
        v-if="summary.topExecutions"
        padding="5px"
        gap="10px"
      >
        <div><b>Top 3 Executions:</b></div>

        <VuiFlex
          v-for="(item, i) in summary.topExecutions"
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

<script setup>
import {
    ref, watch, inject, onMounted, shallowReactive
} from 'vue';

import { components } from 'vine-ui';
// import { microtask } from 'async-tick';

import Util from '../utils/util.js';

import { createCodeViewer } from 'monocart-code-viewer';

import { format, Mapping } from 'monocart-formatter';

const { VuiFlex, VuiLoading } = components;

const state = inject('state');

const summary = shallowReactive({
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
                behavior: 'smooth'
            });
        }
    }
};

const setUncoveredLines = (coverage, line, value) => {
    const item = coverage.uncoveredLines;
    const prev = item[line];
    if (prev && prev !== value) {
        if (prev === 'uncovered') {
            return prev;
        }
        // console.log('previous line', line, prev, value);
    }
    item[line] = value;
};

const setUncoveredPieces = (coverage, line, value) => {
    const item = coverage.uncoveredPieces;
    const prev = item[line];
    if (prev) {
        prev.push(value);
        return;
    }
    item[line] = [value];
};

const setExecutionCounts = (coverage, line, value) => {
    const item = coverage.executionCounts;
    const prev = item[line];
    if (prev) {
        prev.push(value);
        return;
    }
    item[line] = [value];
};

const singleLineHandler = (sLoc, eLoc, coverage, formattedMapping) => {
    // console.log(sLoc, eLoc);

    // nothing between
    if (sLoc.column >= eLoc.column) {
        return;
    }

    const lineInfo = formattedMapping.getFormattedLine(sLoc.line);
    const codeOffset = lineInfo.text.search(/\S/g);
    // console.log(sLoc.line, codeOffset, sLoc.column);

    // multiple line end line, start code offset
    if (sLoc.fromCode) {
        sLoc.column = codeOffset;
    }

    // nothing between after code offset
    if (sLoc.column >= eLoc.column) {
        return;
    }

    // console.log(sLoc, codeOffset, eLoc);

    if (sLoc.column === codeOffset && eLoc.column === eLoc.length) {
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
        column: 0,
        fromCode: true
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

const getTopExecutions = (executionCounts) => {
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
        return;
    }

    list.sort((a, b) => {
        return b.count - a.count;
    });

    if (list.length > 3) {
        list.length = 3;
    }

    return list;
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
            const sLoc = formattedMapping.getFormattedLocation(startOffset);
            setExecutionCounts(coverage, sLoc.line, {
                value: count,
                column: sLoc.column
            });
        }
    });

    coverage.topExecutions = getTopExecutions(coverage.executionCounts);

    return coverage;

};

const getReport = async (item) => {
    if (item.report) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(item.report);
            });
        });
    }

    const text = item.source;
    const res = await format(text, item.type);
    if (res.error) {
        console.log(res.error.message);
        return;
    }

    const { content, mapping } = res;

    const formattedMapping = new Mapping(content, mapping);

    const coverage = getCoverage(item, text, formattedMapping);

    // console.log(coverage);

    const report = {
        coverage,
        content
    };

    return report;
};

const showReport = async () => {
    const id = state.flyoverData;
    if (!id) {
        return;
    }
    const item = state.fileMap[id];
    state.loading = true;

    Object.assign(summary, item.summary);
    summary.unusedClass = summary.unused > 0 ? 'mcr-uncovered' : '';

    const report = await getReport(item);
    if (!report) {
        console.log(`failed to format source: ${item.filename}`);
        return;
    }

    const {
        totalLines, uncoveredLines, topExecutions
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

    const pct = Util.PF(totalLines - uncovered, totalLines, 1, '');
    const percentChart = Util.generatePercentChart(pct);

    summary.lines = {
        total: totalLines,
        uncovered,
        uncoveredClass: uncovered > 0 ? 'mcr-uncovered' : '',
        pct,
        percentChart
    };

    summary.topExecutions = topExecutions;

    // console.log(report);

    if (codeViewer) {
        codeViewer.update(report);
    } else {
        codeViewer = createCodeViewer($el, report);
    }

    state.loading = false;
};


watch(() => state.flyoverData, (v) => {
    showReport();
});

onMounted(() => {
    $el = el.value;
});

</script>
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
