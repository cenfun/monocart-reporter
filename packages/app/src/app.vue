<template>
  <div class="mcr vui-flex-column">
    <VuiFlex
      class="mcr-header"
      padding="10px"
      gap="10px"
      wrap
    >
      <div class="mcr-title">
        <a href="./">{{ state.title }}</a>
      </div>

      <IconLabel
        icon="calendar"
        size="16px"
        :button="false"
      >
        {{ state.date }}
      </IconLabel>

      <IconLabel
        icon="time"
        size="16px"
        :button="false"
      >
        {{ state.duration }}
      </IconLabel>

      <div class="vui-flex-auto" />

      <IconLabel
        icon="menu"
        size="20px"
        @click="onMenuClick"
      />
    </VuiFlex>

    <VuiFlex
      class="mcr-filter"
      gap="10px"
      padding="10px"
      wrap
    >
      <div class="mcr-summary">
        <div
          v-for="(item, i) in state.summary"
          :key="i"
          :class="summaryItemClass(item)"
          @click="summaryItemClick(item)"
        >
          <VuiFlex
            gap="5px"
            wrap
            center
          >
            <b>{{ item.name }}</b>
            <span>{{ item.value.toLocaleString() }}</span>
            <span v-if="item.percent">(<i>{{ item.percent }}</i>)</span>
          </VuiFlex>
        </div>
      </div>

      <div class="vui-flex-auto" />

      <VuiFlex
        gap="10px"
        padding="5px"
      >
        <VuiInput
          v-model="state.keywords"
          width="150px"
          class="mcr-search"
          placeholder="keywords"
          :tooltip="state.searchableTitle"
        />

        <VuiSwitch v-model="state.suiteVisible">
          Suite
        </VuiSwitch>
        <VuiSwitch v-model="state.stepVisible">
          Step
        </VuiSwitch>
      </VuiFlex>
    </VuiFlex>

    <div class="mcr-grid vui-flex-auto" />

    <VuiFlyover
      ref="flyover"
      position="right"
      :visible="state.flyoverVisible"
      :width="state.flyoverWidth"
    >
      <Flyover />
    </VuiFlyover>

    <VuiTooltip
      :visible="tooltip.visible"
      :target="tooltip.target"
      :text="tooltip.text"
    />
  </div>
</template>
<script setup>
import {
    watch, onMounted, reactive
} from 'vue';
import { components, generateTooltips } from 'vine-ui';
import decompress from 'lz-utils/lib/decompress.js';

import Util from './utils/util.js';
import {
    createGrid, renderGrid, updateGrid, displayFlyover, initCustomsFormatters
} from './modules/grid.js';

import Flyover from './components/flyover.vue';
import IconLabel from './components/icon-label.vue';

import store from './utils/store.js';
import state from './modules/state.js';

const {
    VuiInput,
    VuiFlex,
    VuiFlyover,
    VuiSwitch,
    VuiTooltip
} = components;

const tooltip = reactive({
    visible: false,
    target: null,
    text: ''
});

state.tooltip = tooltip;

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
    return ['mcr-summary-item', item.classMap, item.type === state.caseType ? 'mcr-summary-selected' : ''];
};

const summaryItemClick = (item) => {
    if (item.type !== state.caseType) {
        state.caseType = item.type;
        if (item.type === 'tests') {
            Util.delHash('caseType');
        } else {
            Util.setHash('caseType', item.type);
        }

    }
};

const initSummary = (rows, summary) => {

    const caseHandler = (item) => {
        if (item.subs) {
            item.collapsed = true;
        }
        if (item.ok) {
            item.okIcon = 'passed';
            if (Util.isSkipped(item)) {
                item.classMap = 'tg-case-skipped';
                item.caseType = 'skipped';
                item.okIcon = 'skipped';
            } else if (item.outcome === 'flaky') {
                item.classMap = 'tg-case-flaky';
                item.caseType = 'flaky';
            } else {
                item.classMap = 'tg-case-passed';
                item.caseType = 'passed';
            }
        } else {
            item.classMap = 'tg-case-failed';
            item.caseType = 'failed';
            item.okIcon = 'failed';
        }
    };

    const suites = {
        name: 'Suites',
        icon: 'suite',
        value: 0
    };
    const tests = {
        name: 'Tests',
        icon: 'case',
        value: 0
    };
    const steps = {
        name: 'Steps',
        icon: 'step',
        value: 0
    };
    state.testInfo.push(suites);
    state.testInfo.push(tests);
    state.testInfo.push(steps);

    Util.forEachTree(rows, function(item) {
        item.selectable = true;
        if (item.type === 'step') {
            steps.value += 1;
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
            tests.value += 1;
            caseHandler(item);
            return;
        }
        suites.value += 1;
    });

    // summary.failed.value = 0;
    summary.passed.color = 'green';
    summary.passed.classMap = summary.failed.value === 0 ? 'mcr-summary-passed' : '';

    summary.failed.color = '#d00';
    summary.failed.classMap = summary.failed.value > 0 ? 'mcr-summary-failed' : 'mcr-summary-skipped';

    summary.flaky.color = 'orange';
    summary.flaky.classMap = summary.flaky.value > 0 ? 'mcr-summary-flaky' : 'mcr-summary-skipped';

    summary.skipped.color = 'gray';
    summary.skipped.classMap = 'mcr-summary-skipped';

    const pieData = [];
    Object.keys(summary).forEach((k) => {
        if (k === 'tests') {
            return;
        }

        const item = summary[k];
        pieData.push({
            id: k,
            name: item.name,
            value: item.value,
            percent: item.percent,
            color: item.color
        });
    });

    state.summary = summary;
    state.pieData = pieData;

};

const onMenuClick = (e) => {
    state.flyoverTitle = state.title;
    state.flyoverVisible = true;
};

let timeout_tooltip;
const initTooltip = () => {
    generateTooltips((target, text) => {
        clearTimeout(timeout_tooltip);

        if (Util.isTouchDevice()) {
            return;
        }

        tooltip.visible = true;
        tooltip.target = target;
        tooltip.text = text;

        timeout_tooltip = setTimeout(() => {
            tooltip.visible = false;
            tooltip.text = '';
        }, 2000);

    }, (target) => {
        clearTimeout(timeout_tooltip);
        tooltip.visible = false;
        tooltip.text = '';
    });
};

// do not show the error if in subs
const isErrorInSubs = (i, subs) => {
    if (!Util.isList(subs)) {
        return false;
    }
    const foundItem = subs.find((item) => {
        if (Util.isList(item.errors) && item.errors.includes(i)) {
            return true;
        }
        return isErrorInSubs(i, item.subs);
    });
    if (foundItem) {
        return true;
    }
    return false;
};

const initErrors = (rows, errors) => {
    if (!Util.isList(rows)) {
        return;
    }
    rows.forEach((row) => {
        if (Util.isList(row.errors)) {
            // empty array in case to show error icon
            row.errors = row.errors.filter((i) => !isErrorInSubs(i, row.subs)).map((i) => errors[i]);
        }
        initErrors(row.subs, errors);
    });
};

const updateSize = () => {
    state.windowWidth = window.innerWidth;

    let flyoverWidth = '60%';
    if (state.windowWidth < 768) {
        flyoverWidth = '100%';
    } else if (state.windowWidth < 1024) {
        flyoverWidth = '80%';
    }
    state.flyoverWidth = flyoverWidth;
};

onMounted(() => {

    const reportData = JSON.parse(decompress(window.reportData));
    console.log(reportData);

    // init all errors (index to message)
    initErrors(reportData.rows, reportData.errors);
    initSummary(reportData.rows, reportData.summary);

    state.gridDataAll = {
        columns: reportData.columns,
        rows: reportData.rows
    };

    // for custom column  formatters
    state.formatters = reportData.formatters;

    const cloneColumns = JSON.parse(JSON.stringify(reportData.columns));
    initCustomsFormatters(cloneColumns, state.formatters);
    state.columns = cloneColumns;

    state.title = reportData.name;
    state.date = new Date(reportData.date).toLocaleString();
    state.testInfo.push({
        name: 'Date',
        icon: 'calendar',
        value: state.date
    });
    state.duration = reportData.durationH;
    state.testInfo.push({
        name: 'Duration',
        icon: 'time',
        value: state.duration
    });

    state.titlePlaywright = ['Playwright', reportData.version].filter((it) => it).join(' v');
    initStore();

    updateSize();

    createGrid();

    initTooltip();

    // setTimeout(() => {
    //     onMenuClick();
    // });
});

let timeout_search;
watch(() => state.keywords, () => {

    clearTimeout(timeout_search);
    timeout_search = setTimeout(() => {
        updateGrid();
    }, 200);

});

watch([
    () => state.caseType,
    () => state.suiteVisible,
    () => state.stepVisible
], () => {
    renderGrid();
});

watch([
    () => state.flyoverVisible,
    () => state.caseItem
], () => {
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
    state.caseType = caseType || 'tests';
    displayFlyover();
});

window.addEventListener('resize', () => {
    updateSize();
});

window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
        state.flyoverVisible = false;
    }
});

</script>
<style lang="scss">
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

a {
    color: #0d6efd;
    text-decoration: underline;
}

a:hover {
    color: #0a58ca;
}

a:not([href], [class]),
a:not([href], [class]):hover {
    color: inherit;
    text-decoration: none;
}

.mcr {
    --bg-failed: #fff0ef;
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

.mcr-icon-info {
    background-image: url("./images/info.svg");
}

.mcr-icon-ok {
    width: 18px;
    height: 18px;
    background-size: 18px 18px;
    cursor: default;
    opacity: 1;
}

.mcr-icon-type {
    width: 16px;
    height: 16px;
    background-size: 16px 16px;
    cursor: default;
    opacity: 1;
}

.mcr-header {
    color: #fff;
    background-color: #24292f;

    .mcr-title {
        font-size: 18px;
        line-height: 22px;
        white-space: nowrap;
        text-overflow: ellipsis;

        a {
            color: #fff;
            text-decoration: none;
        }
    }

    .mcr-icon-label {
        color: #ccc;
        font-size: 14px;
    }
}

.mcr-filter {
    border-bottom: 1px solid #ddd;
    overflow: hidden;
}

.mcr-summary {
    position: relative;
    display: flex;
    flex-direction: row;
    flex-shrink: 1;
    border: thin solid #6c757d;
    border-radius: 5px;
    overflow: hidden;
}

.mcr-summary-item {
    padding: 8px 10px;
    border-left: thin solid #6c757d;
    cursor: pointer;

    &:first-child {
        border-left: none;
    }

    .vui-flex {
        align-items: baseline;
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
        background-image: url("./images/search.svg");
        background-repeat: no-repeat;
        background-position: 97% center;
        background-size: 16px;
    }
}

.tg-cell .mcr-icon,
.tg-cell .mcr-icon-label {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 20px;
    height: 20px;
    transform: translate(-50%, -50%);
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

    .mcr-clickable {
        cursor: pointer;

        b {
            pointer-events: none;
        }
    }

    .mcr-location {
        font-weight: normal;
    }

    .mcr-searchable b {
        color: red;
    }

    .tg-body-message {
        .mcr-no-results {
            position: relative;
            top: 0;
            left: 0;
            margin: 10px;
            padding: 20px 20px 20px 70px;
            color: gray;
            font-size: 20px;
            border: 1px solid #ddd;
            border-radius: 10px;
            background-image: url("./images/search-results.svg");
            background-repeat: no-repeat;
            background-position: 20px center;
            background-size: 30px 30px;
            opacity: 0.8;
            transform: none;
        }
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
}

.vui-flyover-main {
    height: 100%;
    overflow: hidden;
}

.vui-flyover-header {
    color: #fff;
    background-color: #005ba4;
}

.vui-flyover-title {
    font-weight: bold;
    font-size: 16px;
    line-height: 22px;
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
