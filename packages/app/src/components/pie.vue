<template>
  <VuiFlex
    class="mcr-pie-chart"
    gap="20px"
  >
    <svg
      :viewBox="data.viewBox"
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        v-for="(item, i) in data.list"
        :key="i"
        :d="item.d"
        :fill="item.color"
      />
    </svg>
    <VuiFlex
      direction="column"
      gap="10px"
      class="mcr-pie-legend"
    >
      <VuiFlex
        v-for="(item, i) in data.list"
        :key="i"
        gap="10px"
      >
        <div
          class="mcr-pie-color"
          :style="'background:'+item.color"
        />
        <div>{{ item.value }} {{ item.name }}</div>
        <span>{{ item.percent }}</span>
      </VuiFlex>
    </VuiFlex>
  </VuiFlex>
</template>
<script setup>
import {
    onMounted, watch, reactive
} from 'vue';
import { components } from 'vine-ui';
import state from '../modules/state.js';

import Util from '../utils/util.js';

const { VuiFlex } = components;

const data = reactive({
    size: 100,
    viewBox: '0 0 100 100',
    list: []
});

const renderChart = () => {
    const pieData = state.pieData;
    if (!pieData) {
        return;
    }

    data.list = [];

    const x = data.size / 2;
    const y = data.size / 2;
    const r = data.size / 2;

    // start from 12 clock
    let start = 0.75;
    pieData.forEach((item, i) => {

        const from = 2 * Math.PI * start;
        const percent = parseFloat(item.percent) / 100 + start;
        const till = 2 * Math.PI * percent;
        start = percent;

        const d = getSectorPath(x, y, r, from, till);

        data.list.push({
            name: item.name,
            value: item.value,
            percent: item.percent,
            color: item.color,
            d
        });

    });

};

const dFixed = (num, fixed = 1) => {
    if (Number.isInteger(num)) {
        return num;
    }
    return Util.toNum(num.toFixed(fixed));
};

const point = function(px, py) {
    return `${dFixed(px)},${dFixed(py)}`;
};

const getSectorPath = function(x, y, r, from, till) {
    if (from === till) {
        return '';
    }
    const ds = [];
    // move to start point
    ds.push(`M${point(x, y)}`);

    // line to outer start point
    const osx = Math.cos(from) * r + x;
    const osy = Math.sin(from) * r + y;
    ds.push(`L${point(osx, osy)}`);

    // arc to outer end point
    const oex = Math.cos(till) * r + x;
    const oey = Math.sin(till) * r + y;
    // large flag for arc
    const large = till - from < Math.PI ? 0 : 1;
    ds.push(`A${point(r, r)} 0 ${large} 1 ${point(oex, oey)}`);

    // close
    ds.push('z');

    return ds.join(' ');
};

onMounted(() => {
    renderChart();
});

watch(() => state.pieData, (v) => {
    renderChart();
});

</script>
<style lang="scss">
.mcr-pie-chart {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;

    svg {
        display: block;
        width: 150px;
        height: 150px;
    }
}

.mcr-pie-legend {
    font-weight: bold;
    font-size: 18px;

    span {
        font-weight: normal;
    }

    .mcr-pie-color {
        width: 20px;
        height: 20px;
        border-radius: 50%;
    }
}

</style>
