<template>
  <div class="lui-flex-column pat">
    <div
      class="lui-flex-row pat-header"
      @click="hideFlyover"
    >
      <div
        class="pat-title lui-flex-auto"
        v-text="title"
      />
      <div class="lui-flex-auto" />
    </div>
    <div class="lui-flex-row pat-filter">
      <LuiInput
        v-model="keywords"
        width="120"
        class="pat-search"
        placeholder="keywords"
      >
        Search:
      </LuiInput>
      <div class="lui-hs-10" />
      <LuiSelect
        v-model="type"
        label="Type:"
      >
        <option>suite</option>
        <option>case</option>
        <option>step</option>
      </LuiSelect>
      <div class="lui-hs-10" />
      <LuiCheckbox v-model="grouped">
        Grouped
      </LuiCheckbox>
      <div class="lui-hs-10" />
      <LuiSelect
        v-model="result"
        label="Result:"
      >
        <option value="">
          all
        </option>
        <option v-if="summary.failed > 0">
          failed
        </option>
        <option v-if="summary.skipped > 0">
          skipped
        </option>
        <option v-if="summary.flaky > 0">
          flaky
        </option>
        <option v-if="summary.passed > 0">
          passed
        </option>
      </LuiSelect>
      <div class="lui-flex-auto" />
    </div>
    <div class="pat-body">
      <div class="pat-grid-container" />
    </div>
    <div class="lui-flex-row pat-footer">
      <div class="lui-flex-auto">
        <info :info="summary" />
      </div>
      <div>{{ generated }}</div>
    </div>
    <flyover ref="flyover">
      <detail ref="detail" />
    </flyover>
  </div>
</template>
<script>
import decompress from 'lz-utils/lib/decompress.js';
import {
    registerComponent, LuiButton, LuiInput, LuiCheckbox, LuiSelect
} from 'lithops-ui';
import store from '../util/store.js';
import columns from '../model/columns.js';
import mixinFilter from '../model/filter.js';
import mixinGrid from '../model/grid.js';
import Util from '../util/util.js';
import Flyover from './flyover.vue';
import Detail from './detail.vue';
import Info from './info.vue';
const App = {
    components: {
        LuiButton,
        LuiInput,
        LuiCheckbox,
        LuiSelect,
        Flyover,
        Detail,
        Info
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
            result: store.get('result')
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
                        item.rowClass = 'tg-case-skipped';
                    } else if (item.outcome === 'flaky') {
                        summary.flaky += 1;
                        item.rowClass = 'tg-case-flaky';
                    } else {
                        summary.passed += 1;
                    }
                } else {
                    item.rowClass = 'tg-case-failed';
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
                        item.rowClass = 'tg-case-failed';
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

registerComponent(App);

export default App;
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

.pat {
    width: 100%;
    height: 100%;
    overflow: hidden;

    .pat-header {
        height: 35px;
        line-height: 35px;
        border-bottom: 1px solid #ccc;
        padding: 0 10px;
        background-color: #000;
        color: #eee;

        .pat-title {
            font-weight: bold;
            font-size: 18px;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .pat-label {
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 14px;
        }
    }

    .pat-filter {
        align-items: center;
        padding: 0 10px;
        border-bottom: 1px solid #ddd;
        line-height: 40px;
        height: 40px;
        overflow: hidden;

        .pat-search input {
            background-repeat: no-repeat;
            background-position: 97% center;
            background-image: url("../images/search.svg");
            background-size: 16px;
            padding-right: 23px;
        }
    }

    .pat-body {
        flex: 1;
        overflow: hidden;
    }

    .pat-grid-container {
        width: 100%;
        height: 100%;

        .tg-cell {
            border-right: none;
        }
    }

    .tg-case-failed.tg-row {
        background-color: rgb(252, 220, 220);
        border-bottom: none;
    }

    .tg-case-flaky.tg-row {
        background-color: rgb(252, 246, 220);
        border-bottom: none;
    }

    .tg-case-skipped  {
        .tg-cell,
        .tg-tree-row-number {
            color: #999;
        }
    }

    .pat-footer {
        padding: 0px 10px;
        height: 30px;
        line-height: 30px;
        font-size: 12px;
        background: #f5f5f5;
        position: relative;
        border-top: 1px solid #eee;
        color: #888;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}
</style>