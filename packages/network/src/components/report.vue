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
        padding="5px"
        gap="10px"
      >
        <div />
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

// import Util from '../utils/util.js';

// import { createEditor } from '../utils/editor.js';
// import FormatterMapping from '../utils/mapping.js';

// import formatterDataUrl from '../../../../.temp/devtools-formatter-dataurl.js';

const { VuiFlex, VuiLoading } = components;

const state = inject('state');

const summary = shallowReactive({
});

const el = ref(null);
// let $el;
// let editor;
// let workerUrl;

// const format = (type, text) => {
//     if (!workerUrl) {
//         workerUrl = new URL(formatterDataUrl());
//     }

//     return new Promise((resolve) => {
//         const worker = new Worker(workerUrl);
//         worker.onmessage = (e) => {
//             if (e.data === 'workerReady') {
//                 worker.postMessage({
//                     type,
//                     text
//                 });
//                 return;
//             }
//             resolve(e.data);
//             worker.terminate();
//         };
//         worker.onerror = (e) => {
//             console.error(e);
//             resolve();
//             worker.terminate();
//         };

//     });
// };


const showReport = () => {
    const id = state.flyoverData;
    if (!id) {
        return;
    }
    const item = state.entryMap[id];
    state.loading = true;

    Object.assign(summary, item.summary);


    state.loading = false;
};


watch(() => state.flyoverData, (v) => {
    showReport();
});

onMounted(() => {
    // $el = el.value;
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

.mcr-network-gutter {
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

.mcr-count-gutter {
    .mcr-line-count {
        padding: 0 3px;
        font-size: 12px;
        font-family: var(--font-monospace);
        text-align: right;
        background-color: #e6f5d0;
    }
}

.mcr-bg-covered {
    background: #e6f5d0;
}

.mcr-bg-uncovered {
    background: #fce1e5;
}

</style>
