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
    shallowReactive, onMounted, reactive, provide
} from 'vue';
import { Grid } from 'turbogrid';
import { components, generateTooltips } from 'vine-ui';
import inflate from 'lz-utils/inflate';

import Util from './utils/util.js';

import Flyover from './components/flyover.vue';
import Report from './components/report.vue';

const {
    VuiFlex,
    VuiTooltip,
    VuiLoading
} = components;

// =================================================================================
// do not use reactive for grid data
const state = shallowReactive({
    title: '',
    summary: {},

    windowWidth: window.innerWidth,

    // flyover detail
    flyoverVisible: false,
    flyoverWidth: '60%',
    flyoverTitle: '',
    flyoverComponent: '',
    flyoverData: null,

    grid: null,

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

// const hideFlyover = () => {
//     state.flyoverVisible = false;
//     state.flyoverData = null;
// };

const showFlyover = (rowItem) => {
    state.flyoverData = rowItem.id;
    state.flyoverTitle = rowItem.name;
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

        if (rowItem.isSummary) {
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

const getGridData = () => {
    const { summary, files } = state.reportData;

    // init uncovered and percentChart
    files.forEach((item) => {
        item.summary.percentChart = Util.generatePercentChart(item.summary.pct);
    });
    summary.percentChart = Util.generatePercentChart(summary.pct);

    const fileMap = {};

    const rows = files.map((item) => {
        const fileSummary = item.summary;
        const id = Util.uid();
        const row = {
            id,
            ... fileSummary
        };

        fileMap[id] = item;

        return row;
    });

    state.fileMap = fileMap;

    const options = {};
    if (rows.length > 1) {
        const rowSummary = {
            name: 'Summary',
            type: '',
            url: '',
            isSummary: true,
            classMap: 'mcr-row-summary',
            ... summary
        };
        options.frozenRow = 0;
        rows.unshift(rowSummary);
    }

    rows.forEach((item) => {
        item.pctClassMap = `mcr-${item.status}`;
    });

    rows.sort((a, b) => {
        return b.uncovered - a.uncovered;
    });

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
        options,
        columns,
        rows
    };

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
        rowNumberVisible: true,
        rowNumberFilter: (rowItem) => {
            if (!rowItem.isSummary) {
                return rowNumber++;
            }
        }
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

// =================================================================================
const init = async () => {
    const reportStr = await inflate(window.reportData);
    const reportData = JSON.parse(reportStr);
    console.log(reportData);

    // for export all data JSON able
    state.reportData = reportData;
    state.title = reportData.title;

    initTooltip();

    initFlyoverSize();

    initGrid();

    state.initializing = false;
};


onMounted(() => {
    init();
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

.mcr-column-name {
    text-decoration: underline;
    cursor: pointer;
}

.mcr-row-summary {
    background-color: #f8f8f8;

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
