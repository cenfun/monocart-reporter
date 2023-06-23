<script setup>
import {
    shallowReactive, onMounted, reactive, provide, watch
} from 'vue';
import { components, generateTooltips } from 'vine-ui';
import {
    Grid, inflate, microtask, debounce, hash, store, setFavicon
} from 'monocart-common';

import Util from './utils/util.js';

import Flyover from './components/flyover.vue';
import Report from './components/report.vue';
import IconLabel from './components/icon-label.vue';

const {
    VuiFlex,
    VuiInput,
    VuiSwitch,
    VuiTooltip,
    VuiLoading
} = components;

// =================================================================================
// do not use reactive for grid data
const state = shallowReactive({
    title: 'Coverage Report',
    summary: {},

    group: true,
    formatted: false,

    keywords: '',

    watermarks: [50, 80],
    watermarkLow: true,
    watermarkMedium: true,
    watermarkHigh: true,

    windowWidth: window.innerWidth,

    // flyover detail
    flyoverVisible: false,
    flyoverWidth: '60%',
    flyoverTitle: '',
    flyoverComponent: '',
    flyoverData: null,

    grid: null,
    gridDataCache: {},

    loading: false,
    initializing: true

});

provide('state', state);

const tooltip = reactive({
    visible: false,
    target: null,
    text: '',
    html: false
});


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

const hideTooltip = () => {
    if (Util.isTouchDevice()) {
        return;
    }

    if (state.tooltip) {
        state.tooltip.visible = false;
        state.tooltip.text = '';
        state.tooltip.html = false;
        state.tooltip.classMap = '';
    }
};

const showTooltip = (elem, text, html) => {
    if (Util.isTouchDevice()) {
        return;
    }

    hideTooltip();

    if (!text) {
        return;
    }
    if (state.tooltip) {
        state.tooltip.target = elem;
        state.tooltip.text = text;
        state.tooltip.html = html;
        state.tooltip.classMap = 'mcr-searchable';
        state.tooltip.visible = true;
    }

};

const isNodeTruncated = (node) => {
    if (!node) {
        return false;
    }
    node = node.querySelector('.tg-tree-name') || node;
    if (node.clientWidth < node.scrollWidth) {
        return true;
    }
    return false;
};

// =================================================================================

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

const hideFlyover = () => {
    state.flyoverVisible = false;
    state.flyoverData = null;
};

const showFlyover = (rowItem) => {
    state.flyoverData = rowItem.id;
    state.flyoverTitle = rowItem.sourcePath;
    state.flyoverVisible = true;
    hash.set('page', rowItem.id);
};

const displayFlyoverWithHash = () => {

    const page = hash.get('page');
    if (page) {
        const grid = state.grid;
        if (grid) {
            const rowItem = grid.getRowItemById(page);
            if (rowItem) {
                grid.scrollRowIntoView(rowItem);
                grid.setRowSelected(rowItem);
                showFlyover(rowItem);
                return;
            }
        }
    }

    hideFlyover();

};

// =================================================================================

const bindGridEvents = (grid) => {

    grid.bind('onCellMouseEnter', (e, d) => {
        const cellNode = d.cellNode;
        if (isNodeTruncated(cellNode)) {
            const text = cellNode.innerText;
            showTooltip(cellNode, text);
        }
    }).bind('onCellMouseLeave', (e, d) => {
        hideTooltip();
    });

    grid.bind('onClick', (e, d) => {

        const {
            cellNode, rowItem, columnItem
        } = d;

        if (!cellNode) {
            return;
        }

        if (rowItem.isSummary || rowItem.subs) {
            return;
        }

        grid.setRowSelected(rowItem);

        if (state.flyoverVisible) {
            showFlyover(rowItem);
            return;
        }
        if (columnItem.id === 'name') {
            showFlyover(rowItem);
        }

    });

    grid.bind('onFirstUpdated', (e) => {
        displayFlyoverWithHash();
    });
};

const mergeSingleSubGroups = (item) => {

    if (!item.subs) {
        return;
    }
    if (item.subs.length === 1) {
        const sub = item.subs[0];
        if (!sub.subs) {
            return;
        }
        item.name = [item.name, sub.name].filter((it) => it).join('/');
        item.subs = sub.subs;
        mergeSingleSubGroups(item);
        return;
    }

    item.subs.forEach((sub) => {
        mergeSingleSubGroups(sub);
    });

};

// calculate groups
const calculateGroups = (list, parent) => {
    if (!list) {
        return;
    }
    if (typeof parent.total !== 'number') {
        parent.total = 0;
        parent.covered = 0;
        parent.uncovered = 0;
    }
    list.forEach((item) => {
        if (typeof item.total !== 'number') {
            calculateGroups(item.subs, item);
        }
        parent.total += item.total;
        parent.covered += item.covered;
        parent.uncovered += item.uncovered;
    });
    parent.pct = Util.PNF(parent.covered, parent.total, 2);
    parent.percentChart = Util.generatePercentChart(parent.pct);
    parent.status = Util.getStatus(parent.pct, state.watermarks);
    parent.pctClassMap = `mcr-${parent.status}`;
};

const getGroupRows = (summaryRows) => {
    let groups = [];

    summaryRows.forEach((summaryItem) => {
        const sourcePath = summaryItem.sourcePath;
        const pathList = sourcePath.split('/');

        const lastName = pathList.pop();

        let subs = groups;
        pathList.forEach((key) => {
            const item = subs.find((it) => it.name === key && it.subs);
            if (item) {
                subs = item.subs;
                return;
            }
            const sub = {
                name: key,
                subs: []
            };
            subs.push(sub);
            subs = sub.subs;
        });

        subs.push({
            ... summaryItem,
            name: lastName
        });

    });

    const group = {
        subs: groups
    };
    mergeSingleSubGroups(group);

    if (group.name) {
        groups = [group];
    }

    const summary = {};
    calculateGroups(groups, summary);
    // console.log(summary);

    return groups;
};

const getFlatRows = (summaryRows) => {
    const flatRows = [];
    summaryRows.forEach((item) => {
        const sourcePath = item.sourcePath;
        const pathList = sourcePath.split('/');

        const lastName = pathList.pop();
        const dir = pathList.pop();
        if (item.type) {
            item.name = lastName;
        } else if (dir) {
            item.name = `${dir}/${lastName}`;
        }

        flatRows.push(item);

    });

    return flatRows;
};

const getGridRows = () => {
    const key = ['grid', state.group].join('-');
    // console.log(key);

    const cacheRows = state.gridDataCache[key];
    if (cacheRows) {
        return cacheRows;
    }

    const { summary, files } = state.reportData;

    const summaryRows = files.map((it) => {
        return {
            id: it.id,
            sourcePath: it.sourcePath,
            pctClassMap: `mcr-${it.summary.status}`,
            ... it.summary
        };
    });

    // sort before summary
    summaryRows.sort((a, b) => {
        return b.uncovered - a.uncovered;
    });

    let rows = [{
        name: 'Summary',
        type: '',
        url: '',
        isSummary: true,
        classMap: 'mcr-row-summary',
        pctClassMap: `mcr-${summary.status}`,
        sortFixed: 'top',
        ... summary
    }];
    if (state.group) {
        rows = rows.concat(getGroupRows(summaryRows));
    } else {
        rows = rows.concat(getFlatRows(summaryRows));
    }

    state.gridDataCache[key] = rows;

    return rows;
};


const getGridData = () => {

    const rows = getGridRows();

    const columns = [{
        id: 'name',
        name: 'File',
        width: 350,
        maxWidth: 1230,
        classMap: 'mcr-column-name'
    }, {
        id: 'pct',
        name: 'Coverage',
        align: 'right',
        formatter: 'percent'
    }, {
        id: 'percentChart',
        name: '',
        width: 110
    }, {
        id: 'type',
        name: 'Type',
        align: 'center',
        width: 60
    }, {
        id: 'total',
        name: 'Total Bytes',
        align: 'right',
        width: 88,
        formatter: 'bytes'
    }, {
        id: 'covered',
        name: 'Covered',
        align: 'right',
        width: 88,
        formatter: 'bytes'
    }, {
        id: 'uncovered',
        name: 'Uncovered',
        align: 'right',
        width: 88,
        formatter: 'bytes'
    }, {
        id: 'url',
        name: 'URL',
        width: 350,
        maxWidth: 2000,
        formatter: 'url'
    }];

    return {
        columns,
        rows
    };

};

const watermarkFilter = (status) => {
    if (!status) {
        return true;
    }
    const map = {
        low: state.watermarkLow,
        medium: state.watermarkMedium,
        high: state.watermarkHigh
    };
    if (map[status]) {
        return true;
    }
    return false;
};

const searchHandler = (rowItem) => {

    const watermarkGate = watermarkFilter(rowItem.status);
    if (!watermarkGate) {
        return;
    }

    const keywords = state.keywords.trim().toLowerCase();
    if (!keywords) {
        return true;
    }
    const keywordList = keywords.split(/\s+/g);
    const value = rowItem.name;
    for (const item of keywordList) {
        if (value.indexOf(item) !== -1) {
            return true;
        }
        if (value.toLowerCase().indexOf(item.toLowerCase()) !== -1) {
            return true;
        }
    }
};

const initData = () => {
    const { summary, files } = state.reportData;

    const fileMap = {};
    files.forEach((item) => {
        // init percentChart
        item.summary.percentChart = Util.generatePercentChart(item.summary.pct);
        if (fileMap[item.id]) {
            console.error(`duplicate id: ${item.id} '${fileMap[item.id].url}' => '${item.url}'`);
        }
        fileMap[item.id] = item;
    });
    state.fileMap = fileMap;

    summary.percentChart = Util.generatePercentChart(summary.pct);

};

const initGrid = () => {
    const grid = new Grid('.mcr-coverage-grid');
    state.grid = grid;
    bindGridEvents(grid);

    let rowNumber = 1;
    const options = {
        bindWindowResize: true,
        scrollbarRound: true,
        textSelectable: false,
        collapseAllVisible: true,
        rowHeight: 36,
        selectMultiple: false,
        // sortField: 'uncovered',
        // sortAsc: false,
        // sortOnInit: true,
        frozenColumn: 0,
        rowFilter: searchHandler,
        rowNumberVisible: true,
        rowNumberFilter: (rowItem) => {
            if (!rowItem.isSummary && !rowItem.subs) {
                return rowNumber++;
            }
        },
        rowNotFound: 'No Results'
    };
    grid.setFormatter({
        bytes: (v, rowItem, columnItem) => {
            if (typeof v === 'number') {

                const str = Util.NF(v);
                const bytes = Util.BSF(v);

                if (columnItem.id === 'total') {
                    return `<span tooltip="Total ${bytes}">${str}</span>`;
                }

                if (columnItem.id === 'covered') {
                    if (v > 0) {
                        return `<span tooltip="Covered ${bytes}" class="mcr-covered">${str}</span>`;
                    }
                }

                if (columnItem.id === 'uncovered') {
                    if (v > 0) {
                        return `<span tooltip="Uncovered ${bytes}" class="mcr-uncovered">${str}</span>`;
                    }
                }

                return str;
            }
            return v;
        },
        percent: (v) => {
            if (typeof v === 'number') {
                return Util.PF(v, 100);
            }
            return v;
        },
        url: (v) => {
            if (v) {
                return `<a href="${v}" target="_blank">${v}</a>`;
            }
            return v;
        }
    });
    grid.setOption(options);
    grid.setData(getGridData());
    grid.render();
};

const renderGrid = () => {
    if (state.grid) {
        state.grid.setData(getGridData());
        state.grid.render();
    }
};

const updateGrid = () => {
    if (state.grid) {
        state.grid.update();
    }
};

// =================================================================================

const initStore = () => {
    const mapping = {
        'true': true,
        'false': false
    };
    ['group', 'formatted'].forEach((item) => {
        // default empty string
        const v = store.get(item);
        console.log(item, v);
        if (!v) {
            return;
        }
        if (Util.hasOwn(mapping, v)) {
            state[item] = mapping[v];
            return;
        }
        console.log(item, v);
        state[item] = v;
    });
};

const init = async () => {
    initStore();

    const reportStr = await inflate(window.reportData);
    const reportData = JSON.parse(reportStr);
    console.log(reportData);

    // for export all data JSON able
    state.reportData = reportData;
    state.title = reportData.title;
    state.watermarks = reportData.watermarks;

    initTooltip();

    initFlyoverSize();

    initData();

    initGrid();

    setFavicon();

    state.initializing = false;
};


onMounted(() => {
    init();
});

watch(() => state.group, (v) => {
    store.set('group', v);
    renderGrid();
});

watch(() => state.formatted, (v) => {
    store.set('formatted', v);
});

const updateGridAsync = debounce(updateGrid, 200);
watch([
    () => state.keywords,
    () => state.watermarkLow,
    () => state.watermarkMedium,
    () => state.watermarkHigh
], () => {
    updateGridAsync();
});

window.addEventListener('popstate', microtask(() => {
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
      </VuiFlex>

      <div class="vui-flex-auto" />
    </VuiFlex>

    <VuiFlex
      class="mcr-filter"
      padding="10px"
      gap="10px"
      wrap
    >
      <div class="mcr-search-holder vui-flex-auto">
        <VuiFlex
          gap="10px"
          shrink
        >
          <div class="mcr-search">
            <VuiInput
              v-model="state.keywords"
              width="100%"
              :class="state.keywords?'mcr-search-keywords':''"
            />
            <IconLabel
              class="mcr-search-icon"
              icon="search"
              :button="false"
            />
            <IconLabel
              v-if="state.keywords"
              class="mcr-search-clear"
              icon="close"
              @click="state.keywords = ''"
            />
          </div>
          <VuiSwitch
            v-model="state.group"
            :label-clickable="true"
            label-position="right"
          >
            Group
          </VuiSwitch>
        </VuiFlex>
      </div>

      <VuiFlex class="mcr-watermarks">
        <VuiFlex
          class="mcr-low"
          gap="5px"
        >
          <VuiSwitch
            v-model="state.watermarkLow"
            :label-clickable="true"
            width="22px"
            height="15px"
          >
            low
          </VuiSwitch>
        </VuiFlex>

        <VuiFlex
          class="mcr-medium"
          gap="5px"
        >
          <div class="mcr-watermarks-value">
            {{ state.watermarks[0] }}
          </div>
          <VuiSwitch
            v-model="state.watermarkMedium"
            :label-clickable="true"
            width="22px"
            height="15px"
          >
            medium
          </VuiSwitch>
        </VuiFlex>

        <VuiFlex
          class="mcr-high"
          gap="5px"
        >
          <div class="mcr-watermarks-value">
            {{ state.watermarks[1] }}
          </div>
          <VuiSwitch
            v-model="state.watermarkHigh"
            :label-clickable="true"
            width="22px"
            height="15px"
          >
            high
          </VuiSwitch>
        </VuiFlex>
      </VuiFlex>
    </VuiFlex>

    <div class="mcr-coverage-grid vui-flex-auto" />

    <Flyover>
      <Report />
    </Flyover>

    <VuiTooltip
      :class="tooltip.classMap"
      :visible="tooltip.visible"
      :target="tooltip.target"
      :text="tooltip.text"
      :html="tooltip.html"
    />

    <VuiLoading
      :visible="state.initializing"
      size="l"
      center
    />
  </div>
</template>

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
}

.mcr-filter {
    border-bottom: 1px solid #ddd;
}

.mcr-search-holder {
    min-width: 150px;
}

.mcr-search {
    position: relative;
    width: 100%;
    max-width: 350px;
    padding: 5px;

    input {
        height: 30px;
        padding-right: 30px;
        padding-left: 30px;
        border-radius: 10px;
    }
}

.mcr-search-icon {
    position: absolute;
    top: 50%;
    left: 13px;
    color: gray;
    transform: translate(0, -50%);
}

.mcr-search-clear {
    position: absolute;
    top: 50%;
    right: 13px;
    transform: translate(0, -50%);
}

.mcr-search-keywords {
    input {
        border-color: #80bdff;
        outline: 0;
        box-shadow: 0 0 0 0.2rem rgb(0 123 255 / 25%);
    }
}

.mcr-column-name {
    text-decoration: underline;
    cursor: pointer;
}

.tg-group {
    .mcr-column-name {
        text-decoration: none;
        cursor: default;
    }
}

.mcr-row-summary {
    font-weight: bold;
    background-color: #f5f5f5;

    .mcr-column-name {
        text-decoration: none;
        cursor: default;
    }
}

.mcr-low {
    background: #fce1e5;
}

.mcr-medium {
    background: #fff4c2;
}

.mcr-high {
    background: #e6f5d0;
}

.mcr-watermarks {
    position: relative;
    border: 1px solid #ccc;
    border-radius: 10px;

    .mcr-low,
    .mcr-medium,
    .mcr-high {
        padding: 5px 20px;
        overflow: visible;
    }

    .mcr-low {
        padding-left: 10px;
    }

    .mcr-high {
        padding-right: 10px;
    }

    .mcr-watermarks-value {
        position: absolute;
        left: 0;
        z-index: 10;
        padding: 2px 5px;
        font-size: 11px;
        font-family: Arial, sans-serif;
        border-radius: 5px;
        background-color: #fff;
        transform: translateX(-50%);
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

</style>
