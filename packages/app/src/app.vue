<template>
  <div class="mcr vui-flex-column">
    <VuiFlex
      class="mcr-header"
      padding="10px"
      gap="10px"
      shrink
    >
      <VuiFlex
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
      </VuiFlex>

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
      shrink
    >
      <VuiButton
        v-if="state.exportSelected"
        primary
        @click="onExportClick"
      >
        Export
      </VuiButton>

      <div class="mcr-nav">
        <div
          v-for="(item, i) in state.navList"
          :key="i"
          :class="navItemClass(item)"
          @click="onNavItemClick(item)"
        >
          <VuiFlex
            gap="5px"
            wrap
            center
          >
            <b>{{ item.name }}</b>
            <span>{{ Util.NF(item.value) }}</span>
          </VuiFlex>
        </div>
      </div>

      <div class="vui-flex-auto" />

      <VuiFlex
        shrink
        gap="10px"
      >
        <VuiFlex
          gap="2px"
          padding="5px 0 5px 5px"
          shrink
        >
          <VuiInput
            v-model="state.keywords"
            width="100%"
            :class="searchClass"
            placeholder="keywords"
          />
          <IconLabel
            icon="triangle-down"
            @click="onSearchDropdownClick($event)"
          />
        </VuiFlex>
        <VuiSwitch
          v-model="state.suiteVisible"
          :label-clickable="true"
          label-position="right"
        >
          Suite
        </VuiSwitch>
        <VuiSwitch
          v-model="state.stepVisible"
          :label-clickable="true"
          label-position="right"
        >
          Step
        </VuiSwitch>
      </VuiFlex>
    </VuiFlex>

    <div class="mcr-grid vui-flex-auto" />

    <Flyover />

    <VuiPopover
      v-model="state.searchDropdownVisible"
      :target="state.searchDropdownTarget"
      positions="bottom"
      title="Searchable Fields"
      width="150px"
    >
      <VuiFlex direction="column">
        <VuiCheckbox
          v-for="(item, i) in searchable.columns"
          :key="i"
          v-model="item.checked"
        >
          {{ item.name }}
        </VuiCheckbox>
      </VuiFlex>
    </VuiPopover>

    <VuiPopover
      v-model="state.levelPopoverVisible"
      :target="state.levelPopoverTarget"
      title="Expand Levels"
      width="150px"
    >
      <VuiFlex
        direction="column"
        gap="10px"
        margin="10px 0"
      >
        <template v-if="state.suiteVisible">
          <IconLabel
            v-if="state.systemList"
            icon="shard"
            @click="expandRowLevel('shard')"
          >
            Shard
          </IconLabel>

          <IconLabel
            icon="project"
            @click="expandRowLevel('project')"
          >
            Project
          </IconLabel>

          <IconLabel
            icon="file"
            @click="expandRowLevel('file')"
          >
            File
          </IconLabel>

          <IconLabel
            icon="suite"
            @click="expandRowLevel('suite')"
          >
            Suite
          </IconLabel>
        </template>
        <IconLabel
          icon="case"
          @click="expandRowLevel('case')"
        >
          Case
        </IconLabel>
        <IconLabel
          v-if="state.stepVisible"
          icon="step"
          @click="expandRowLevel('step')"
        >
          Step
        </IconLabel>
      </VuiFlex>
    </VuiPopover>

    <VuiTooltip
      :class="tooltip.classMap"
      :visible="tooltip.visible"
      :target="tooltip.target"
      :text="tooltip.text"
      :html="tooltip.html"
    />

    <VuiDialog v-model="dialog.visible">
      <VuiFlex
        direction="column"
        gap="0"
      >
        <h3>{{ dialog.message }}</h3>
        <div>
          <VuiFlex
            gap="10px"
            padding="5px"
          >
            <VuiButton
              primary
              width="80px"
              @click="dialog.onOkClick"
            >
              {{ dialog.ok }}
            </VuiButton>
            <VuiButton
              width="80px"
              @click="dialog.onCancelClick"
            >
              Cancel
            </VuiButton>
          </VuiFlex>
        </div>
      </VuiFlex>
    </VuiDialog>

    <VuiLoading
      :visible="state.initializing"
      size="l"
      center
    />
  </div>
</template>
<script setup>
import {
    watch, onMounted, reactive, computed
} from 'vue';
import { components, generateTooltips } from 'vine-ui';
import { debounce, microtask } from 'async-tick';
import inflate from 'lz-utils/inflate';

import Util from './utils/util.js';
import {
    createGrid, renderGrid, updateGrid, initCustomsFormatters, displayFlyoverWithHash, expandRowLevel
} from './modules/grid.js';

import Flyover from './components/flyover.vue';
import IconLabel from './components/icon-label.vue';

import store from './utils/store.js';
import state from './modules/state.js';

const {
    VuiInput,
    VuiFlex,
    VuiSwitch,
    VuiPopover,
    VuiTooltip,
    VuiCheckbox,
    VuiButton,
    VuiDialog,
    VuiLoading
} = components;

// =================================================================================

const searchable = reactive({
    columns: []
});

const tooltip = reactive({
    visible: false,
    target: null,
    text: '',
    html: false
});

state.tooltip = tooltip;

const dialog = reactive({
    visible: false,
    message: '',
    ok: 'OK'
});

// =================================================================================

const navItemClass = (item) => {
    return ['mcr-nav-item', item.classMap, item.id === state.caseType ? 'mcr-nav-selected' : ''];
};

const searchClass = computed(() => {
    const ls = ['mcr-search'];
    if (state.keywords) {
        ls.push('mcr-search-keywords');
    }
    return ls;
});

// =================================================================================

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

const initSearchableColumns = (columns) => {
    Util.forEachTree(columns, (column) => {
        if (!column.searchable) {
            return;
        }
        searchable.columns.push({
            id: column.id,
            name: column.name,
            checked: true
        });
        if (column.classMap) {
            column.classMap += ' mcr-searchable';
        } else {
            column.classMap = 'mcr-searchable';
        }
    });

    state.searchableAllKeys = searchable.columns.map((it) => it.id);

};

// =================================================================================

const caseHandler = (item) => {
    // collapsed case in grid by default
    if (item.subs) {
        item.collapsed = true;
    }
    item.classMap = `mcr-case-${item.caseType}`;
};

const stepHandler = (item) => {
    // collapsed step group in grid by default
    if (item.subs) {
        item.collapsed = true;
    }
    if (item.errorNum) {
        item.classMap = 'mcr-step-error';
    } else if (item.status === 'retry') {
        item.classMap = 'mcr-step-retry';
    }
};

const initData = (reportData) => {

    const {
        columns, rows, summary, system, tags
    } = reportData;

    // init searchable info
    initSearchableColumns(columns);

    Util.forEach(rows, function(item) {
        item.selectable = true;
        if (item.type === 'case') {
            summary.tests.icon = 'case';
            caseHandler(item);
            return;
        }
        if (item.type === 'step') {
            summary.steps.icon = 'step';
            stepHandler(item);
            return;
        }
        summary.suites.icon = 'suite';
    });

    state.tagMap = tags;

    // summary.failed.value = 0;
    // summary.flaky.value = 0;

    summary.passed.classMap = (summary.failed.value === 0 && summary.passed.value > 0) ? 'mcr-nav-passed' : '';
    summary.flaky.classMap = summary.flaky.value > 0 ? 'mcr-nav-flaky' : 'mcr-nav-skipped';
    summary.skipped.classMap = 'mcr-nav-skipped';
    summary.failed.classMap = summary.failed.value > 0 ? 'mcr-nav-failed' : 'mcr-nav-skipped';

    summary.projects.icon = 'project';
    summary.files.icon = 'file';
    summary.shards.icon = 'shard';

    state.summary = summary;

    // nav
    const navList = Object.values(summary).filter((it) => it.nav);
    state.navList = navList;

    if (Array.isArray(system)) {
        state.system = system[0];
        state.systemList = system;
    } else {
        state.system = system;
        // debug
        // state.systemList = [system, system];
    }

};

// case map with tree info for detail page
const initCaseMap = (rows) => {
    rows = JSON.parse(JSON.stringify(rows));
    const detailMap = {};
    Util.forEach(rows, function(item, parent) {
        item.tg_parent = parent;
        if (parent) {
            item.tg_level = parent.tg_level + 1;
        } else {
            item.tg_level = 0;
        }
        // remove all collapsed
        if (item.collapsed) {
            item.collapsed = false;
        }
        if (item.type === 'case') {
            detailMap[item.id] = item;
        }
    });
    state.detailMap = detailMap;
};

// =================================================================================

// let timeout_tooltip;
const initTooltip = () => {
    generateTooltips((target, text) => {
        // clearTimeout(timeout_tooltip);

        if (Util.isTouchDevice()) {
            return;
        }

        tooltip.visible = true;
        tooltip.target = target;
        tooltip.text = text;

        // timeout_tooltip = setTimeout(() => {
        //     tooltip.visible = false;
        //     tooltip.text = '';
        // }, 2000);

    }, (target) => {
        //  clearTimeout(timeout_tooltip);
        tooltip.visible = false;
        tooltip.text = '';
    });
};

const initFlyoverSize = () => {
    state.windowWidth = window.innerWidth;

    let flyoverWidth = '60%';
    if (state.windowWidth < 600) {
        flyoverWidth = '100%';
    } else if (state.windowWidth < 800) {
        flyoverWidth = '80%';
    }
    state.flyoverWidth = flyoverWidth;
};

// =================================================================================

const onNavItemClick = (item) => {
    if (item.id !== state.caseType) {
        state.caseType = item.id;
    }
};

const onSearchDropdownClick = (e) => {
    state.searchDropdownVisible = true;
    state.searchDropdownTarget = e.target;
};

const onMenuClick = (e) => {
    Util.setHash('page', 'report');
};

const onExportClick = () => {

    const grid = state.grid;

    const selectedRows = grid.getSelectedRows();
    if (!selectedRows.length) {
        dialog.message = 'No rows selected, nothing to export.';
        dialog.ok = 'Continue';
        dialog.onOkClick = () => {
            dialog.visible = false;
        };
        dialog.onCancelClick = () => {
            state.exportSelected = false;
            dialog.visible = false;
        };
        dialog.visible = true;
        return;
    }

    selectedRows.sort((a, b) => {
        return a.tg_index - b.tg_index;
    });

    const excludes = ['subs', 'selected'];

    const list = selectedRows.map((item) => {
        const row = {};
        Object.keys(item).forEach((k) => {
            if (excludes.includes(k)) {
                return;
            }
            if (k.startsWith('tg_') || k.endsWith('_matched')) {
                return;
            }
            row[k] = item[k];
        });
        return row;
    });

    // console.log(list);

    const name = [state.title, state.date, 'selected-rows'].join('-').replace(/[\s:/]+/g, '-');
    Util.exportJson(list, name);

    grid.selectAll(false);
    state.exportSelected = false;

};

// =================================================================================
const init = async () => {
    initStore();

    const reportStr = await inflate(window.reportData);
    const reportData = JSON.parse(reportStr);
    console.log(reportData);

    initData(reportData);

    // for export all data JSON able
    state.reportData = reportData;

    state.gridDataAll = {
        columns: reportData.columns,
        rows: reportData.rows
    };

    initCaseMap(reportData.rows);

    // for custom column  formatters
    state.formatters = reportData.formatters;

    const cloneColumns = JSON.parse(JSON.stringify(reportData.columns));
    initCustomsFormatters(cloneColumns, state.formatters);
    state.columns = cloneColumns;

    state.title = reportData.name;
    state.date = reportData.dateH;
    state.duration = reportData.durationH;

    initFlyoverSize();

    createGrid();

    initTooltip();

    state.initializing = false;
};

onMounted(() => {
    init();
});

const updateGridAsync = debounce(updateGrid, 200);
watch(() => state.keywords, () => {
    updateGridAsync();
});

watch(() => searchable.columns, (v) => {
    state.searchableKeys = v.filter((item) => item.checked).map((item) => item.id);
    if (state.keywords) {
        updateGrid();
    }
}, {
    deep: true
});

watch(() => state.caseType, (v) => {
    if (v === 'tests') {
        Util.delHash('caseType');
    } else {
        Util.setHash('caseType', v);
        Util.delHash('page');
    }
    renderGrid();
});

watch([
    () => state.suiteVisible,
    () => state.stepVisible
], () => {
    store.set('suiteVisible', state.suiteVisible);
    store.set('stepVisible', state.stepVisible);
    renderGrid();
});

watch([
    () => state.exportSelected
], () => {
    renderGrid();
});

window.addEventListener('popstate', microtask(() => {
    const caseType = Util.getHash('caseType');
    state.caseType = caseType || 'tests';
    displayFlyoverWithHash();
}));

window.addEventListener('resize', () => {
    state.windowWidth = window.innerWidth;
    if (state.windowWidth < 600) {
        state.flyoverWidth = '100%';
    }
});

window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
        state.flyoverVisible = false;
    }
});

window.addEventListener('message', (e) => {
    const data = e.data;
    if (data && typeof data === 'object') {
        Object.assign(state, data);
    }
});
</script>
<style lang="scss">
@keyframes mcr-blink-fade-in {
    0% {
        opacity: 0;
    }

    50% {
        opacity: 0.3;
    }

    100% {
        opacity: 0;
    }
}

.mcr-blink::after {
    position: absolute;
    top: 0;
    left: 0;
    content: "";
    z-index: 10;
    width: 100%;
    height: 100%;
    background: gray;
    animation-name: mcr-blink-fade-in;
    animation-duration: 0.3s;
    animation-timing-function: linear;
}

html {
    height: 100%;
}

body {
    --font-monospace: sfmono-regular, menlo, monaco, consolas, "Liberation Mono", "Courier New", monospace;
    --bg-failed: #fff0ef;
    --bg-flaky: #fcf7de;
    --color-passed: green;
    --color-failed: #d00;
    --color-flaky: orange;
    --color-skipped: gray;

    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    color: #333;
    font-size: 14px;
    font-family: arial, sans-serif;
    overflow: hidden;
}

svg {
    display: block;
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
    width: 100%;
    height: 100%;
    overflow: hidden;

    .mcr-searchable b {
        color: red;
    }
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

.mcr-icon-open {
    background-image: url("./images/open.svg");
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

.mcr-nav {
    position: relative;
    display: flex;
    flex-direction: row;
    flex-shrink: 1;
    border: thin solid #6c757d;
    border-radius: 5px;
    overflow: hidden;
}

.mcr-nav-item {
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

.mcr-nav-item:hover,
.mcr-nav-selected {
    color: #fff;
    background-color: #6c757d;
}

.mcr-nav-passed {
    color: var(--color-passed);
}

.mcr-nav-passed:hover,
.mcr-nav-passed.mcr-nav-selected {
    color: #fff;
    background-color: var(--color-passed);
}

.mcr-nav-failed {
    color: var(--color-failed);
}

.mcr-nav-failed:hover,
.mcr-nav-failed.mcr-nav-selected {
    color: #fff;
    background-color: var(--color-failed);
}

.mcr-nav-flaky {
    color: var(--color-flaky);
}

.mcr-nav-flaky:hover,
.mcr-nav-flaky.mcr-nav-selected {
    color: #fff;
    background-color: var(--color-flaky);
}

.mcr-nav-skipped {
    color: var(--color-skipped);
}

.mcr-nav-skipped:hover,
.mcr-nav-skipped.mcr-nav-selected {
    color: #fff;
    background-color: var(--color-skipped);
}

.mcr-nav-value {
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

.mcr-search-keywords {
    input {
        border-color: #80bdff;
        outline: 0;
        box-shadow: 0 0 0 0.2rem rgb(0 123 255 / 25%);
    }
}

.mcr-case-failed {
    background-color: var(--bg-failed);
}

.mcr-case-flaky {
    background-color: var(--bg-flaky);
}

.mcr-step-retry,
.mcr-step-retry.tg-row .tg-cell {
    color: var(--color-flaky);
}

.mcr-step-error,
.mcr-step-error.tg-row .tg-cell {
    color: var(--color-failed);
}

.mcr-grid {
    .tg-column-name {
        user-select: none;
    }

    // group normal by row type
    .tg-step.tg-group.tg-row,
    .tg-case.tg-group.tg-row {
        font-weight: normal;
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

    // only grid tests type
    .mcr-case-skipped.tg-row .tg-cell {
        color: var(--color-skipped);
    }

    .mcr-clickable {
        cursor: pointer;
    }

    .mcr-location {
        font-weight: normal;
    }
}

.mcr-percent-chart {
    position: relative;
    display: inline-block;
    width: 100%;
    height: 10px;
    box-sizing: border-box;
    border-radius: 3px;
    background-color: #ee442f;
    overflow: hidden;
}

.mcr-percent-chart::after {
    position: absolute;
    top: 0;
    left: 0;
    content: "";
    width: var(--mcr-percent);
    height: 100%;
    background-color: #4d9221;
}

.mcr-tag {
    display: inline-block;
    min-width: 20px;
    min-height: 20px;
    padding: 0 5px;
    color: #fff;
    font-weight: normal;
    line-height: 20px;
    text-align: center;
    border-radius: 5px;
    background: gray;
}

.mcr-num {
    display: inline-block;
    min-width: 18px;
    min-height: 18px;
    padding: 0 5px;
    color: #fff;
    font-weight: normal;
    font-size: 12px;
    font-family: Arial, Helvetica, sans-serif;
    line-height: 18px;
    text-align: center;
    border-radius: 10px;
    background: #7e939c;
}

.mcr-count {
    position: relative;
    padding-left: 15px;

    &::before {
        position: absolute;
        top: 0;
        left: 6px;
        content: "x";
        color: #fff;
    }
}

.mcr-readme {
    code {
        margin: 0;
        padding: 0.2em 0.4em;
        font-size: 85%;
        font-family: var(--font-monospace);
        white-space: break-spaces;
        border-radius: 6px;
        background-color: rgb(175 184 193 / 20%);
    }
}

.mcr-item {
    position: relative;
    display: inline-block;
    min-height: 20px;
    margin: 0;
    padding-left: 15px;
    line-height: 20px;

    &::before {
        position: absolute;
        top: 8px;
        left: 2px;
        content: "";
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background-color: #333;
    }
}

</style>
