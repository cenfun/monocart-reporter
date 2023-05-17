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
      <VuiInput
        v-model="state.keywords"
        width="100%"
        :class="searchClass"
        placeholder="keywords"
      />

      <VuiSwitch
        v-model="state.group"
        :label-clickable="true"
        label-position="right"
      >
        Group
      </VuiSwitch>

      <div class="vui-flex-auto" />

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
<script setup>
import {
    shallowReactive, onMounted, reactive, provide, watch, computed
} from 'vue';
import { Grid } from 'turbogrid';
import { components, generateTooltips } from 'vine-ui';
import inflate from 'lz-utils/inflate';
import { debounce } from 'async-tick';

import Util from './utils/util.js';
import store from '../../app/src/utils/store.js';

import Flyover from './components/flyover.vue';
import Report from './components/report.vue';

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
    topNumber: '3',

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

const searchClass = computed(() => {
    const ls = ['mcr-search'];
    if (state.keywords) {
        ls.push('mcr-search-keywords');
    }
    return ls;
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

// const hideFlyover = () => {
//     state.flyoverVisible = false;
//     state.flyoverData = null;
// };

const showFlyover = (rowItem) => {
    state.flyoverData = rowItem.id;
    state.flyoverTitle = rowItem.sourcePath;
    state.flyoverVisible = true;
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

    });
};

const getGroupRows = (summaryRows) => {
    const groups = [];

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

    const summary = {};
    calculateGroups(groups, summary);

    // console.log(summary);


    return groups;
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
        rows = rows.concat(summaryRows);
    }

    state.gridDataCache[key] = rows;

    return rows;
};


const getGridData = () => {

    const rows = getGridRows();

    const columns = [{
        id: 'name',
        name: 'File',
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
        const id = Util.uid();
        item.id = id;
        fileMap[id] = item;
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
                return Util.PF(v, 100, 2);
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
    ['group', 'topNumber'].forEach((item) => {
        // default empty string
        const v = store.get(item);
        if (!v) {
            return;
        }
        if (Util.hasOwn(mapping, v)) {
            state[item] = mapping[v];
            return;
        }
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

    state.initializing = false;
};


onMounted(() => {
    init();
});

watch(() => state.group, (v) => {
    store.set('group', v);
    renderGrid();
});

watch(() => state.topNumber, (v) => {
    store.set('topNumber', v);
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

.mcr-search {
    input {
        padding-right: 23px;
        background-image: url("../../app/src/images/search.svg");
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
