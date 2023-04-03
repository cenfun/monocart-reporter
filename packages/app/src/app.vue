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
      <div class="mcr-nav">
        <div
          v-for="(item, i) in state.navList"
          :key="i"
          :class="navItemClass(item)"
          @click="navItemClick(item)"
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

      <VuiFlex gap="10px">
        <VuiFlex
          gap="2px"
          padding="5px"
        >
          <VuiInput
            v-model="state.keywords"
            width="180px"
            :class="searchClass"
            placeholder="keywords"
          />
          <IconLabel
            icon="triangle-down"
            @click="onSearchDropdownClick($event)"
          />
        </VuiFlex>

        <VuiSwitch v-model="state.suiteVisible">
          Suite
        </VuiSwitch>
        <VuiSwitch v-model="state.stepVisible">
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
  </div>
</template>
<script setup>
import {
    watch, onMounted, reactive, computed
} from 'vue';
import { components, generateTooltips } from 'vine-ui';
import decompress from 'lz-utils/lib/decompress.js';

import Util from './utils/util.js';
import {
    createGrid, renderGrid, updateGrid, initCustomsFormatters, showFlyover, displayFlyoverWithHash, expandRowLevel
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
    VuiCheckbox
} = components;

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

const navItemClass = (item) => {
    return ['mcr-nav-item', item.classMap, item.type === state.caseType ? 'mcr-nav-selected' : ''];
};

const navItemClick = (item) => {
    if (item.id !== state.caseType) {
        state.caseType = item.id;
    }
};

const searchClass = computed(() => {
    const ls = ['mcr-search'];
    if (state.keywords) {
        ls.push('mcr-search-keywords');
    }
    return ls;
});

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

const caseHandler = (item) => {
    if (item.subs) {
        item.collapsed = true;
    }
    item.classMap = `mcr-case-${item.caseType}`;
};

const stepHandler = (item) => {
    if (item.subs) {
        item.collapsed = true;
    }
    if (item.numErrors) {
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

    const caseMap = {};

    Util.forEachTree(rows, function(item) {
        item.selectable = true;
        if (item.type === 'case') {
            summary.tests.icon = 'case';
            caseHandler(item);
            caseMap[item.caseId] = item;
            return;
        }
        if (item.type === 'step') {
            summary.steps.icon = 'step';
            stepHandler(item);
            return;
        }
        summary.suites.icon = 'suite';
    });

    state.caseMap = caseMap;
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
        state.systemList = [system, system];
    }

};

const onSearchDropdownClick = (e) => {
    state.searchDropdownVisible = true;
    state.searchDropdownTarget = e.target;
};

const onMenuClick = (e) => {
    showFlyover();
};

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

onMounted(() => {
    const reportData = JSON.parse(decompress(window.reportData));
    console.log(reportData);

    initData(reportData);

    // for export all data
    state.reportData = reportData;

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
    state.date = reportData.dateH;
    state.duration = reportData.durationH;

    initStore();

    initFlyoverSize();

    createGrid();

    initTooltip();

});

let timeout_search;
watch(() => state.keywords, () => {

    clearTimeout(timeout_search);
    timeout_search = setTimeout(() => {
        updateGrid();
    }, 200);

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
});

watch([
    () => state.caseType,
    () => state.suiteVisible,
    () => state.stepVisible
], () => {
    store.set('suiteVisible', state.suiteVisible);
    store.set('stepVisible', state.stepVisible);
    renderGrid();
});

window.addEventListener('popstate', (e) => {
    const caseType = Util.getHash('caseType');
    state.caseType = caseType || 'tests';
    displayFlyoverWithHash();
});

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

</style>
