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
        <div><b>Total Bytes:</b> {{ Util.NF(summary.total) }} ({{ Util.BF(summary.total) }})</div>
        <div><b>Used Bytes:</b> {{ Util.NF(summary.covered) }} ({{ Util.BF(summary.covered) }})</div>
        <div><b>Unused Bytes:</b> {{ Util.NF(summary.unused) }} ({{ Util.BF(summary.unused) }})</div>
      </VuiFlex>
      <VuiFlex
        padding="5px"
        gap="10px"
      >
        <div><b>Coverage:</b> {{ Util.PF(summary.pct, 100) }}</div>
        <div
          style="width: 100px;"
          v-html="summary.percentChart"
        />
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

const setCoverageLineValue = (coverage, line, value) => {
    const item = coverage.line;
    // const prev = item[line];
    // if (prev && prev !== value) {
    // console.log('previous line', line, prev, value);
    // }
    item[line] = value;
};

const setCoverageBgValue = (coverage, line, value) => {
    const item = coverage.bg;
    const prev = item[line];
    if (prev) {
        prev.push(value);
        return;
    }
    item[line] = [value];
};

const setCoverageCountValue = (coverage, line, value) => {
    const item = coverage.count;
    const prev = item[line];
    if (prev) {
        prev.push(value);
        return;
    }
    item[line] = [value];
};

const singleLineHandler = (sLoc, eLoc, coverage, formattedMapping) => {
    // console.log(sLoc, eLoc);
    if (sLoc.column === 0 && eLoc.column === eLoc.last) {
        setCoverageLineValue(coverage, sLoc.line, 'uncovered');
        return;
    }

    if (eLoc.column === eLoc.last) {

        // const text = formattedMapping.getFormattedSlice(sLoc.offset + sLoc.column, eLoc.offset + eLoc.column);
        // console.log(text);

        // return;
    }

    setCoverageLineValue(coverage, sLoc.line, 'partial');
    setCoverageBgValue(coverage, sLoc.line, {
        start: sLoc.column,
        end: eLoc.column
    });

};

const multipleLinesHandler = (sLoc, eLoc, coverage, formattedMapping) => {

    if (sLoc.column < sLoc.last) {

        if (sLoc.column === 0) {

            setCoverageLineValue(coverage, sLoc.line, 'uncovered');

        } else {

            setCoverageLineValue(coverage, sLoc.line, 'partial');

            setCoverageBgValue(coverage, sLoc.line, {
                start: sLoc.column,
                end: sLoc.last
            });

        }

    }

    for (let i = sLoc.line + 1; i < eLoc.line; i++) {

        setCoverageLineValue(coverage, i, 'uncovered');

    }

    if (eLoc.column > 0) {

        if (eLoc.column === eLoc.last) {

            setCoverageLineValue(coverage, eLoc.line, 'uncovered');

        } else {

            // check if all \s
            const s = formattedMapping.getFormattedSlice(eLoc.offset, eLoc.offset + eLoc.column);
            if ((/[^\s]/).test(s)) {

                setCoverageLineValue(coverage, eLoc.line, 'partial');

                setCoverageBgValue(coverage, eLoc.line, {
                    start: 0,
                    end: eLoc.column
                });

            }
        }

    }
};

const rangeLinesHandler = (formattedMapping, start, end, coverage) => {
    const sLoc = formattedMapping.originalToFormatted(start);
    const eLoc = formattedMapping.originalToFormatted(end);

    // console.log('start', start, sLoc);
    // console.log('end', end, eLoc);

    if (eLoc.line === sLoc.line) {
        singleLineHandler(sLoc, eLoc, coverage, formattedMapping);
        return;
    }

    multipleLinesHandler(sLoc, eLoc, coverage, formattedMapping);

};

const cssCoveredToUncovered = (ranges, contentLength) => {
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

const getCoverage = (item, text, content, mapping) => {

    const formattedMapping = new Mapping(content, mapping);

    const coverage = {
        line: {},
        bg: {},
        count: {}
    };

    // css, text, ranges: [ {start, end} ]
    // js, source, functions:[ {functionName, isBlockCoverage, ranges: [{startOffset, endOffset, count}] } ]
    if (item.type === 'css') {
        const ranges = cssCoveredToUncovered(item.ranges, text.length);
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
            const sLoc = formattedMapping.originalToFormatted(startOffset);
            // small probability, ignore if multiple counts in a line
            setCoverageCountValue(coverage, sLoc.line, {
                value: count,
                column: sLoc.column
            });
        }
    });

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

    const text = item.source || item.text;
    const res = await format(text, item.type);
    if (res.error) {
        console.log(res.error.message);
        return;
    }

    const { content, mapping } = res;
    const coverage = getCoverage(item, text, content, mapping);

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

    const report = await getReport(item);
    if (!report) {
        console.log(`failed to format source: ${item.filename}`);
        return;
    }

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

</style>
