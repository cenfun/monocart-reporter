<template>
  <div class="vui-flex-column prg">
    <div
      class="vui-flex-row prg-header"
      @click="hideFlyover"
    >
      <div
        class="prg-title vui-flex-auto"
        v-text="title"
      />
      <div class="vui-flex-auto" />
      <div>{{ generated }}</div>
    </div>
    <div class="prg-summary">
      <VuiFlex
        spacing="10px"
        center
      >
        <div class="prg-summary-item prg-summary-top">
          <VuiRadio
            v-model="type"
            name="type"
            value="suite"
          >
            Suites
          </VuiRadio>
          <div class="prg-summary-value">
            {{ summary.suites }}
          </div>
        </div>

        <div class="prg-summary-item prg-summary-top">
          <VuiRadio
            v-model="type"
            name="type"
            value="case"
          >
            Cases
          </VuiRadio>
          <div class="prg-summary-value">
            {{ summary.cases }}
          </div>
        </div>
        <div class="prg-summary-item prg-summary-passed">
          <VuiRadio
            v-model="type"
            name="type"
            value="case-passed"
          >
            Passed
          </VuiRadio>
          <div class="prg-summary-value">
            {{ summary.passed }} ({{ summary.passedPercent }})
          </div>
        </div>
        <div class="prg-summary-item prg-summary-failed">
          <VuiRadio
            v-model="type"
            name="type"
            value="case-failed"
          >
            Failed
          </VuiRadio>
          <div class="prg-summary-value">
            {{ summary.failed }} ({{ summary.failedPercent }})
          </div>
        </div>
        <div class="prg-summary-item prg-summary-flaky">
          <VuiRadio
            v-model="type"
            name="type"
            value="case-flaky"
          >
            Flaky
          </VuiRadio>
          <div class="prg-summary-value">
            {{ summary.flaky }} ({{ summary.flakyPercent }})
          </div>
        </div>
        <div class="prg-summary-item prg-summary-skipped">
          <VuiRadio
            v-model="type"
            name="type"
            value="case-skipped"
          >
            Skipped
          </VuiRadio>
          <div class="prg-summary-value">
            {{ summary.skipped }} ({{ summary.skippedPercent }})
          </div>
        </div>

        <div class="prg-summary-item prg-summary-top">
          <VuiRadio
            v-model="type"
            name="type"
            value="step"
          >
            Steps
          </VuiRadio>
          <div class="prg-summary-value">
            {{ summary.steps }}
          </div>
        </div>
      </VuiFlex>
    </div>
    <div class="prg-filter">
      <VuiFlex
        spacing="10px"
        center
      >
        <VuiSwitch v-model="grouped">
          Grouped
        </VuiSwitch>

        <VuiInput
          v-model="keywords"
          width="120"
          class="prg-search"
          placeholder="keywords"
        >
          Filter:
        </VuiInput>
      </VuiFlex>
    </div>
    <div class="prg-body">
      <div class="prg-grid-container" />
    </div>
    <VuiFlyover
      ref="flyover"
      :visible="flyoverVisible"
      position="right"
      width="50%"
    >
      <detail ref="detail" />
    </VuiFlyover>
  </div>
</template>
<script>
import decompress from 'lz-utils/lib/decompress.js';
import { components, createComponent } from 'vine-ui';
//import store from '../util/store.js';
import columns from '../model/columns.js';
import mixinFilter from '../model/filter.js';
import mixinGrid from '../model/grid.js';
import Util from '../util/util.js';
import Detail from './detail.vue';

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
        Detail
    },
    mixins: [
        mixinFilter,
        mixinGrid
    ],
    data() {
        return {
            title: '',
            generated: '',
            summary: {},

            //filter
            keywords: '',
            type: 'case',
            grouped: true,

            flyoverVisible: false
        };
    },

    created() {
        const reportData = JSON.parse(decompress(window.reportData));
        console.log(reportData);

        this.title = reportData.name;
        this.reportData = reportData;
        this.generated = `Generated ${new Date(reportData.date).toLocaleString()}`;
        const list = this.reportData.list;
        this.initList(list);
        this.gridDataMap = {
            all: {
                columns: columns.create(),
                rows: list
            }
        };
    },

    mounted() {
        this.createGrid();
    },

    methods: {

        initList(list) {
            const summary = {
                cases: 0,
                failed: 0,
                skipped: 0,
                flaky: 0,
                passed: 0,
                suites: 0,
                steps: 0
            };

            const caseHandler = (item) => {
                summary.cases += 1;
                if (item.ok) {
                    if (item.status === 'skipped') {
                        summary.skipped += 1;
                        item.classMap = 'tg-case-skipped';
                    } else if (item.outcome === 'flaky') {
                        summary.flaky += 1;
                        item.classMap = 'tg-case-flaky';
                    } else {
                        summary.passed += 1;
                    }
                } else {
                    item.classMap = 'tg-case-failed';
                    summary.failed += 1;
                    if (parent.failedCases) {
                        parent.failedCases += 1;
                    } else {
                        parent.failedCases = 1;
                    }
                }
            };

            Util.forEachTree(list, function(item, i, parent) {
                if (item.type === 'step') {
                    summary.steps += 1;
                    if (item.error) {
                        item.classMap = 'tg-case-failed';
                    }
                    return;
                }

                if (item.type === 'case') {
                    caseHandler(item);
                    return;
                }
                if (item.type === 'suite') {
                    summary.suites += 1;
                }
            });

            summary.passedPercent = Util.PF(summary.passed, summary.cases);
            summary.failedPercent = Util.PF(summary.failed, summary.cases);
            summary.skippedPercent = Util.PF(summary.skipped, summary.cases);
            summary.flakyPercent = Util.PF(summary.flaky, summary.cases);

            this.summary = summary;
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

    .prg-header {
        height: 35px;
        line-height: 35px;
        border-bottom: 1px solid #ccc;
        padding: 0 10px;
        background-color: #000;
        color: #eee;

        .prg-title {
            font-weight: bold;
            font-size: 18px;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .prg-label {
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 14px;
        }
    }

    .prg-summary {
        font-size: 12px;
        color: #333;
        border-bottom: thin solid #ddd;
        padding: 5px 0 10px;
    }

    .prg-summary-item {
        position: relative;
    }

    .prg-summary-top {
        font-weight: bold;
        padding-left: 15px;
        margin-left: 15px;
    }

    .prg-summary-top::after {
        content: "";
        position: absolute;
        height: calc(100% - 5px);
        top: 5px;
        left: 0;
        border-right: 1px dashed #666;
    }

    .prg-summary-top:first-child {
        padding-left: 0;
        margin-left: 0;
    }

    .prg-summary-top:first-child::after {
        display: none;
    }

    .prg-summary-passed {
        color: #333;
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
        padding-left: 25px;
        text-align: center;
    }

    .prg-filter {
        align-items: center;
        padding: 0 10px;
        border-bottom: 1px solid #ddd;
        line-height: 40px;
        height: 40px;
        overflow: hidden;

        .prg-search input {
            background-repeat: no-repeat;
            background-position: 97% center;
            background-image: url("../images/search.svg");
            background-size: 16px;
            padding-right: 23px;
        }
    }

    .prg-body {
        flex: 1;
        overflow: hidden;
    }

    .prg-grid-container {
        width: 100%;
        height: 100%;

        .tg-cell {
            border-right: none;
        }
    }

    .tg-case-failed.tg-row {
        background-color: rgb(252 220 220);
        border: none;
    }

    .tg-case-flaky.tg-row {
        background-color: rgb(252 246 220);
        border: none;
    }

    .tg-case-skipped {
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
