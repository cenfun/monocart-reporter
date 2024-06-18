<script setup>
import {
    createApp, h, watch, shallowReactive, onMounted, nextTick
} from 'vue';
import { components } from 'vine-ui';
import { Grid, $ } from 'turbogrid';
import { microtask } from 'monocart-common';

import Util from '../../utils/util.js';
import state from '../../modules/state.js';
import { initDataColumns, getPositionId } from '../../modules/detail-columns.js';
import emitter from '../../modules/emitter.js';

import IconLabel from '../icon-label.vue';
import StepInfo from './step-info.vue';

const {
    VuiFlex, VuiSwitch, VuiInput
} = components;

const data = shallowReactive({
    hasFailed: 0
});

const rowHeightMap = new Map();

// ===========================================================================

const asyncUpdateRowHeight = microtask(() => {
    // console.log('asyncUpdateRowHeight', rowHeightMap);

    if (!rowHeightMap.size) {
        return;
    }

    const grid = data.grid;

    const rows = [];
    const heights = [];

    // console.log(grid.rows, visibleRowList);

    rowHeightMap.forEach(function(rowItem) {
        // console.log(row.name, row.tg_index);
        if (!rowItem.tg_row_height_fixable || rowItem.tg_row_height_fixed) {
            return;
        }
        const cellNode = grid.getCellNode(rowItem, 'title');
        if (!cellNode) {
            return;
        }
        // required stop loop
        rowItem.tg_row_height_fixed = true;
        const div = cellNode.querySelector('.tg-multiline-fixing');
        // 10px is padding top and bottom
        const realHeight = Math.max($(div).height() + 10, grid.options.rowHeight);
        rows.push(rowItem);
        heights.push(realHeight);
    });

    rowHeightMap.clear();

    // nothing fix
    if (!rows.length) {
        return;
    }
    // console.log('row height fix: ', rows, heights);
    grid.setRowHeight(rows, heights);

});

const createStepInfo = (value, rowItem, columnItem, cellNode) => {
    const div = cellNode.querySelector('.tg-tree-name');
    if (div) {
        createApp({
            render() {
                return h(StepInfo, {
                    rowItem,
                    columnItem,
                    onResize: () => {
                        rowItem.tg_row_height_fixed = false;
                        rowHeightMap.set(rowItem.id, rowItem);
                        asyncUpdateRowHeight();
                    }
                });
            }
        }).mount(div);
        if (rowItem.tg_row_height_fixable) {
            rowHeightMap.set(rowItem.id, rowItem);
            asyncUpdateRowHeight();
        }
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

    // reset row height fixed
    const visibleRowList = grid.viewport.rows;
    grid.forEachRow(function(rowItem) {
        if (rowItem.tg_row_height_fixed) {
            rowItem.tg_row_height_fixed = false;
        }
        if (rowItem.tg_row_height_fixable) {
            if (visibleRowList.includes(rowItem.tg_view_index)) {
                rowHeightMap.set(rowItem.id, rowItem);
                asyncUpdateRowHeight();
            }
        }
    });

};

const getGrid = () => {
    if (data.grid) {
        return data.grid;
    }

    const grid = new Grid(document.querySelector('.mcr-steps-grid'));
    data.grid = grid;

    grid.bind('onResize onLayout', function(e, d) {
        updateColumnWidth(grid);
    });

    // grid.bind('onFirstUpdated', () => {
    //
    // });

    return grid;
};


const initSteps = (list, index) => {
    if (!Util.isList(list)) {
        return index;
    }

    list.forEach((it) => {

        if (it.stepType !== 'retry') {
            it.index = index++;
        }

        initDataColumns(it);
        if (it.tg_detailColumns.length) {
            it.tg_row_height_fixable = true;
            it.titleClassMap = 'tg-multiline';
            it.hoverable = false;
        }
        index = initSteps(it.subs, index);
    });

    return index;
};


const renderGrid = () => {

    const grid = getGrid();

    const caseItem = data.caseItem;

    data.hasFailed = caseItem.stepFailed > 0;


    const list = [];

    // suites
    let suite = caseItem.tg_parent;
    while (suite) {
        const row = {
            ... suite
        };
        row.subs = null;
        list.unshift(row);
        suite = suite.tg_parent;
    }

    const steps = caseItem.subs;
    const row = {
        ... caseItem
    };
    row.subs = null;
    list.push(row);

    list.push({
        title: 'Steps'
    });

    // console.log(list);


    // const rows = caseItem.subs || [];
    const rows = list.concat(steps);
    initSteps(rows, 1);

    const rowHeight = 36;
    const rowNumberWidth = Math.max(10 + caseItem.stepNum.toString().length * 12, rowHeight);

    grid.setOption({

        headerVisible: false,

        bindContainerResize: true,
        bindWindowResize: true,

        scrollbarRound: true,
        textSelectable: true,

        rowHeight,
        rowNotFound: 'No Results',

        rowNumberVisible: true,
        rowNumberWidth,

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
            const defaultFormatter = this.getDefaultFormatter('tree');
            // async create vue component
            nextTick(() => {
                createStepInfo(value, rowItem, columnItem, cellNode);
            });
            // tg-tree-name
            return defaultFormatter('', rowItem, columnItem, cellNode);
        },
        rowNumber: function(value, rowItem, columnItem, cellNode) {
            return rowItem.index || '';
        }
    });

    grid.setData({
        columns: [{
            id: 'title',
            name: 'Title',
            resizable: false,
            sortable: false
        }],
        rows
    });

    grid.render();

};


// ===========================================================================

// wait for image loaded
const updatePosition = (position) => {

    if (position.type !== 'step') {
        return;
    }

    const grid = data.grid;
    const rowItem = grid.getRowItem(position.rowId);
    if (rowItem) {

        // do not scrollRowIntoView, the row height could be changed
        grid.scrollToRow(rowItem);

        setTimeout(() => {

            let elem = grid.getCellNode(rowItem, 'title');
            if (elem) {
                const positionId = getPositionId(position.rowId, position.columnId);
                elem = elem.querySelector(`[position-id="${positionId}"]`) || elem;
            }
            Util.setFocus(elem);

        }, 100);

    }

};


watch([
    () => data.keywords,
    () => state.onlyFailedSteps
], (v) => {
    if (data.grid) {
        data.grid.update();
    }
});

const isCurrentTab = () => {
    return state.tabIndex === 1;
};

watch(() => state.position, (v) => {
    if (v && data.grid && isCurrentTab()) {
        updatePosition(v);
    }
});


// ======================================================================

const updateCase = microtask(() => {

    if (!isCurrentTab()) {
        return;
    }

    const caseId = state.flyoverData;
    if (!caseId) {
        return;
    }

    const caseItem = state.detailMap[caseId];
    if (!caseItem) {
        return;
    }

    data.caseItem = caseItem;
    renderGrid();

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
    Util.setFocus();
};

</script>

<template>
  <VuiFlex
    class="mcr-detail-steps"
    direction="column"
    tabindex="0"
    @focus="onFocus"
    @click="onFocus"
  >
    <VuiFlex
      gap="10px"
      wrap
      class="mcr-steps-head"
    >
      <div class="mcr-search-steps">
        <VuiInput
          v-model="data.keywords"
          :class="data.keywords?'mcr-search-keywords':''"
          placeholder="search steps"
          width="100%"
          :select-on-focus="true"
        />
        <IconLabel
          class="mcr-search-icon"
          icon="search"
          :button="false"
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
    <div class="mcr-steps-grid" />
  </VuiFlex>
</template>

<style lang="scss">
.mcr-detail-steps {
    position: relative;
    width: 100%;
    height: 100%;
}

.mcr-steps-head {
    position: relative;
    padding: 10px;
    border-bottom: thin solid #ccc;
    user-select: none;
}

.mcr-search-steps {
    position: relative;
    width: 150px;

    .mcr-search-icon {
        left: 5px;
    }

    input {
        padding-left: 25px;
    }
}

.mcr-steps-grid {
    position: relative;
    flex: auto;

    .tg-multiline {
        .tg-tree-icon {
            height: 26px;
        }

        .tg-tree {
            align-items: start;
        }
    }
}

</style>
