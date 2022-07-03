<template>
  <div class="prg vui-flex-row">
    <div class="prg-menu vui-flex-column">
      <div
        class="prg-menu-header"
        v-text="title"
      />
      <div class="prg-menu-grid vui-flex-auto" />
      <div class="prg-menu-footer">
        {{ generated }}
      </div>
    </div>
    <div class="prg-body vui-flex-auto vui-flex-column">
      <div
        class="prg-filter"
        @click="hideFlyover"
      >
        <VuiFlex
          spacing="10px"
        >
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

      <div class="prg-body-grid vui-flex-auto" />
    </div>
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
//import store from '../util/store.js';
import columns from '../modules/columns.js';
import mixinBodyGrid from '../modules/body-grid.js';
import mixinMenuGrid from '../modules/menu-grid.js';
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
        mixinBodyGrid,
        mixinMenuGrid
    ],
    data() {
        return {
            title: '',
            generated: '',

            //filter
            keywords: '',
            type: 'case',
            dataType: 'case',
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
        this.gridDataMap = {
            all: {
                columns: columns.create(),
                rows: reportData.list
            }
        };
    },

    mounted() {
        this.createMenuGrid();
        this.createBodyGrid();
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

.prg-menu {
    position: relative;
    width: 240px;
    height: 100%;
    border-right: 1px solid #ccc;
    background-color: #000;
    color: #fff;
}

.prg-menu-header {
    height: 41px;
    line-height: 41px;
    padding: 0 10px;
    font-weight: bold;
    font-size: 18px;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.prg-menu-footer {
    padding: 10px;
    font-size: 12px;
    color: #ccc;
}

.prg-menu-grid {
    .tg-suite,
    .tg-step {
        font-weight: bold;
    }

    .tg-summary-passed.tg-row {
        .tg-cell {
            color: green;
        }
    }

    .tg-summary-failed.tg-row {
        .tg-cell {
            color: red;
        }
    }

    .tg-summary-flaky.tg-row {
        .tg-cell {
            color: orange;
        }
    }

    .tg-summary-skipped.tg-row {
        .tg-cell {
            color: gray;
        }
    }
}

.prg-body {
    overflow: hidden;
    height: 100%;
}

.prg-filter {
    align-items: center;
    padding: 0 10px;
    border-bottom: 1px solid #ddd;
    line-height: 40px;
    height: 40px;
    overflow: hidden;
    background-color: #f5f5f5;
}

.prg-search input {
    background-repeat: no-repeat;
    background-position: 97% center;
    background-image: url("../images/search.svg");
    background-size: 16px;
    padding-right: 23px;
}

.prg-body-grid {
    .tg-case-failed.tg-row {
        background-color: rgb(252 220 220);
        border: none;
    }

    .tg-case-flaky.tg-row {
        background-color: rgb(252 246 220);
        border: none;
    }

    .tg-case-skipped.tg-row {
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
