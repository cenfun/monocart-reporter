<template>
  <VuiFlex
    direction="column"
    class="mcr-report"
  >
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
    ref, watch, inject, onMounted
} from 'vue';

import { components } from 'vine-ui';
// import { microtask } from 'async-tick';

// import Util from '../utils/util.js';

import { createEditor } from '../utils/editor.js';
import FormatterSourceMapping from '../utils/formatter-source-mapping.js';

import formatterDataUrl from '../../../../.temp/devtools-formatter-dataurl.js';

const { VuiFlex, VuiLoading } = components;

const state = inject('state');

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

const rangeLinesHandler = (formattedMapping, start, end, lines) => {
    const [sLine] = formattedMapping.positionToFormatted(start);
    const [eLine, eColumn] = formattedMapping.positionToFormatted(end);

    // console.log(start, sLine, sColumn);
    // console.log(end, eLine, eColumn);

    lines.push(sLine);

    if (eLine > sLine) {

        for (let i = sLine + 1; i < eLine; i++) {
            lines.push(i);
        }

        if (eColumn > 0) {
            lines.push(eLine);
        }

    }
};

const getRanges = (item, text, content, mapping) => {


    const formattedMapping = new FormatterSourceMapping(text, content, mapping);

    // css, text, ranges: [ {start, end} ]
    // js, source, functions:[ {functionName, isBlockCoverage, ranges: [{startOffset, endOffset, count}] } ]
    if (item.type === 'css') {
        const lines = [];
        const ranges = item.ranges;
        if (ranges) {
            ranges.forEach((range) => {
                const { start, end } = range;
                rangeLinesHandler(formattedMapping, start, end, lines);
            });
        }
        return {
            type: 'covered',
            lines
        };
    }

    const lines = [];
    const functions = item.functions;
    if (functions) {
        functions.forEach((fun) => {
            const ranges = fun.ranges;
            if (ranges) {
                ranges.forEach((range) => {
                    if (range.count === 0) {
                        const { startOffset, endOffset } = range;
                        rangeLinesHandler(formattedMapping, startOffset, endOffset, lines);
                    }
                });
            }
        });
    }

    return {
        type: 'uncovered',
        lines
    };

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
    const ranges = getRanges(item, text, content, mapping);

    const report = {
        ranges,
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

    .mcr-line-uncovered {
        background-color: red;
    }
}

</style>
