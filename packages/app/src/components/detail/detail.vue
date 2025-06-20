<script setup>
import {
    createApp, h, watch, shallowReactive, onMounted, nextTick
} from 'vue';
import { components } from 'vine-ui';
import { Grid } from 'turbogrid';
import { microtask } from '../../common/common.js';

import Util from '../../utils/util.js';
import state from '../../modules/state.js';
import { initDataColumns, getPositionId } from '../../modules/detail.js';
import emitter from '../../modules/emitter.js';
import { renderMermaid } from '../../modules/mermaid.js';

import IconLabel from '../icon-label.vue';
import DetailInfo from './detail-info.vue';

import 'github-markdown-css/github-markdown-light.css';

const {
    VuiFlex, VuiSwitch, VuiInput
} = components;

const data = shallowReactive({
    hasFailed: false
});

const gridDataCache = {};
const suiteCache = {};

// ===========================================================================

const createDetailInfo = (rowItem, columnItem, cellNode) => {

    const container = cellNode.querySelector('.tg-tree-name');

    if (container) {
        createApp({
            render() {
                return h(DetailInfo, {
                    rowItem,
                    columnItem
                });
            }
        }).mount(container);
    }
};

const updateColumnWidth = function(grid) {
    const titleColumn = grid.getColumnItem('title');
    const containerWidth = grid.containerWidth;
    // 5px padding right
    let otherWidth = 5;
    grid.viewColumns.forEach(function(item) {
        if (item.id === 'title') {
            return;
        }
        otherWidth += item.width;
    });

    // console.log(containerWidth, grid.getScrollbarWidth());

    const titleWidth = containerWidth - otherWidth - grid.getScrollbarWidth();
    // console.log(titleWidth);
    if (titleWidth === titleColumn.width) {
        return;
    }

    // console.log(`updateWidth: ${titleWidth}`);
    grid.setColumnWidth(titleColumn, titleWidth);

};

const addHighlight = (rowItem) => {
    removeHighlight();
    if (data.grid && rowItem) {
        data.grid.setRowState(rowItem, 'highlight', true);
        data.highlightRow = rowItem;
    }
};

const removeHighlight = () => {
    if (data.grid && data.highlightRow) {
        data.grid.setRowState(data.highlightRow, 'highlight', false);
        data.highlightRow = null;
    }
};

const getGrid = () => {
    if (data.grid) {
        return data.grid;
    }

    const grid = new Grid(document.querySelector('.mcr-overview-grid'));
    data.grid = grid;

    grid.bind('onResize onLayout', function(e, d) {
        updateColumnWidth(grid);
    });

    grid.bind('onUpdated', (e, d) => {
        nextTick(() => {
            renderMermaid();
        });
    });

    grid.bind('onClick', (e, d) => {
        removeHighlight();
    });

    grid.setOption({

        headerVisible: false,

        bindContainerResize: true,
        bindWindowResize: true,

        scrollbarRound: true,
        textSelectable: true,

        rowCacheLength: 30,
        rowHeight: 36,
        rowNotFound: 'No Results',
        cellResizeObserver: (rowItem, columnItem) => {
            if (columnItem.id === 'title' && rowItem.hasDetails) {
                return true;
            }
        },

        highlightKeywords: {
            textGenerator: (rowItem, id) => {
                const list = [rowItem.title];

                if (rowItem.type === 'case') {
                    list.push(rowItem.tags);
                    list.push(rowItem.caseType);
                } else if (rowItem.type === 'details') {
                    list.push(rowItem.content);
                }

                const simpleList = rowItem.tg_simpleList;
                if (simpleList) {
                    simpleList.forEach((it) => {
                        list.push(it.title);
                        list.push(it.content);
                    });
                }

                return list.join('');
            }
        },

        rowFilter: function(rowItem) {
            // search title and errors
            const hasMatched = this.highlightKeywordsFilter(rowItem, ['title'], data.keywords);

            if (hasMatched) {

                if (data.hasFailed && state.onlyFailedSteps) {
                    if (rowItem.errorNum) {
                        return true;
                    }

                    return false;
                }

            }

            return hasMatched;
        },
        columnTypes: {
            title: 'tree'
        }
    });

    grid.setFormatter({
        tree: function(value, rowItem, columnItem, cellNode) {

            nextTick(() => {
                createDetailInfo(rowItem, columnItem, cellNode);
            });

            const defaultFormatter = this.getDefaultFormatter('tree');
            // async create vue component
            // tg-tree-name
            return defaultFormatter('', rowItem, columnItem, cellNode);
        }
    });

    return grid;
};


const collectErrorForAttachment = (collection) => {
    const { errors, comparisons } = collection;

    // console.log(errors, comparisons);

    if (!comparisons.length || !errors.length) {
        return;
    }

    let index = 0;
    errors.forEach((item) => {
        const { error, position } = item;
        const matchedComparisonError = error.match(/\d+ pixels \(ratio \d+\.\d+ of all image pixels\) are different/);
        if (matchedComparisonError) {
            const comparison = comparisons[index];
            if (comparison) {
                comparison.data.message = matchedComparisonError[0];
                comparison.data.position = position;
                // console.log(comparison);
                index += 1;
            }
        }
    });

};

const initRows = (list, collection) => {
    list.forEach((it) => {

        if (it.type === 'step') {

            if (it.stepType === 'retry') {
                it.icon = 'retry';
            } else {

                if (Util.isList(it.annotations)) {
                    const hasSkip = it.annotations.find((annotation) => annotation.type === 'skip');
                    if (hasSkip) {
                        it.icon = 'skipped';
                        it.classMap = 'mcr-step-skipped';
                    }
                }

                collection.index += 1;
                it.index = collection.index;
            }

        }

        initDataColumns(it, collection);

        // step subs
        if (it.subs) {
            initRows(it.subs, collection);
        }

    });

};

const getGridData = (grid, caseItem) => {

    // before cache
    data.hasFailed = caseItem.stepFailed > 0;

    if (gridDataCache[caseItem.id]) {
        return gridDataCache[caseItem.id];
    }

    const rows = [];

    // suites
    let suite = caseItem.tg_parent;
    while (suite) {
        let suiteRow = suiteCache[suite.id];
        if (!suiteRow) {
            suiteRow = grid.getItemSnapshot(suite);
            suiteCache[suite.id] = suiteRow;
        }
        rows.unshift(suiteRow);
        suite = suite.tg_parent;
    }

    const row = {
        ... grid.getItemSnapshot(caseItem),
        hasDetails: true
    };
    rows.push(row);

    const stepInfo = {
        type: 'step-info',
        icon: 'step',
        title: 'No Steps'
    };

    rows.push(stepInfo);

    // skipped case no steps
    const steps = caseItem.subs;
    if (Util.isList(steps)) {
        stepInfo.title = `Steps <div class="mcr-num">${caseItem.stepNum}</div>`;
        stepInfo.subs = grid.getTreeSnapshot(steps);
    }

    // temp list for errors match to attachments
    const collection = {
        errors: [],
        comparisons: [],
        index: 0
    };

    initRows(rows, collection);

    collectErrorForAttachment(collection);

    const gridData = {
        columns: [{
            id: 'title',
            name: 'Title',
            resizable: false,
            sortable: false
        }],
        rows
    };

    gridDataCache[caseItem.id] = gridData;

    return gridData;
};

const collapseSteps = (gridData) => {
    const stepInfo = gridData.rows.find((it) => it.type === 'step-info');
    if (stepInfo && stepInfo.subs) {
        stepInfo.subs.forEach((it) => {
            if (it.subs) {
                it.collapsed = state.collapseSteps;
            }
        });
    }
};

const renderSteps = () => {
    const grid = getGrid();
    if (!grid) {
        return;
    }

    let toggleFirst;

    const stepInfo = grid.getRowItemBy('type', 'step-info');
    if (stepInfo && stepInfo.subs) {
        stepInfo.subs.forEach((it) => {
            if (it.subs) {
                if (Boolean(it.collapsed) === Boolean(state.collapseSteps)) {
                    return;
                }

                if (state.onlyFailedSteps && !it.errorNum) {
                    return;
                }

                if (!toggleFirst) {
                    toggleFirst = it;
                    return;
                }

                it.collapsed = state.collapseSteps;
            }
        });
    }

    // console.log(toggleFirst);

    if (toggleFirst) {
        grid.toggleRow(toggleFirst);
    }

};

const renderGrid = (caseItem) => {
    const grid = getGrid();
    const gridData = getGridData(grid, caseItem);
    collapseSteps(gridData);
    grid.setData(gridData);
    grid.render();
};


// ===========================================================================

// wait for image loaded
const updatePosition = (position) => {

    // console.log(position);

    const grid = data.grid;
    const positionId = getPositionId(position.rowId, position.columnId);
    let rowItem = grid.getRowItem(positionId);
    if (!rowItem) {
        rowItem = grid.getRowItem(position.rowId);
    }
    if (rowItem) {

        if (rowItem.hasDetails && rowItem.type !== 'case') {
            grid.scrollToRow(rowItem);
        } else {
            grid.scrollRowIntoView(rowItem);
        }
        setTimeout(() => {
            addHighlight(rowItem);
        }, 100);

    }

};

watch(() => state.collapseSteps, () => {
    renderSteps();
});


watch([
    () => data.keywords,
    () => state.onlyFailedSteps
], (v) => {
    if (data.grid) {
        data.grid.update();
    }
});


watch(() => state.position, (v) => {
    if (v && data.grid) {
        updatePosition(v);
    }
});


// ======================================================================

const updateCase = microtask(() => {

    const caseId = state.flyoverData;
    if (!caseId) {
        return;
    }

    const caseItem = state.detailMap[caseId];
    if (!caseItem) {
        return;
    }

    renderGrid(caseItem);

});

watch(() => state.flyoverData, (v) => {
    if (state.flyoverComponent === 'detail') {
        updateCase();
    }
});

emitter.on('onTabSteps', () => {
    updateCase();
});

onMounted(() => {
    updateCase();
});

const onFocus = (e) => {
    removeHighlight();
};

</script>

<template>
  <VuiFlex
    class="mcr-detail-overview"
    direction="column"
    tabindex="0"
    @focus="onFocus"
    @click="onFocus"
  >
    <VuiFlex
      gap="15px"
      wrap
      class="mcr-overview-head"
    >
      <div class="mcr-overview-search">
        <VuiInput
          v-model="data.keywords"
          :class="data.keywords?'mcr-search-keywords':''"
          placeholder="Search"
          width="100%"
          :select-on-focus="true"
        />
        <IconLabel
          class="mcr-search-icon"
          icon="search"
          :button="false"
        />
        <IconLabel
          v-if="data.keywords"
          class="mcr-search-clear"
          icon="close"
          @click="data.keywords = ''"
        />
      </div>

      <VuiSwitch
        v-if="data.hasFailed"
        v-model="state.onlyFailedSteps"
        :label-clickable="true"
        label-position="right"
      >
        Only Failed
      </VuiSwitch>
    </VuiFlex>
    <div class="mcr-overview-grid vui-flex-auto" />
  </VuiFlex>
</template>

<style lang="scss">
.mcr-detail-overview {
    position: relative;
    width: 100%;
    height: 100%;
}

.mcr-overview-head {
    position: relative;
    padding: 15px;
    border-bottom: thin solid #ccc;
    user-select: none;
}

.mcr-overview-search {
    position: relative;
    flex: auto;
    min-width: 100px;
    max-width: 300px;

    .mcr-search-icon {
        left: 5px;
    }

    .mcr-search-clear {
        right: 8px;
    }

    input {
        height: 30px;
        padding-right: 25px;
        padding-left: 25px;
        border-radius: 10px;
    }
}

.mcr-overview-grid {
    position: relative;
    overflow: hidden;

    .tg-turbogrid {
        .tg-highlight {
            &::after {
                position: absolute;
                top: 0;
                left: 0;
                content: "";
                display: block;
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                border: 2px solid #80bdff;
                pointer-events: none;
            }
        }
    }

    .mcr-step-skipped.tg-row .tg-cell {
        color: var(--color-skipped);

        .mcr-step-index {
            opacity: 0.62;
        }
    }
}

.markdown-body {
    min-height: 10px;
    margin: 0;
    background: none;

    .mermaid {
        margin: 0;
        padding: 0;
    }
}

</style>
