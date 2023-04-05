<template>
  <div
    v-show="chart.trendList"
    class="mcr-report-item"
  >
    <div class="mcr-report-head">
      <VuiFlex
        gap="15px"
        padding="5px 10px"
        wrap
      >
        <IconLabel
          icon="trend"
          :button="false"
        >
          <b>Trends</b>
        </IconLabel>
        <div class="vui-flex-auto" />
        <VuiSelect
          v-model="chart.density"
          :options="chart.densityOptions"
          width="65px"
        />
      </VuiFlex>
    </div>
    <div class="mcr-report-chart">
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

            <g v-if="chart.focus">
              <path
                :d="chart.focus.d"
                :stroke="chart.focus.color"
              />
            </g>

          </g>
        </svg>
      </div>
    </div>
    <VuiPopover
      ref="popover"
      v-model="pd.visible"
      :positions="['top','bottom']"
      :target="pd.target"
      nonreactive
      class="mcr-trend-popover"
      width="200px"
    >
      <VuiFlex
        direction="column"
        gap="10px"
      >
        <VuiFlex
          v-for="(item, i) in pd.results"
          :key="i"
          gap="10px"
        >
          <IconLabel
            :icon="item.icon"
            :button="false"
          >
            {{ item.name }}
          </IconLabel>
          <span
            v-if=" item.value"
            class="mcr-num"
          >{{ item.value }}</span>
          <span v-if="item.percent">{{ item.percent }}</span>
        </VuiFlex>
      </VuiFlex>
    </VuiPopover>
  </div>
</template>
<script setup>
import {
    shallowReactive, computed, watch, ref
} from 'vue';
import { components } from 'vine-ui';
import { microtask } from 'async-tick';

import state from '../modules/state.js';
import Util from '../utils/util';

import IconLabel from './icon-label.vue';

const {
    VuiFlex, VuiSelect, VuiPopover
} = components;

const chart = shallowReactive({
    padding: 5,
    width: 1000,
    height: 200,
    lines: [],
    list: null,
    density: 'series',
    densityOptions: []
});

const viewBox = computed(() => `0 0 ${chart.width} ${chart.height}`);


const popover = ref(null);

const pd = shallowReactive({

});

const hidePopover = () => {
    onMouseMove.cancel();
    pd.visible = false;
    pd.target = null;
    chart.focus = null;
    chart.points = null;
};

const onMouseMoveSync = (e) => {
    const offsetX = e.offsetX;
    const br = e.target.getBoundingClientRect();
    const rect = {
        x: br.x,
        y: br.y,
        width: br.width,
        height: br.height
    };

    const padding = chart.padding;
    const left = padding;
    const innerWidth = chart.width - padding * 2;

    const vx = offsetX / rect.width * chart.width;
    if (vx < left || vx > left + innerWidth) {
        hidePopover();
        return;
    }

    const per = (vx - left) / innerWidth;
    const currentItem = findClosest(per);
    const results = getResults(currentItem);
    pd.results = results;

    const point = Util.point;
    const pxFixed = Util.pxFixed;

    const cw = chart.width - padding * 2;
    const ch = chart.height - padding * 2;
    const xw = cw / (chart.list.length - 1);
    const fx = padding + Math.floor(currentItem.index * xw);

    chart.focus = {
        d: `M${point(pxFixed(fx), padding)}v${ch}`,
        color: '#ddd'
    };

    // target
    pd.target = {
        left: rect.x + (fx / chart.width) * rect.width,
        top: rect.y,
        width: 0,
        height: rect.height - chart.padding
    };
    pd.visible = true;

};

const onMouseMove = microtask(onMouseMoveSync);

const findClosest = (per) => {
    const list = chart.list;
    const len = list.length - 1;
    const pos = per * len;
    let index = Math.floor(pos);

    if (pos - index >= 0.5) {
        index += 1;
    }

    const item = list[index];

    return item;
};

const getResults = (item) => {
    const results = [];
    if (item.density) {
        results.push({
            icon: 'time',
            name: `by ${item.density}`,
            value: item.count
        });
    }
    results.push({
        icon: 'calendar',
        name: new Date(item.date).toLocaleString()
    });

    const ns = item.ns;
    const tests = item[`${ns}tests`];
    // console.log(tests);

    const summary = state.summary;
    // asc caseTypes
    const caseTypes = state.reportData.caseTypes;
    caseTypes.forEach((k) => {
        const info = summary[k];
        const v = item[ns + k];
        results.push({
            icon: k,
            name: info.name,
            value: String(v),
            percent: Util.PF(v, tests)
        });
    });

    return results;
};

const getListByDensity = () => {
    const trendList = chart.trendList;
    const density = chart.density;

    if (!density || density === 'series') {
        return trendList.map((item, i) => {
            return {
                index: i,
                ns: '',
                ... item
            };
        });
    }

    const caseTypes = chart.caseTypes;
    // const minDate = chart.minDate;
    // const duration = chart.duration;

    const map = {};
    trendList.forEach((item) => {
        const iso = new Date(item.date).toISOString();
        // hour or day
        const len = density === 'hour' ? 13 : 10;
        // 2023-04-04T11:29:53.613Z
        // 2023-04-04T11
        // 2023-04-04
        const dh = iso.slice(0, len);
        // console.log(hk);
        if (!map[dh]) {
            map[dh] = [];
        }
        map[dh].push(item);
    });
    // console.log(map);
    return Object.keys(map).map((dh, i) => {
        const ls = map[dh];
        const zero = density === 'hour' ? ':00:00.000Z' : 'T00:00:00.000Z';
        const date = new Date(dh + zero);
        // console.log(date);
        // calculate avg
        const avg = {
            index: i,
            ns: 'total_',
            density,
            count: ls.length,
            date
        };
        let tests = 0;
        caseTypes.forEach((k) => {
            const total = ls.reduce((p, it) => p + it[k], 0);
            tests += total;
            avg[`total_${k}`] = total;
            avg[k] = total / ls.length;
        });
        avg.total_tests = tests;
        // console.log(avg);
        return avg;
    });

};


const render = () => {
    const trendList = chart.trendList;
    if (!trendList) {
        return;
    }

    const list = getListByDensity();
    chart.list = list;

    const maxTests = chart.maxTests;

    const padding = chart.padding;
    const cw = chart.width - padding * 2;
    const ch = chart.height - padding * 2;

    const xw = cw / (list.length - 1);

    const point = Util.point;

    let perviousPoints = list.map((t, i) => {
        return [padding + i * xw, padding + ch];
    });

    const caseTypes = chart.caseTypes;

    chart.lines = caseTypes.map((caseType) => {
        const summary = state.summary;
        const meta = summary[caseType];

        const currentPoints = list.map((t, i) => {
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
            bg: meta.bg,
            percent: meta.percent,
            points: currentPoints,
            d
        };
    });

};

const initDensity = (duration) => {
    const densityOptions = ['series'];
    const h = 60 * 60 * 1000;
    if (duration > h) {
        densityOptions.push('hour');
    }
    if (duration > 24 * h) {
        densityOptions.push('day');
    }
    chart.densityOptions = densityOptions;
};

const initTrendList = (trendList) => {

    // console.log('trendList', trendList);
    const maxTests = trendList.map((it) => it.tests).reduce((a, b) => Math.max(a, b));
    if (!maxTests) {
        return;
    }

    chart.trendList = trendList;
    chart.maxTests = maxTests;

    const [minDate, maxDate] = trendList.map((it) => [it.date, it.date]).reduce((a, b) => [Math.min(a[0], b[0]), Math.max(a[1], b[1])]);
    // chart.minDate = minDate;
    const duration = maxDate - minDate;
    initDensity(duration);
    // chart.duration = duration;

    chart.caseTypes = [].concat(state.reportData.caseTypes).reverse();

    render();
};

const trendsHandler = () => {
    const trendList = state.reportData.trends;
    if (!Util.isList(trendList)) {
        return;
    }

    trendList.push(Util.getCurrentTrendInfo(state.reportData));

    trendList.sort((a, b) => {
        return a.date - b.date;
    });

    initTrendList(trendList);

};

watch(() => chart.density, (v) => {
    render();
});

watch(() => state.reportData, (v) => {
    if (v) {
        trendsHandler();
    }
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
