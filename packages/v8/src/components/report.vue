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
        <div v-html="summary.percentChart" />
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

import { createEditor } from '../utils/editor.js';
import FormatterMapping from '../utils/mapping.js';

import formatterDataUrl from '../../../../.temp/devtools-formatter-dataurl.js';

const { VuiFlex, VuiLoading } = components;

const state = inject('state');

const summary = shallowReactive({
});

const el = ref(null);
let $el;
let editor;
let workerUrl;

const format = (type, text) => {
    if (!workerUrl) {
        workerUrl = new URL(formatterDataUrl());
    }

    return new Promise((resolve) => {
        const worker = new Worker(workerUrl);
        worker.onmessage = (e) => {
            if (e.data === 'workerReady') {
                worker.postMessage({
                    type,
                    text
                });
                return;
            }
            resolve(e.data);
            worker.terminate();
        };
        worker.onerror = (e) => {
            console.error(e);
            resolve();
            worker.terminate();
        };

    });
};

const oneLineHandler = (sLoc, eLoc, gutterMap, bgMap) => {
    if (sLoc.column === 0 && eLoc.column === eLoc.last) {
        gutterMap.set(sLoc.line, 'uncovered');
    } else {
        gutterMap.set(sLoc.line, 'partial');
        bgMap.set(sLoc.line, {
            start: sLoc.column,
            end: eLoc.column
        });
    }
};

const multipleLineHandler = (sLoc, eLoc, gutterMap, bgMap, formattedMapping) => {

    if (sLoc.column < sLoc.last) {

        if (sLoc.column === 0) {
            gutterMap.set(sLoc.line, 'uncovered');
        } else {
            gutterMap.set(sLoc.line, 'partial');
            bgMap.set(sLoc.line, {
                start: sLoc.column,
                end: sLoc.last
            });
        }

    }

    for (let i = sLoc.line + 1; i < eLoc.line; i++) {
        gutterMap.set(i, 'uncovered');
    }

    if (eLoc.column > 0) {

        if (eLoc.column === eLoc.last) {
            gutterMap.set(eLoc.line, 'uncovered');
        } else {

            // check if all \s
            const s = formattedMapping.getSlice(eLoc.offset, eLoc.offset + eLoc.column);
            if ((/[^\s]/).test(s)) {
                gutterMap.set(eLoc.line, 'partial');
                bgMap.set(eLoc.line, {
                    start: 0,
                    end: eLoc.column
                });
            }
        }

    }
};

const rangeLinesHandler = (formattedMapping, start, end, coverage) => {
    const sLoc = formattedMapping.originalToFormattedLocation(start);
    const eLoc = formattedMapping.originalToFormattedLocation(end);

    // console.log('start', start, sLoc);
    // console.log('end', end, eLoc);

    const { gutterMap, bgMap } = coverage;


    if (eLoc.line === sLoc.line) {
        oneLineHandler(sLoc, eLoc, gutterMap, bgMap);
        return;
    }

    multipleLineHandler(sLoc, eLoc, gutterMap, bgMap, formattedMapping);

};

const cssCoveredToUncovered = (ranges, contentLength) => {
    const uncoveredRanges = [];
    if (!ranges || !ranges.length) {
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

    const formattedMapping = new FormatterMapping(content, mapping);

    // css, text, ranges: [ {start, end} ]
    // js, source, functions:[ {functionName, isBlockCoverage, ranges: [{startOffset, endOffset, count}] } ]
    if (item.type === 'css') {
        const coverage = {
            gutterMap: new Map(),
            bgMap: new Map()
        };
        const ranges = cssCoveredToUncovered(item.ranges, text.length);
        ranges.forEach((range) => {
            const { start, end } = range;
            rangeLinesHandler(formattedMapping, start, end, coverage);
        });

        return coverage;

    }

    const coverage = {
        gutterMap: new Map(),
        bgMap: new Map()
    };
    const functions = item.functions;
    if (functions) {
        functions.forEach((fun) => {
            const ranges = fun.ranges;
            if (ranges) {
                ranges.forEach((range) => {
                    if (range.count === 0) {
                        const { startOffset, endOffset } = range;
                        rangeLinesHandler(formattedMapping, startOffset, endOffset, coverage);
                    }
                });
            }
        });
    }

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
    const res = await format(item.type, text);
    if (!res) {
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

    if (editor) {
        editor.showContent(report);
    } else {
        editor = createEditor($el, report);
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

.mcr-coverage-gutter {
    width: 5px;

    .mcr-line-covered {
        background-color: green;
    }

    .mcr-line-partial {
        background-color: orange;
    }

    .mcr-line-uncovered {
        background-color: red;
    }
}

.mcr-bg-covered {
    background: #e6f5d0;
}

.mcr-bg-uncovered {
    background: #fce1e5;
}

</style>
