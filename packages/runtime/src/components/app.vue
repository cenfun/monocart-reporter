<template>
  <div class="mcr vui-flex-column">
    <div class="mcr-header vui-flex-row">
      <div
        class="mcr-title"
        v-text="title"
      />
      <div class="vui-flex-auto" />
      <div class="mcr-info">
        {{ generated }} by <a
          href="https://github.com/cenfun/monocart-reporter"
          target="_blank"
        >MCR</a>
      </div>
    </div>

    <div class="mcr-filter">
      <VuiFlex
        spacing="10px"
      >
        <div class="mcr-summary vui-flex-row">
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
          class="mcr-search"
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

    <div class="mcr-grid vui-flex-auto" />

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
//import Util from '../util/util.js';

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
            return ['mcr-summary-item', item.classMap, item.caseType === this.caseType ? 'mcr-summary-selected' : ''];
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

.mcr {
    width: 100%;
    height: 100%;
    overflow: hidden;

    --bg-failed: #ffebe9;
    --bg-flaky: #fcf7de;
}

.mcr-header {
    height: 45px;
    line-height: 45px;
    padding: 0 15px;
    background-color: #24292f;
    color: #fff;
    border-bottom: 1px solid #ddd;
}

.mcr-title {
    font-weight: bold;
    font-size: 20px;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.mcr-info {
    color: #999;

    a:link,
    a:visited {
        color: #999;
    }
}

.mcr-filter {
    align-items: center;
    padding: 10px;
    overflow: hidden;
    border-bottom: 1px solid #ddd;
}

.mcr-summary {
    position: relative;
    border: thin solid #6c757d;
    border-radius: 5px;
    overflow: hidden;
}

.mcr-summary-item {
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

.mcr-summary-item:hover,
.mcr-summary-selected {
    color: #fff;
    background-color: #6c757d;
}

.mcr-summary-passed {
    color: green;
}

.mcr-summary-passed:hover,
.mcr-summary-passed.mcr-summary-selected {
    color: #fff;
    background-color: green;
}

.mcr-summary-failed {
    color: #d00;
}

.mcr-summary-failed:hover,
.mcr-summary-failed.mcr-summary-selected {
    color: #fff;
    background-color: #d00;
}

.mcr-summary-flaky {
    color: orange;
}

.mcr-summary-flaky:hover,
.mcr-summary-flaky.mcr-summary-selected {
    color: #fff;
    background-color: orange;
}

.mcr-summary-skipped {
    color: gray;
}

.mcr-summary-skipped:hover,
.mcr-summary-skipped.mcr-summary-selected {
    color: #fff;
    background-color: gray;
}

.mcr-summary-value {
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

.mcr-search {
    input {
        background-repeat: no-repeat;
        background-position: 97% center;
        background-image: url("../images/search.svg");
        background-size: 16px;
        padding-right: 23px;
    }
}

.mcr-grid {
    .tg-step.tg-group.tg-row,
    .tg-case.tg-group.tg-row {
        font-weight: normal;
    }

    .tg-case-failed.tg-row {
        background-color: var(--bg-failed);
        border: none;
    }

    .tg-case-flaky.tg-row {
        background-color: var(--bg-flaky);
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
    background-color: #005ba4;
    padding: 0 10px;
}

.vui-flyover-icon {
    cursor: pointer;
    padding: 9px 0;
}

.vui-flyover-title {
    height: 45px;
    line-height: 45px;
    color: #fff;
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
