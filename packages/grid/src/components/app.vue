<template>
  <div class="prg vui-flex-column">
    <div class="prg-header vui-flex-row">
      <div
        class="prg-title"
        v-text="title"
      />
      <div class="vui-flex-auto" />
      <div class="prg-info">
        {{ generated }} by <a
          href="https://github.com/cenfun/playwright-report-grid"
          target="_blank"
        >PRG</a>
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
            {{ item.name }} <span>{{ item.value }}</span> <span>{{ item.percent }}</span>
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
      width="60%"
    >
      <div class="vui-flyover-main vui-flex-column">
        <div class="vui-flyover-header">
          <VuiFlex spacing="10px">
            <div
              class="vui-flyover-icon"
              @click="flyoverVisible=false"
            >
              <div class="vui-icon vui-icon-arrow-right" />
            </div>
            <div class="vui-flyover-title vui-flex-auto">
              {{ detailTitle }}
            </div>
            <div
              class="vui-flyover-icon"
              @click="flyoverVisible=false"
            >
              <div class="vui-icon vui-icon-close" />
            </div>
          </VuiFlex>
        </div>
        <div class="vui-flyover-content vui-flex-auto">
          <CaseDetail ref="detail" />
        </div>
      </div>
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

import store from '../util/store.js';
import Util from '../util/util.js';

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
            stepVisible: true,

            detailTitle: '',

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
        this.initStore();
    },

    mounted() {
        this.initSummaryData();
        this.createGrid();
    },

    methods: {

        initStore() {
            const booleans = {
                'true': true,
                'false': false
            };
            ['suiteVisible', 'stepVisible'].forEach((item) => {
                const visible = booleans[store.get(item)];
                if (typeof visible === 'boolean') {
                    this[item] = visible;
                }
            });
        },

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

    a:link,
    a:visited {
        color: #ccc;
    }
}

.prg-filter {
    align-items: center;
    padding: 10px;
    overflow: hidden;
    border-bottom: 1px solid #ddd;
}

.prg-summary {
    position: relative;
    border: thin solid #6c757d;
    border-radius: 5px;
    overflow: hidden;
}

.prg-summary-item {
    user-select: none;
    padding: 8px 10px;
    border-left: thin solid #6c757d;
    cursor: pointer;
    overflow: hidden;

    &:first-child {
        border-left: none;
    }

    span {
        margin-left: 5px;
    }
}

.prg-summary-item:hover,
.prg-summary-selected {
    color: #fff;
    background-color: #6c757d;
}

.prg-summary-passed {
    color: green;
}

.prg-summary-passed:hover,
.prg-summary-passed.prg-summary-selected {
    color: #fff;
    background-color: green;
}

.prg-summary-failed {
    color: #d00;
}

.prg-summary-failed:hover,
.prg-summary-failed.prg-summary-selected {
    color: #fff;
    background-color: #d00;
}

.prg-summary-flaky {
    color: orange;
}

.prg-summary-flaky:hover,
.prg-summary-flaky.prg-summary-selected {
    color: #fff;
    background-color: orange;
}

.prg-summary-skipped {
    color: gray;
}

.prg-summary-skipped:hover,
.prg-summary-skipped.prg-summary-selected {
    color: #fff;
    background-color: gray;
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

    .tg-case-failed.tg-row {
        background-color: rgb(252 220 220);
        border: none;
    }

    .tg-case-flaky.tg-row {
        background-color: rgb(252 246 220);
        border: none;
    }

    .tg-case-skipped.tg-row {
        .tg-cell {
            color: #999;
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
    background-color: #555;
    padding: 0 10px;
}

.vui-flyover-icon {
    cursor: pointer;
    padding: 9px 0;
}

.vui-flyover-title {
    height: 45px;
    line-height: 45px;
    color: #eee;
    font-size: 16px;
    font-weight: bold;
}

.vui-flyover-content {
    overflow: auto;
}

/*
icon
*/

.vui-icon {
    display: block;
    overflow: hidden;
    width: 20px;
    height: 20px;
    background-size: 20px 20px;
    background-position: center center;
    background-repeat: no-repeat;
    opacity: 0.6;
    cursor: pointer;
}

.vui-icon:hover {
    opacity: 1;
}

.tg-cell .vui-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.vui-icon-close {
    background-image: url("../images/close.svg");
}

.vui-icon-arrow-right {
    background-image: url("../images/arrow-right.svg");
}

.vui-icon-info {
    background-image: url("../images/info.svg");
}

.vui-icon-error {
    background-image: url("../images/error.svg");
}

.vui-icon-log {
    background-image: url("../images/log.svg");
}

.vui-icon-attachment {
    background-image: url("../images/attachment.svg");
}

/*
colors
*/

.inline {
    width: 20px;
    height: 1em;
    display: inline-block;
}

.bold {
    font-weight: bold;
}

.italic {
    font-style: italic;
}

.underline {
    text-decoration: underline;
}

.blink {
    text-decoration: blink;
}

.inverse {
    background: #333;
}

.strike {
    text-decoration: line-through;
}

.c30,
.c90 {
    color: black;
}

.c31,
.c91 {
    color: red;
}

.c32,
.c92 {
    color: green;
}

.c33,
.c93 {
    color: yellow;
}

.c34,
.c94 {
    color: blue;
}

.c35,
.c95 {
    color: magenta;
}

.c36,
.c96 {
    color: cyan;
}

.c37,
.c97 {
    color: white;
}

.bg40,
.bg100 {
    background: black;
}

.bg41,
.bg101 {
    background: red;
}

.bg42,
.bg102 {
    background: green;
}

.bg43,
.bg103 {
    background: yellow;
}

.bg44,
.bg104 {
    background: blue;
}

.bg45,
.bg105 {
    background: magenta;
}

.bg46,
.bg106 {
    background: cyan;
}

.bg47,
.bg107 {
    background: white;
}

</style>
