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
        <div
          v-for="(item, i) in summary"
          :key="i"
          :class="item.classMap"
        >
          <VuiRadio
            v-model="caseType"
            name="caseType"
            :value="item.caseType"
          >
            {{ item.name }}
          </VuiRadio>
          <div class="prg-summary-value">
            {{ item.value }} <span>{{ item.percent }}</span>
          </div>
        </div>

        <VuiInput
          v-model="keywords"
          width="200px"
          class="prg-search"
          placeholder="keywords"
        />
        <VuiSwitch v-model="grouped">
          Grouped
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
    VuiRadio,
    VuiSwitch
} = components;


export default {

    createComponent,

    components: {
        VuiInput,
        VuiFlex,
        VuiFlyover,
        VuiRadio,
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
            grouped: true,

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
    height: 40px;
    line-height: 40px;
    padding: 0 10px;
    background-color: #f5f5f5;
    border-bottom: 1px solid #ddd;
}

.prg-title {
    font-weight: bold;
    font-size: 18px;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.prg-info {
    color: #666;
}

.prg-filter {
    align-items: center;
    padding: 0 10px;
    overflow: hidden;
    border-bottom: 1px solid #ddd;
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
    padding-left: 20px;

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
