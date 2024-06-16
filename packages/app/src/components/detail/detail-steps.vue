<script setup>
import {
    createApp, h, ref, watch, shallowReactive, onMounted, nextTick
} from 'vue';
import { components } from 'vine-ui';
import { Grid, $ } from 'turbogrid';
import { microtask } from 'monocart-common';

import Util from '../../utils/util.js';

import IconLabel from '../icon-label.vue';
import StepInfo from './step-info.vue';

const {
    VuiFlex, VuiSwitch, VuiInput
} = components;

const props = defineProps({
    item: {
        type: Object,
        default: () => {}
    }
});

const data = shallowReactive({
    stepNum: 0,
    stepCollapsed: false,
    stepCollapsedDisabled: false,
    stepFailed: 0,
    stepFailedOnly: false,
    stepSubs: false,
    searchVisible: false
});

const rowHeightMap = new Map();

const el = ref(null);
let $el;

const onStepCollapsedClick = () => {
    if (data.stepCollapsed) {
        data.grid.collapseAllRows();
    } else {
        data.grid.expandAllRows();
    }
};


const initData = (item) => {

    const caseItem = item.data;
    console.log(caseItem);

    data.stepNum = caseItem.stepNum;
    data.stepFailed = caseItem.stepFailed;
    data.stepFailedOnly = caseItem.stepFailedOnly;
    if (data.stepFailedOnly) {
        data.stepCollapsedDisabled = !data.stepSubs;
    } else {
        data.stepCollapsedDisabled = false;
    }

    data.stepSubs = false;

    const steps = caseItem.subs;
    if (!Util.isList(steps)) {
        return [];
    }
    steps.forEach((step) => {
        if (step.subs) {
            data.stepSubs = true;
        }
    });

    return steps;
};


const asyncUpdateRowHeight = microtask(() => {
    // console.log('asyncUpdateRowHeight', rowHeightMap);

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
        rowItem.tg_row_height_fixed = true;
        const div = cellNode.querySelector('.tg-multiline-fixing');
        // 10px is padding top and bottom
        const realHeight = Math.max($(div).height() + 10, grid.options.rowHeight);
        rows.push(rowItem);
        heights.push(realHeight);
    });

    // nothing fix
    if (!rows.length) {
        return;
    }
    console.log('row height fix: ', rows, heights);
    grid.setRowHeight(rows, heights);

});

const createStepInfo = (value, rowItem, columnItem, cellNode) => {
    const div = cellNode.querySelector('.tg-tree-name');
    if (div) {
        createApp({
            render() {
                return h(StepInfo, {
                    value,
                    rowItem,
                    columnItem
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

};

const getGrid = () => {
    if (data.grid) {
        return data.grid;
    }

    const grid = new Grid($el);
    data.grid = grid;

    grid.bind('onResize onLayout', function(e, d) {
        updateColumnWidth(grid);
    });

    return grid;
};

const updateGrid = () => {
    if (!$el || !props.item) {
        return;
    }

    const grid = getGrid();

    const rows = initData(props.item);

    // based on grid height
    const maxHeight = 600;
    const rowHeight = 36;
    const maxNum = Math.ceil(maxHeight / rowHeight);
    // console.log(maxNum);

    let autoHeight = false;
    if (data.stepNum < maxNum) {
        autoHeight = true;
        data.searchVisible = false;
    } else {
        $el.removeAttribute('style');
        data.searchVisible = true;
    }

    const rowNumberWidth = Math.max(10 + data.stepNum.toString().length * 12, rowHeight);

    grid.setOption({

        headerVisible: false,


        bindContainerResize: true,
        bindWindowResize: true,

        scrollbarRound: true,
        textSelectable: true,

        collapseAllOnInit: data.stepCollapsed,

        autoHeight,
        rowHeight,
        rowNotFound: 'No Results',

        rowNumberVisible: true,
        rowNumberWidth,
        rowNumberFilter: function(rowItem, i) {
            if (rowItem.stepType === 'retry') {
                return false;
            }
            return true;
        },

        rowFilter: function(rowItem) {
            const hasMatched = this.highlightKeywordsFilter(rowItem, ['title'], data.keywords);

            if (hasMatched) {

                if (data.stepFailedOnly) {
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
        }
    });

    grid.setData({
        columns: [{
            id: 'title',
            name: 'Title',
            resizable: false
        }],
        rows
    });

    grid.render();

};


// ===========================================================================

watch(() => props.item, (v) => {
    updateGrid();
});

watch([
    () => data.keywords,
    () => data.stepFailedOnly
], (v) => {
    if (data.grid) {
        data.grid.update();
    }
});

onMounted(() => {
    $el = el.value;
    updateGrid();
});

</script>

<template>
  <div class="mcr-detail-steps">
    <VuiFlex
      gap="10px"
      wrap
      class="mcr-steps-head"
    >
      <IconLabel
        icon="step"
        size="20px"
        :button="false"
      >
        <b>Steps</b>
      </IconLabel>
      <div class="mcr-num">
        {{ data.stepNum }}
      </div>

      <VuiSwitch
        v-if="data.stepSubs"
        v-model="data.stepCollapsed"
        :disabled="data.stepCollapsedDisabled"
        :label-clickable="true"
        label-position="right"
        @change="onStepCollapsedClick()"
      >
        Collapse All
      </VuiSwitch>

      <VuiSwitch
        v-if="data.stepFailed"
        v-model="data.stepFailedOnly"
        :label-clickable="true"
        label-position="right"
      >
        Only Failed
      </VuiSwitch>

      <div
        v-if="data.searchVisible"
        class="mcr-search-steps"
      >
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
    </VuiFlex>
    <div
      ref="el"
      class="mcr-steps-grid"
    />
  </div>
</template>

<style lang="scss">
.mcr-detail-steps {
    border-top: thin solid #ccc;
    border-left: thin solid #ccc;
}

.mcr-steps-head {
    position: relative;
    min-height: 35px;
    padding: 5px;
    border-bottom: thin solid #ccc;
    background-color: #f6f8fa;
    user-select: none;
}

.mcr-search-steps {
    position: relative;
    width: 120px;

    .mcr-search-icon {
        left: 5px;
    }

    input {
        padding-left: 25px;
    }
}

.mcr-steps-grid {
    position: relative;
    height: 600px;
}
</style>
