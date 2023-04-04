<template>
  <div class="mcr-trend-chart">
    <svg
      :viewBox="viewBox"
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      @mouseleave="hidePopover"
    >
      <rect
        :width="chart.width"
        :height="chart.height"
        fill="#fff"
        fill-opacity="0"
        @mousemove="onMouseMove($event)"
      />
      <g
        pointer-events="none"
        font-family="Verdana,Helvetica,sans-serif"
      >

        <g
          v-for="(item, i) in chart.lines"
          :key="i"
        >
          <path
            :d="item.d"
            :fill="item.color"
            opacity="0.8"
          />
        </g>

      </g>
    </svg>
  </div>
</template>
<script setup>
import {
    shallowReactive, watchEffect, computed
} from 'vue';
import { microtask } from 'async-tick';

import state from '../modules/state.js';
import Util from '../utils/util';

const props = defineProps({
    trendList: {
        type: Array,
        default: null
    }
});

const chart = shallowReactive({
    padding: 5,
    width: 1000,
    height: 150,
    lines: []
});

const viewBox = computed(() => `0 0 ${chart.width} ${chart.height}`);

const hidePopover = () => {
    // onMouseMove.cancel();
    // pd.visible = false;
    // pd.target = null;
    // chart.focus = null;
    // chart.points = null;
};

const onMouseMoveSync = (e) => {
    // const summary = state.summary;
};

const onMouseMove = microtask(onMouseMoveSync);

const render = (trendList) => {
    if (!trendList) {
        return;
    }

    const maxTests = trendList.map((it) => it.tests).reduce((a, b) => Math.max(a, b));

    if (!maxTests) {
        return;
    }
    const padding = chart.padding;
    const cw = chart.width - padding * 2;
    const ch = chart.height - padding * 2;

    const xw = cw / (trendList.length - 1);

    const caseTypes = state.reportData.caseTypes;
    caseTypes.reverse();

    const point = Util.point;

    let perviousPoints = trendList.map((t, i) => {
        return [padding + i * xw, padding + ch];
    });

    chart.lines = caseTypes.map((caseType) => {
        const summary = state.summary;
        const meta = summary[caseType];

        const currentPoints = trendList.map((t, i) => {
            const [px, py] = perviousPoints[i];
            const v = t[caseType];
            const y = py - v / maxTests * ch;
            return [px, y];
        });

        const points = currentPoints.concat(perviousPoints.reverse());

        perviousPoints = currentPoints;

        const d = `M${points.map((it) => {
            const [x, y] = it;
            return point(x, y);
        }).join('L')}z`;


        return {
            name: meta.name,
            color: meta.color,
            percent: meta.percent,
            points: currentPoints,
            d
        };
    });

};

watchEffect(() => {
    render(props.trendList);
});

</script>
<style lang="scss">
.mcr-trend-chart {
    position: relative;

    svg {
        max-width: 1000px;
    }
}
</style>
