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

const oneLineHandler = (sLoc, eLoc, lineMap, bgMap) => {
    if (sLoc.column === 0 && eLoc.column === eLoc.last) {
        lineMap.set(sLoc.line, 'uncovered');
    } else {
        lineMap.set(sLoc.line, 'partial');
        bgMap.set(sLoc.line, {
            start: sLoc.column,
            end: eLoc.column
        });
    }
};

const multipleLineHandler = (sLoc, eLoc, lineMap, bgMap, formattedMapping) => {

    if (sLoc.column < sLoc.last) {

        if (sLoc.column === 0) {
            lineMap.set(sLoc.line, 'uncovered');
        } else {
            lineMap.set(sLoc.line, 'partial');
            bgMap.set(sLoc.line, {
                start: sLoc.column,
                end: sLoc.last
            });
        }

    }

    for (let i = sLoc.line + 1; i < eLoc.line; i++) {
        lineMap.set(i, 'uncovered');
    }

    if (eLoc.column > 0) {

        if (eLoc.column === eLoc.last) {
            lineMap.set(eLoc.line, 'uncovered');
        } else {

            // check if all \s
            const s = formattedMapping.getFormattedSlice(eLoc.offset, eLoc.offset + eLoc.column);
            if ((/[^\s]/).test(s)) {
                lineMap.set(eLoc.line, 'partial');
                bgMap.set(eLoc.line, {
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

    const { lineMap, bgMap } = coverage;


    if (eLoc.line === sLoc.line) {
        oneLineHandler(sLoc, eLoc, lineMap, bgMap);
        return;
    }

    multipleLineHandler(sLoc, eLoc, lineMap, bgMap, formattedMapping);

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

    // css, text, ranges: [ {start, end} ]
    // js, source, functions:[ {functionName, isBlockCoverage, ranges: [{startOffset, endOffset, count}] } ]
    if (item.type === 'css') {
        const coverage = {
            lineMap: new Map(),
            bgMap: new Map()
        };
        const ranges = cssCoveredToUncovered(item.ranges, text.length);
        ranges.forEach((range) => {
            const { start, end } = range;
            rangeLinesHandler(formattedMapping, start, end, coverage);
        });

        return coverage;

    }

    const countMap = new Map();
    const coverage = {
        lineMap: new Map(),
        bgMap: new Map(),
        countMap
    };

    const flatRanges = Util.getFlatRanges(item.functions);
    flatRanges.forEach((range) => {
        const {
            startOffset, endOffset, count
        } = range;
        if (count === 0) {
            rangeLinesHandler(formattedMapping, startOffset, endOffset, coverage);
        } else if (count > 1) {
            const sLoc = formattedMapping.originalToFormatted(startOffset);
            countMap.set(sLoc.line, count);
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

    .cm-editor {
        width: 100%;
        height: 100%;
    }

    .cm-scroller {
        overflow: auto;
    }

    /* stylelint-disable-next-line selector-class-pattern */
    .cm-gutterElement {
        .cm-fold {
            display: block;
            width: 15px;
            height: 100%;
            padding-left: 3px;
            background-repeat: no-repeat;
            background-position: center center;
            background-size: 10px 10px;
            cursor: pointer;
            opacity: 0.6;
            overflow: hidden;
            user-select: none;
        }

        .cm-fold-open {
            background-image: url("../images/arrow-fold-open.svg");
        }

        .cm-fold-close {
            background-image: url("../images/arrow-fold-close.svg");
        }
    }

    /* stylelint-disable-next-line selector-class-pattern */
    .cm-activeLineGutter {
        .cm-fold {
            opacity: 1;
        }
    }
}

.cm-coverage-line {
    width: 5px;

    .cm-line-covered {
        background-color: green;
    }

    .cm-line-partial {
        background-color: orange;
    }

    .cm-line-uncovered {
        background-color: red;
    }
}

.cm-coverage-count {
    .cm-line-count {
        padding: 0 3px;
        font-size: 12px;
        font-family: var(--font-monospace);
        text-align: right;
        background-color: #e6f5d0;
    }
}

.cm-bg-covered {
    background: #e6f5d0;
}

.cm-bg-uncovered {
    background: #fce1e5;
}

</style>
