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
          :class="searchClass"
          placeholder="keywords"
          :title="state.searchableTitle"
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
      @end="onFlyoverEnd"
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
    watch, onMounted, reactive, computed
} from 'vue';
import { components, generateTooltips } from 'vine-ui';
import decompress from 'lz-utils/lib/decompress.js';

import Util from './utils/util.js';
import {
    createGrid, renderGrid, updateGrid, initCustomsFormatters, showFlyover, displayFlyoverWithHash
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

const navItemClass = (item) => {
    return ['mcr-nav-item', item.classMap, item.type === state.caseType ? 'mcr-nav-selected' : ''];
};

const navItemClick = (item) => {
    if (item.type !== state.caseType) {
        state.caseType = item.type;
    }
};

const searchClass = computed(() => {
    const ls = ['mcr-search'];
    if (state.keywords) {
        ls.push('mcr-search-keywords');
    }
    return ls;
});

const getSearchableColumns = (columns) => {
    const map = {};
    Util.forEachTree(columns, (column) => {
        if (column.searchable) {
            map[column.id] = column.name;
            if (column.classMap) {
                column.classMap += ' mcr-searchable';
            } else {
                column.classMap = 'mcr-searchable';
            }
        }
    });
    return map;
};

const caseHandler = (item) => {
    if (item.subs) {
        item.collapsed = true;
    }
    item.classMap = `tg-case-${item.caseType}`;
};

const stepHandler = (item) => {
    if (item.subs) {
        item.collapsed = true;
    }
    if (item.errors) {
        item.classMap = 'tg-step-error';
    } else if (item.status === 'retry') {
        item.classMap = 'tg-step-retry';
    }
};

const tagsHandler = (tags) => {
    // tags and style
    const tagList = [];
    Object.keys(tags).forEach((tag) => {
        tagList.push({
            name: tag,
            ... tags[tag]
        });
    });

    tagList.sort((a, b) => {
        return b.value - a.value;
    });

    state.tagList = tagList;
    state.tagMap = tags;
};

const workersHandler = (workers, list) => {
    // max works, default is 4
    state.workers = workers;

    console.assert(list.length);

    // sort by timestamp
    list.sort((a, b) => {
        if (a.timestamp === b.timestamp) {
            return a.parallelIndex - b.parallelIndex;
        }
        return a.timestamp - b.timestamp;
    });

    // console.log(list);
    const time_start = list[0].timestamp;
    const time_end = list[list.length - 1].timestamp;
    const duration = time_end - time_start;
    state.parallelDuration = Util.TF(duration);
    // console.log('duration', duration);

    const point = Util.point;
    const dFixed = Util.dFixed;
    const width = 1000;
    const height = 20;

    // group by parallelIndex
    const map = new Map();
    list.forEach((item) => {
        const pi = item.parallelIndex;
        let data = map.get(pi);
        if (!data) {
            data = {
                index: pi,
                time_start,
                time_end,
                duration,
                width,
                height,
                viewBox: `0 0 ${width} ${height}`,
                list: [],
                // failed, passed ...
                types: {}
            };
            map.set(pi, data);
        }

        // console.log(item);

        const x = (item.timestamp - time_start) / duration * width;
        const w = item.duration / duration * width;
        if (w === 0) {
            return;
        }

        data.list.push({
            ... item,
            x,
            w
        });

        // bar type d list
        let ds = data.types[item.type];
        if (!ds) {
            ds = [];
            data.types[item.type] = ds;
        }

        const sw = dFixed(w);
        ds.push(`M${point(x, 0)} h${sw} v${height} h-${sw} v-${height}z`);

    });

    const workerList = [];
    map.forEach((item, k) => {
        item.bars = Object.keys(item.types).map((type) => {
            return {
                d: item.types[type].join(' '),
                color: state.colors[type]
            };
        });

        workerList.push(item);
    });

    workerList.sort((a, b) => {
        return a.index - b.index;
    });

    // console.log('workerList', workerList);

    state.workerList = workerList;

};

const initData = (reportData) => {

    const {
        columns, rows, summary, tags, workers
    } = reportData;

    const searchableColumns = getSearchableColumns(columns);
    state.searchableKeys = Object.keys(searchableColumns);
    state.searchableTitle = `searchable: ${Object.values(searchableColumns).join(', ')}`;

    // add id for summary
    Object.keys(summary).forEach((k) => {
        summary[k].id = k;
    });

    const workerList = [];

    Util.forEachTree(rows, function(item) {
        item.selectable = true;
        if (item.type === 'case') {
            summary.tests.icon = 'case';
            caseHandler(item);
            item.workers.forEach((w) => {
                workerList.push({
                    ... w,
                    title: item.title,
                    type: item.caseType
                });
            });
            return;
        }
        if (item.type === 'step') {
            summary.steps.icon = 'step';
            stepHandler(item);
            return;
        }
        summary.suites.icon = 'suite';
    });

    state.colors = {
        passed: 'green',
        failed: '#d00',
        flaky: 'orange',
        skipped: 'gray'
    };

    // summary.failed.value = 0;
    summary.passed.classMap = summary.failed.value === 0 ? 'mcr-nav-passed' : '';
    summary.flaky.classMap = summary.flaky.value > 0 ? 'mcr-nav-flaky' : 'mcr-nav-skipped';
    summary.skipped.classMap = 'mcr-nav-skipped';
    summary.failed.classMap = summary.failed.value > 0 ? 'mcr-nav-failed' : 'mcr-nav-skipped';

    const navList = Object.values(summary).filter((it) => it.type);

    const pieData = navList.filter((it) => it.type !== 'tests').map((item) => {
        return {
            id: item.type,
            name: item.name,
            value: item.value,
            percent: item.percent,
            color: state.colors[item.type]
        };
    });

    state.navList = navList;

    state.pieHeads = [summary.tests, summary.suites, summary.steps];
    state.pieData = pieData;

    summary.projects.icon = 'project';
    summary.files.icon = 'file';

    state.amounts = [
        {
            icon: 'suite',
            button: false,
            list: [
                summary.projects,
                summary.files,
                summary.describes
            ]
        },
        {
            icon: 'sort',
            button: true,
            list: [
                summary.errors,
                summary.logs,
                summary.attachments,
                summary.retries
            ]
        }
    ];

    tagsHandler(tags);
    workersHandler(workers, workerList);

};

const onMenuClick = (e) => {
    showFlyover();
};

// remove tag till flyover animation end
const onFlyoverEnd = () => {
    if (!state.flyoverVisible) {
        Util.delHash('page');
    }
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

const updateSize = () => {
    state.windowWidth = window.innerWidth;

    let flyoverWidth = '50%';
    if (state.windowWidth < 600) {
        flyoverWidth = '100%';
    } else if (state.windowWidth < 900) {
        flyoverWidth = '80%';
    } else if (state.windowWidth < 1200) {
        flyoverWidth = '60%';
    }
    state.flyoverWidth = flyoverWidth;
};

onMounted(() => {
    const reportData = JSON.parse(decompress(window.reportData));
    console.log(reportData);

    console.assert(reportData.rows.length);

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

    state.playwright = ['Playwright', reportData.version].filter((it) => it).join(' v');

    initStore();

    updateSize();

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
    --font-monospace: sfmono-regular, menlo, monaco, consolas, "Liberation Mono", "Courier New", monospace;

    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
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
    color: green;
}

.mcr-nav-passed:hover,
.mcr-nav-passed.mcr-nav-selected {
    color: #fff;
    background-color: green;
}

.mcr-nav-failed {
    color: #d00;
}

.mcr-nav-failed:hover,
.mcr-nav-failed.mcr-nav-selected {
    color: #fff;
    background-color: #d00;
}

.mcr-nav-flaky {
    color: orange;
}

.mcr-nav-flaky:hover,
.mcr-nav-flaky.mcr-nav-selected {
    color: #fff;
    background-color: orange;
}

.mcr-nav-skipped {
    color: gray;
}

.mcr-nav-skipped:hover,
.mcr-nav-skipped.mcr-nav-selected {
    color: #fff;
    background-color: gray;
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
    .tg-column-name {
        user-select: none;
    }

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
    background: #99adb6;
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

</style>
