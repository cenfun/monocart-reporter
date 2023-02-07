<template>
  <div class="mcr vui-flex-column">
    <div class="mcr-header vui-flex-row">
      <div class="mcr-title">
        <a href="./">{{ state.title }}</a>
        <span>{{ state.date }}</span>
      </div>
      <div class="vui-flex-auto" />
      <VuiFlex spacing="10px">
        <a
          class="mcr-icon mcr-icon-playwright"
          :title="state.titlePlaywright"
          href="https://github.com/microsoft/playwright"
          target="_blank"
        />
        <a
          class="mcr-icon mcr-icon-github"
          :title="state.titleReporter"
          href="https://github.com/cenfun/monocart-reporter"
          target="_blank"
        />
      </VuiFlex>
    </div>

    <div class="mcr-filter">
      <div class="mcr-summary">
        <div
          v-for="(item, i) in state.summary"
          :key="i"
          :class="summaryItemClass(item)"
          @click="summaryItemClick(item)"
        >
          <b>{{ item.name }}</b> <span>{{ item.value.toLocaleString() }}</span> <i>{{ item.percent }}</i>
        </div>
      </div>

      <div class="mcr-filter-auto" />

      <VuiFlex
        spacing="10px"
      >
        <VuiInput
          v-model="state.keywords"
          width="150px"
          class="mcr-search"
          placeholder="keywords"
        />

        <VuiSwitch v-model="state.suiteVisible">
          Suite
        </VuiSwitch>
        <VuiSwitch v-model="state.stepVisible">
          Step
        </VuiSwitch>
      </VuiFlex>
    </div>

    <div class="mcr-grid vui-flex-auto" />

    <VuiFlyover
      ref="flyover"
      position="right"
      :visible="state.flyoverVisible"
      :width="state.flyoverWidth"
    >
      <div class="vui-flyover-main vui-flex-column">
        <div class="vui-flyover-header">
          <VuiFlex spacing="10px">
            <div
              class="vui-flyover-icon"
              @click="state.flyoverVisible=false"
            >
              <div class="mcr-icon mcr-icon-arrow-right" />
            </div>
            <div class="vui-flyover-title vui-flex-auto">
              {{ state.detailTitle }}
            </div>
            <div
              class="vui-flyover-icon"
              @click="state.flyoverVisible=false"
            >
              <div class="mcr-icon mcr-icon-close" />
            </div>
          </VuiFlex>
        </div>
        <div class="vui-flyover-content vui-flex-auto">
          <CaseDetail />
        </div>
      </div>
    </VuiFlyover>
  </div>
</template>
<script setup>
import decompress from 'lz-utils/lib/decompress.js';
import { watch, onMounted } from 'vue';

import { components } from 'vine-ui';

import Util from '../util/util.js';
import {
    createGrid, renderGrid, updateGrid, displayFlyover
} from '../modules/grid.js';

import CaseDetail from './case-detail.vue';

import store from '../util/store.js';
import state from '../modules/state.js';

const {
    VuiInput,
    VuiFlex,
    VuiFlyover,
    VuiSwitch
} = components;

const initStore = () => {
    const booleans = {
        'true': true,
        'false': false
    };
    ['suiteVisible', 'stepVisible'].forEach((item) => {
        const visible = booleans[store.get(item)];
        if (typeof visible === 'boolean') {
            state[item] = visible;
        }
    });
};

const summaryItemClass = (item) => {
    return ['mcr-summary-item', item.classMap, item.caseType === state.caseType ? 'mcr-summary-selected' : ''];
};

const summaryItemClick = (item) => {
    if (item.caseType !== state.caseType) {
        state.caseType = item.caseType;
        if (item.caseType === 'all') {
            Util.delHash('caseType');
        } else {
            Util.setHash('caseType', item.caseType);
        }

    }
};

const initSummaryData = () => {

    const summary = {
        all: {
            name: 'All',
            value: 0,
            caseType: 'all'
        },
        passed: {
            name: 'Passed',
            value: 0,
            caseType: 'passed'
        },
        failed: {
            name: 'Failed',
            value: 0,
            caseType: 'failed'
        },
        flaky: {
            name: 'Flaky',
            value: 0,
            caseType: 'flaky'
        },
        skipped: {
            name: 'Skipped',
            value: 0,
            caseType: 'skipped'
        }
    };

    const caseHandler = (item) => {
        if (item.subs) {
            item.collapsed = true;
        }
        summary.all.value += 1;
        if (item.ok) {
            if (Util.isSkipped(item)) {
                summary.skipped.value += 1;
                item.classMap = 'tg-case-skipped';
                item.caseType = 'skipped';
            } else if (item.outcome === 'flaky') {
                summary.flaky.value += 1;
                item.classMap = 'tg-case-flaky';
                item.caseType = 'flaky';
            } else {
                summary.passed.value += 1;
                item.classMap = 'tg-case-passed';
                item.caseType = 'passed';
            }
        } else {
            item.classMap = 'tg-case-failed';
            item.caseType = 'failed';
            summary.failed.value += 1;
            if (parent.failedCases) {
                parent.failedCases += 1;
            } else {
                parent.failedCases = 1;
            }
        }
    };

    Util.forEachTree(state.gridDataAll.rows, function(item, i, parent) {
        item.selectable = true;
        if (item.type === 'step') {
            if (item.subs) {
                item.collapsed = true;
            }
            if (item.errors) {
                item.classMap = 'tg-step-error';
            } else if (item.status === 'retry') {
                item.classMap = 'tg-step-retry';
            }
            return;
        }

        if (item.type === 'case') {
            caseHandler(item);
        }
    });

    // percent handler
    Object.values(summary).forEach((item) => {
        if (item.value === 0 || item.caseType === 'all') {
            item.percent = '';
            return;
        }
        const p = Util.PF(item.value, summary.all.value);
        item.percent = `(${p})`;
    });

    // summary.failed.value = 0;
    summary.passed.classMap = summary.failed.value === 0 ? 'mcr-summary-passed' : '';

    summary.failed.classMap = summary.failed.value > 0 ? 'mcr-summary-failed' : 'mcr-summary-skipped';
    summary.flaky.classMap = summary.flaky.value > 0 ? 'mcr-summary-flaky' : 'mcr-summary-skipped';
    summary.skipped.classMap = 'mcr-summary-skipped';

    state.summary = summary;

};

onMounted(() => {

    const reportData = JSON.parse(decompress(window.reportData));
    console.log(reportData);

    // for get errors by index
    state.reportData = reportData;

    state.gridDataAll = {
        columns: reportData.columns,
        rows: reportData.rows
    };

    state.columns = reportData.columns;

    state.title = reportData.name;
    state.date = new Date(reportData.date).toLocaleString();
    state.titlePlaywright = ['Playwright', reportData.version].filter((it) => it).join(' v');
    initStore();

    initSummaryData();

    createGrid();
});

watch(() => state.keywords, () => {
    updateGrid();
});

watch([
    () => state.caseType,
    () => state.suiteVisible,
    () => state.stepVisible
], () => {
    renderGrid();
});

watch(() => state.flyoverVisible, () => {
    if (state.flyoverVisible) {
        if (state.caseItem) {
            Util.setHash({
                index: state.caseItem.tg_index,
                title: state.caseItem.title
            });
        }
    } else {
        Util.delHash(['index', 'title']);
    }
});

window.addEventListener('popstate', (e) => {
    const caseType = Util.getHash('caseType');
    state.caseType = caseType || 'all';
    displayFlyover();
});

window.addEventListener('resize', () => {
    state.windowWidth = window.innerWidth;
});

</script>
<style lang="scss">
@media screen and (max-width: 768px) {
    .mcr .mcr-filter {
        display: block;

        .mcr-summary {
            margin-bottom: 5px;
        }

        .mcr-filter-auto {
            display: none;
        }
    }
}

html,
body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    font-size: 14px;
    font-family: arial, sans-serif;
    overflow: hidden;
}

.mcr {
    --bg-failed: #ffebe9;
    --bg-flaky: #fcf7de;

    width: 100%;
    height: 100%;
    overflow: hidden;
}

/*
icon
*/

.mcr-icon {
    display: block;
    width: 20px;
    height: 20px;
    background-repeat: no-repeat;
    background-position: center center;
    background-size: 20px 20px;
    cursor: pointer;
    opacity: 0.8;
    overflow: hidden;
}

.mcr-icon:hover {
    opacity: 1;
}

.mcr-icon-playwright {
    background-image: url("../images/playwright.svg");
}

.mcr-icon-github {
    background-image: url("../images/github.svg");
}

.mcr-icon-close {
    background-image: url("../images/close.svg");
}

.mcr-icon-arrow-right {
    background-image: url("../images/arrow-right.svg");
}

.mcr-icon-passed {
    width: 18px;
    height: 18px;
    background-image: url("../images/passed.svg");
    background-size: 18px 18px;
    cursor: default;
    opacity: 1;
}

.mcr-icon-skipped {
    width: 18px;
    height: 18px;
    background-image: url("../images/skipped.svg");
    background-size: 18px 18px;
    cursor: default;
    opacity: 1;
}

.mcr-icon-failed {
    width: 18px;
    height: 18px;
    background-image: url("../images/failed.svg");
    background-size: 18px 18px;
    cursor: default;
    opacity: 1;
}

.mcr-icon-annotation {
    background-image: url("../images/annotation.svg");
}

.mcr-icon-info {
    background-image: url("../images/info.svg");
}

.mcr-icon-error {
    background-image: url("../images/error.svg");
}

.mcr-icon-log {
    background-image: url("../images/log.svg");
}

.mcr-icon-attachment {
    background-image: url("../images/attachment.svg");
}

.tg-cell .mcr-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.mcr-header {
    height: 45px;
    padding: 0 10px;
    color: #fff;
    line-height: 44px;
    border-bottom: 1px solid #ddd;
    background-color: #24292f;
}

.mcr-title {
    font-size: 20px;
    white-space: nowrap;
    text-overflow: ellipsis;

    a {
        color: #fff;
        text-decoration: none;
    }

    span {
        margin-left: 10px;
        color: #ccc;
        font-size: 14px;
    }
}

.mcr-filter {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid #ddd;
    overflow: hidden;
}

.mcr-summary {
    position: relative;
    display: flex;
    flex-direction: row;
    border: thin solid #6c757d;
    border-radius: 5px;
    overflow: hidden;
}

.mcr-filter-auto {
    flex: auto;
    min-width: 10px;
}

.mcr-summary-item {
    padding: 8px 10px;
    text-align: center;
    text-overflow: ellipsis;
    word-wrap: break-word;
    border-left: thin solid #6c757d;
    cursor: pointer;
    overflow: hidden;

    &:first-child {
        border-left: none;
    }

    i {
        font-size: 13px;
    }
}

.mcr-summary-item:hover,
.mcr-summary-selected {
    color: #fff;
    background-color: #6c757d;
}

.mcr-summary-passed {
    color: green;
}

.mcr-summary-passed:hover,
.mcr-summary-passed.mcr-summary-selected {
    color: #fff;
    background-color: green;
}

.mcr-summary-failed {
    color: #d00;
}

.mcr-summary-failed:hover,
.mcr-summary-failed.mcr-summary-selected {
    color: #fff;
    background-color: #d00;
}

.mcr-summary-flaky {
    color: orange;
}

.mcr-summary-flaky:hover,
.mcr-summary-flaky.mcr-summary-selected {
    color: #fff;
    background-color: orange;
}

.mcr-summary-skipped {
    color: gray;
}

.mcr-summary-skipped:hover,
.mcr-summary-skipped.mcr-summary-selected {
    color: #fff;
    background-color: gray;
}

.mcr-summary-value {
    width: 81px;
    margin: 0 auto 5px;
    padding: 5px;
    font-size: 16px;
    text-align: center;
    border-radius: 10px;
    background-color: #f5f5f5;

    span {
        display: block;
        height: 20px;
        margin-top: 3px;
        font-size: 12px;
        line-height: 20px;
    }
}

.mcr-search {
    input {
        padding-right: 23px;
        background-image: url("../images/search.svg");
        background-repeat: no-repeat;
        background-position: 97% center;
        background-size: 16px;
    }
}

.mcr-grid {
    .tg-step.tg-group.tg-row,
    .tg-case.tg-group.tg-row {
        font-weight: normal;
    }

    .tg-case-failed.tg-row {
        border: none;
        background-color: var(--bg-failed);
    }

    .tg-case-flaky.tg-row {
        border: none;
        background-color: var(--bg-flaky);
    }

    .tg-case-skipped.tg-row {
        .tg-cell {
            color: gray;
        }
    }

    .tg-step-retry.tg-row {
        .tg-cell {
            color: orange;
        }
    }

    .tg-step-error.tg-row {
        .tg-cell {
            color: red;
        }
    }

    .mcr-annotation {
        text-decoration: underline;
        cursor: pointer;
    }

    .mcr-location {
        font-weight: normal;
    }
}

/*
flyover
*/

.tg-flyover-icon {
    position: absolute;
    top: 0;
    right: 0;
    width: 20px;
    height: 100%;

    .mcr-icon {
        opacity: 1;
    }
}

.vui-flyover-main {
    height: 100%;
    overflow: hidden;
}

.vui-flyover-header {
    padding: 0 10px;
    background-color: #005ba4;
}

.vui-flyover-icon {
    padding: 9px 0;
    cursor: pointer;
}

.vui-flyover-title {
    height: 45px;
    color: #fff;
    font-weight: bold;
    font-size: 16px;
    line-height: 45px;
}

.vui-flyover-content {
    overflow: auto;
}

/*
colors
*/

.inline {
    display: inline-block;
    width: 20px;
    height: 1em;
}

.bold {
    font-weight: bold;
}

.italic {
    font-style: italic;
}

.underline {
    text-decoration: underline;
}

.blink {
    text-decoration: blink;
}

.inverse {
    background: #333;
}

.strike {
    text-decoration: line-through;
}

.c30,
.c90 {
    color: black;
}

.c31,
.c91 {
    color: red;
}

.c32,
.c92 {
    color: green;
}

.c33,
.c93 {
    color: yellow;
}

.c34,
.c94 {
    color: blue;
}

.c35,
.c95 {
    color: magenta;
}

.c36,
.c96 {
    color: cyan;
}

.c37,
.c97 {
    color: white;
}

.bg40,
.bg100 {
    background: black;
}

.bg41,
.bg101 {
    background: red;
}

.bg42,
.bg102 {
    background: green;
}

.bg43,
.bg103 {
    background: yellow;
}

.bg44,
.bg104 {
    background: blue;
}

.bg45,
.bg105 {
    background: magenta;
}

.bg46,
.bg106 {
    background: cyan;
}

.bg47,
.bg107 {
    background: white;
}

</style>
