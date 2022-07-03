<template>
  <div class="prg vui-flex-column">
    <div class="prg-header vui-flex-row">
      <div
        class="prg-title"
        v-text="title"
      />
      <div class="vui-flex-auto" />
      <div class="prg-info">
        {{ generated }}
      </div>
    </div>

    <div class="prg-filter">
      <VuiFlex
        spacing="10px"
      >
        <div class="prg-summary vui-flex-row">
          <div
            v-for="(item, i) in summary"
            :key="i"
            :class="summaryItemClass(item)"
            @click="summaryItemClick(item)"
          >
            {{ item.name }} <b>{{ item.value }}</b> <i>{{ item.percent }}</i>
          </div>
        </div>


        <div class="vui-flex-auto" />

        <VuiInput
          v-model="keywords"
          width="150px"
          class="prg-search"
          placeholder="keywords"
        />

        <VuiSwitch v-model="suiteVisible">
          Suite
        </VuiSwitch>
        <VuiSwitch v-model="stepVisible">
          Step
        </VuiSwitch>
      </VuiFlex>
    </div>

    <div class="prg-grid vui-flex-auto" />

    <VuiFlyover
      ref="flyover"
      :visible="flyoverVisible"
      position="right"
      width="50%"
    >
      <CaseDetail ref="detail" />
    </VuiFlyover>
  </div>
</template>
<script>
import decompress from 'lz-utils/lib/decompress.js';
import { components, createComponent } from 'vine-ui';

import mixinSummary from '../modules/summary.js';
import mixinGrid from '../modules/grid.js';

import columns from '../modules/columns.js';
import CaseDetail from './case-detail.vue';

const {
    VuiInput,
    VuiFlex,
    VuiFlyover,
    VuiSwitch
} = components;


export default {

    createComponent,

    components: {
        VuiInput,
        VuiFlex,
        VuiFlyover,
        VuiSwitch,
        CaseDetail
    },
    mixins: [
        mixinSummary,
        mixinGrid
    ],
    data() {
        return {
            title: '',
            generated: '',
            summary: {},

            //filter
            keywords: '',
            caseType: 'all',
            suiteVisible: true,
            stepVisible: false,

            flyoverVisible: false
        };
    },

    created() {
        const reportData = JSON.parse(decompress(window.reportData));
        console.log(reportData);

        this.reportData = reportData;
        this.gridDataAll = {
            columns: columns.create(),
            rows: reportData.list
        };
        this.gridDataMap = {};

        this.title = reportData.name;
        this.generated = `Generated ${new Date(reportData.date).toLocaleString()}`;
    },

    mounted() {
        this.initSummaryData();
        this.createGrid();
    },

    methods: {
        summaryItemClass(item) {
            return ['prg-summary-item', item.classMap, item.caseType === this.caseType ? 'prg-summary-selected' : ''];
        },
        summaryItemClick(item) {
            if (item.caseType !== this.caseType) {
                this.caseType = item.caseType;
            }
        }
    }
};

</script>
<style lang="scss">
html,
body {
    font-family: arial, sans-serif;
    font-size: 14px;
    padding: 0;
    margin: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.prg {
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.prg-header {
    height: 45px;
    line-height: 45px;
    padding: 0 15px;
    background-color: #333;
    color: #fff;
    border-bottom: 1px solid #ddd;
}

.prg-title {
    font-weight: bold;
    font-size: 20px;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.prg-info {
    color: #ccc;
}

.prg-filter {
    align-items: center;
    padding: 10px;
    overflow: hidden;
    border-bottom: 1px solid #ddd;
}

.prg-summary {
    position: relative;
    border: thin solid #aaa;
    border-radius: 5px;
    overflow: hidden;
}

.prg-summary-item {
    user-select: none;
    padding: 8px 10px;
    border-left: thin solid #aaa;
    cursor: pointer;
    overflow: hidden;

    &:first-child {
        border-left: none;
    }

    b {
        font-weight: normal;
        margin-left: 3px;
        background-color: #eee;
        padding: 3px 5px;
        border-radius: 10px;
    }

    i {
        font-size: 12px;
        font-style: normal;
    }
}

.prg-summary-item:hover {
    background-color: #f5f5f5;
}

.prg-summary-selected {
    background-color: #ddd;
}

.prg-summary-selected:hover {
    background-color: #ddd;
}

.prg-summary-passed {
    color: green;
}

.prg-summary-failed {
    color: red;
}

.prg-summary-flaky {
    color: orange;
}

.prg-summary-skipped {
    color: gray;
}

.prg-summary-value {
    margin: 0 auto 5px;
    padding: 5px;
    width: 81px;
    font-size: 16px;
    text-align: center;
    background-color: #f5f5f5;
    border-radius: 10px;

    span {
        display: block;
        margin-top: 3px;
        font-size: 12px;
        height: 20px;
        line-height: 20px;
    }
}

.prg-search {
    input {
        background-repeat: no-repeat;
        background-position: 97% center;
        background-image: url("../images/search.svg");
        background-size: 16px;
        padding-right: 23px;
    }
}

.prg-grid {
    .tg-step.tg-group.tg-row,
    .tg-case.tg-group.tg-row {
        font-weight: normal;
    }

    .tg-failed.tg-row {
        background-color: rgb(252 220 220);
        border: none;
    }

    .tg-flaky.tg-row {
        background-color: rgb(252 246 220);
        border: none;
    }

    .tg-skipped.tg-row {
        .tg-cell,
        .tg-tree-row-number {
            color: #999;
        }
    }

    .tg-attachment-screenshot {
        position: relative;
    }
}

</style>
