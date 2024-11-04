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

const getSummary = (summary, map, list) => {

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

const getIstanbulSummary = (report, list) => {

    const map = {
        statements: 'Statements',
        functions: 'Functions',
        branches: 'Branches',
        lines: 'Lines'
    };

    getSummary(report.summary, map, list);

};


const getV8Summary = (report, list) => {

    const map = {
        bytes: 'Bytes',
        statements: 'Statements',
        functions: 'Functions',
        branches: 'Branches',
        lines: 'Lines'
    };

    getSummary(report.summary, map, list);

};

watchEffect(() => {
    const report = props.data.report;
    if (report && report.files && report.summary) {
        d.files = Util.NF(report.files);
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
    <table>
      <thead>
        <tr>
          <td class="mcr-column-left">
            Name
          </td>
          <td>Coverage</td>
          <td />
          <td>Covered</td>
          <td>Uncovered</td>
          <td>Total</td>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(item, i) of d.list"
          :key="i"
        >
          <td class="mcr-column-left">
            <b>{{ item.name }}</b>
          </td>
          <td
            style="padding: 0 5px;"
            :class="'mcr-'+item.status"
          >
            {{ Util.PF(item.pct, 100, 2) }}
          </td>
          <td
            style="min-width: 100px;"
            v-html="item.percentChart"
          />

          <td :title="item.coveredTitle">
            <span :class="item.coveredClass">{{ Util.NF(item.covered) }}</span>
          </td>
          <td :title="item.uncoveredTitle">
            <span :class="item.uncoveredClass">{{ Util.NF(item.uncovered) }}</span>
          </td>
          <td :title="item.totalTitle">
            {{ Util.NF(item.total) }}
          </td>
        </tr>
        <tr>
          <td class="mcr-column-left">
            <b>Files</b> <span class="mcr-num">{{ d.files }}</span>
          </td>
          <td /><td /><td /><td />
        </tr>
      </tbody>
    </table>
    <VuiFlex padding="8px">
      <a
        :href="props.data.path"
        target="_blank"
      >{{ props.data.report.name }}</a>
    </VuiFlex>
  </div>
</template>

<style lang="scss">
.mcr-attachment-coverage {
    .mcr-coverage-type {
        padding: 0 3px;
        border-radius: 3px;
        background-color: #eee;
    }

    table {
        border-bottom: 1px solid #eee;
    }
}

</style>
