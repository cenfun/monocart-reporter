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

import beautify from 'js-beautify';

// import Util from '../utils/util.js';

import { createEditor } from './editor.js';

const { VuiFlex, VuiLoading } = components;

const state = inject('state');

const el = ref(null);
let $el;
let editor;

// const encodeHtml = (code) => {
//     code = code.replace(/</g, '&lt;');
//     code = code.replace(/>/g, '&gt;');
//     return code;
// str = str.replace(/\n?\s?\/\*mcr_token_s\*\/\s?\n?/g, '<span class="mcr-covered">');
// str = str.replace(/\n?\s?\/\*mcr_token_e\*\/\s?\n?/g, '</span>');
// };

const getCssReport = (item) => {

    const source = item.text;

    const ranges = item.ranges;
    const list = [];
    let pos = 0;
    ranges.forEach(function(range) {
        if (range.start > pos) {
            const f = source.slice(pos, range.start);
            list.push(f);
        }
        const t = source.slice(range.start, range.end);
        list.push(`/*mcr_token_s*/${t}/*mcr_token_e*/`);
        pos = range.end;
    });

    if (pos < source.length) {
        list.push(source.slice(pos));
    }

    let code = list.join('');

    code = beautify.css(code);

    return {
        code
    };
};

const getJsReport = (item) => {
    const source = item.source;

    let code = source;
    code = beautify.js(code);

    return {
        code
    };
};

const getReport = (item) => {
    if (item.report) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(item.report);
            });
        });
    }

    if (item.type === 'css') {
        const report = getCssReport(item);
        item.report = report;
        return report;
    }
    const report = getJsReport(item);
    item.report = report;
    return report;
};

const showReport = async () => {
    const id = state.flyoverData;
    if (!id) {
        return;
    }
    const item = state.fileMap[id];
    state.language = `language-${item.type}`;
    state.loading = true;

    const report = await getReport(item);

    const content = report.code;

    if (editor) {
        editor.showContent(content);
    } else {
        editor = createEditor($el, content);
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
