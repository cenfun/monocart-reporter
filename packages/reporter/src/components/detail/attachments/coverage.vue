<script setup>
import { watchEffect, shallowReactive } from 'vue';
import { components } from 'vine-ui';

import Util from '../../../utils/util.js';

const { VuiFlex } = components;

const props = defineProps({
    data: {
        type: Object,
        default: () => {}
    }
});

const d = shallowReactive({
    list: []
});

const getIstanbulSummary = (report, list) => {

    const map = {
        statements: 'Statements',
        branches: 'Branches',
        functions: 'Functions',
        lines: 'Lines'
    };

    const summary = report.summary;
    // console.log(summary);

    Object.keys(map).forEach((k) => {
        const item = summary[k];
        if (!item) {
            return;
        }

        item.name = map[k];
        item.totalTitle = '';

        item.coveredTitle = '';
        item.coveredClass = item.covered > 0 ? 'mcr-covered' : '';

        // only covered in istanbul
        item.uncovered = item.total - item.covered;
        item.uncoveredTitle = '';
        item.uncoveredClass = item.uncovered > 0 ? 'mcr-uncovered' : '';

        item.percentChart = Util.generatePercentChart(item.pct);

        list.push(item);

    });


};


const getV8Summary = (report, list) => {

    const item = report.summary;

    item.name = 'Bytes';
    item.totalTitle = `Total ${Util.BSF(item.total)}`;

    item.coveredTitle = `Covered ${Util.BSF(item.covered)}`;
    item.coveredClass = item.covered > 0 ? 'mcr-covered' : '';

    item.uncoveredTitle = `Uncovered ${Util.BSF(item.uncovered)}`;
    item.uncoveredClass = item.uncovered > 0 ? 'mcr-uncovered' : '';

    item.percentChart = Util.generatePercentChart(item.pct);

    list.push(item);


};

watchEffect(() => {
    const report = props.data.report;
    if (report && report.files && report.summary) {
        d.files = Util.NF(report.files.length);
        d.type = report.type;
        const list = [];
        if (report.type === 'istanbul') {
            getIstanbulSummary(report, list);
        } else {
            getV8Summary(report, list);
        }
        d.list = list;
    }
});
</script>

<template>
  <div class="mcr-attachment-coverage">
    <div class="mcr-attachment-head">
      <a
        :href="props.data.path"
        target="_blank"
        class="mcr-item"
      >{{ props.data.name }}</a>
    </div>
    <div class="mcr-attachment-body">
      <table>
        <tr>
          <td />
          <td>Total</td>
          <td>Covered</td>
          <td>Uncovered</td>
          <td />
          <td />
        </tr>
        <tr
          v-for="(item, i) of d.list"
          :key="i"
        >
          <td class="mcr-column-left">
            <b>{{ item.name }}</b>
          </td>
          <td :title="item.totalTitle">
            {{ Util.NF(item.total) }}
          </td>
          <td :title="item.coveredTitle">
            <span :class="item.coveredClass">{{ Util.NF(item.covered) }}</span>
          </td>
          <td :title="item.uncoveredTitle">
            <span :class="item.uncoveredClass">{{ Util.NF(item.uncovered) }}</span>
          </td>
          <td
            style="width: 100px;"
            v-html="item.percentChart"
          />
          <td
            style="padding: 0 5px;"
            :class="'mcr-'+item.status"
          >
            {{ Util.PF(item.pct, 100) }}
          </td>
        </tr>
      </table>
      <VuiFlex
        gap="10px"
        padding="8px"
      >
        <div><b>Files</b> <span class="mcr-num">{{ d.files }}</span></div>
        <div><b>Type</b> {{ d.type }}</div>
      </VuiFlex>
    </div>
  </div>
</template>

<style lang="scss">
.mcr-attachment-coverage {
    table {
        border-bottom: 1px solid #eee;
    }
}

</style>
