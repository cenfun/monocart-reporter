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
      <g
        v-for="(item, i) in data.list"
        :key="i"
        :class="'mcr-pie-'+item.id"
      >
        <path
          :d="item.d"
          :fill="item.color"
          @click="onPieAnimate(item)"
        />
        <animateTransform
          :class="'mcr-transform-'+item.id"
          attributeName="transform"
          type="translate"
          :from="item.from"
          :to="item.to"
          dur="0.2s"
          fill="freeze"
          repeatCount="1"
          restart="always"
        />
      </g>
    </svg>
    <VuiFlex
      direction="column"
      gap="10px"
      class="mcr-pie-legend"
    >
      <VuiFlex
        v-for="(item, i) in data.list"
        :key="i"
        :class="'mcr-legend-'+item.id"
        gap="10px"
        @click="onPieAnimate(item)"
      >
        <div
          class="mcr-legend-icon"
          :style="'background:'+item.color"
        />
        <div class="mcr-legend-name">
          {{ item.name }}
        </div>
        <div class="vui-flex-auto" />
        <span class="mcr-num">{{ Util.NF(item.value) }}</span>
        <div class="mcr-legend-percent">
          {{ item.percent }}
        </div>
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
import { nextTick } from 'process';

const { VuiFlex } = components;

const data = reactive({
    size: 100,
    margin: 10,
    viewBox: '0 0 100 100',
    list: []
});

const onPieAnimate = (item) => {

    if (item.to === '0,0') {
        item.from = '0,0';
        item.to = item.pos;
    } else {
        item.from = item.pos;
        item.to = '0,0';
    }

    nextTick(() => {
        const $transform = document.querySelector(`.mcr-transform-${item.id}`);
        if ($transform) {
            $transform.beginElement();
        }
    });

};

const renderChart = () => {
    const pieData = state.pieData;
    if (!pieData) {
        return;
    }

    data.list = [];

    const x = data.size / 2;
    const y = data.size / 2;
    const r = data.size / 2 - data.margin;

    // start from 12 clock
    let start = 0.75;
    pieData.forEach((item, i) => {

        const from = 2 * Math.PI * start;
        const percent = parseFloat(item.percent) / 100 + start;
        const till = 2 * Math.PI * percent;
        start = percent;

        const d = getSectorPath(x, y, r, from, till);
        const pos = getMovePos(data.margin, from, till);
        // console.log(pos);

        data.list.push({
            id: item.id,
            name: item.name,
            value: item.value,
            color: item.color,
            percent: item.percent,
            from: '0,0',
            to: '0,0',
            pos,
            d
        });

    });

};

const getSectorPath = function(x, y, r, from, till) {
    if (from === till) {
        return '';
    }
    const ds = [];

    const point = Util.point;

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

const getMovePos = (margin, from, till) => {
    const center = from + (till - from) * 0.5;
    const px = Math.cos(center) * margin;
    const py = Math.sin(center) * margin;
    return Util.point(px, py);
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
    margin-right: 20px;
    overflow: hidden;

    svg {
        width: 150px;
        height: 150px;

        path:hover {
            opacity: 0.8;
        }
    }
}

.mcr-pie-legend {
    font-weight: bold;
    font-size: 18px;

    > div {
        cursor: pointer;

        &:hover {
            opacity: 0.8;
        }
    }

    .mcr-legend-percent {
        width: 50px;
        font-weight: normal;
        text-align: right;
    }

    .mcr-legend-icon {
        width: 20px;
        height: 20px;
        border-radius: 50%;
    }
}

</style>
