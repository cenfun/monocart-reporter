<template>
  <div
    v-show="chart.trendList"
    class="mcr-report-item"
  >
    <div class="mcr-report-head">
      <VuiFlex
        gap="15px"
        padding="10px"
        wrap
      >
        <IconLabel
          icon="trend"
          :button="false"
        >
          <b>Trends</b>
        </IconLabel>

        <VuiSelect
          v-model="chart.density"
          :options="chart.densityOptions"
          label="x"
        />

        <VuiSelect
          v-model="chart.type"
          :options="chart.typeOptions"
          label="y"
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
                :fill="item.fill"
                :stroke="item.stroke"
                :opacity="item.opacity"
                :fill-opacity="item.fillOpacity"
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

    density: 'Series',
    // depends on duration
    densityOptions: [],

    type: 'Status',
    typeOptions: []
});

const viewBox = computed(() => `0 0 ${chart.width} ${chart.height}`);

const popover = ref(null);
const pd = shallowReactive({});

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

    const d = new Date(item.date);
    let dateH = d.toLocaleString();

    const density = item.density;

    if (density) {
        results.push({
            icon: 'time',
            name: `By ${density}`,
            value: item.count
        });

        if (density === 'Day') {
            dateH = d.toLocaleDateString();
        }

    }

    const items = chart.typeItems[chart.type];
    if (items) {
        appendItemResults(item, results, items);
    } else {
        appendStatusResults(item, results);
    }

    results.push({
        icon: 'calendar',
        name: dateH
    });

    return results;
};

const appendStatusResults = (item, results) => {

    const summary = state.summary;

    const ns = item.ns;
    const tests = item[`${ns}tests`];
    // console.log(tests);

    results.push({
        icon: 'case',
        name: summary.tests.name,
        value: tests
    });

    // asc caseTypes
    const ascCaseTypes = state.reportData.caseTypes;
    ascCaseTypes.forEach((k) => {
        const info = summary[k];
        const v = item[ns + k];
        results.push({
            icon: k,
            name: info.name,
            value: String(v),
            percent: Util.PF(v, tests)
        });
    });
};

const appendItemResults = (item, results, items) => {
    const ns = item.ns;
    items.forEach((it) => {
        let v = item[ns + it.type];
        if (it.type === 'duration') {
            v = Util.TF(v);
        }
        results.push({
            icon: it.icon,
            name: it.name,
            value: v
        });
    });
};

// ================================================================================================

const listCache = {};
const getListByDensity = () => {
    const density = chart.density;
    const cache = listCache[density];
    if (cache) {
        return cache;
    }

    const trendList = chart.trendList;
    if (density === 'Series') {
        const list = trendList.map((item, i) => {
            return {
                index: i,
                ns: '',
                ... item
            };
        });
        listCache[density] = list;
        return list;
    }

    // 2023-04-04T11:29:53.613Z
    // 2023-04-04T11
    // 2023-04-04
    let dateInfo = {
        len: 10,
        zero: 'T00:00:00.000Z'
    };
    if (density === 'Hour') {
        dateInfo = {
            len: 13,
            zero: ':00:00.000Z'
        };
    }

    const map = {};
    trendList.forEach((item) => {
        const iso = new Date(item.date).toISOString();
        const dh = iso.slice(0, dateInfo.len);
        // console.log(hk);
        if (!map[dh]) {
            map[dh] = [];
        }
        map[dh].push(item);
    });
    // console.log(map);

    const trendTypes = chart.trendTypes;
    const list = Object.keys(map).map((dh, i) => {
        const ls = map[dh];
        const date = new Date(dh + dateInfo.zero);
        // console.log(date);
        // calculate avg
        const avg = {
            index: i,
            ns: 'total_',
            density,
            count: ls.length,
            date
        };
        trendTypes.forEach((k) => {
            const total = ls.reduce((p, it) => p + it[k], 0);
            avg[`total_${k}`] = total;
            avg[k] = total / ls.length;
        });
        // console.log(avg);
        return avg;
    });

    listCache[density] = list;
    return list;

};

const getStatusLines = (list) => {
    const padding = chart.padding;
    const cw = chart.width - padding * 2;
    const ch = chart.height - padding * 2;
    const xw = cw / (list.length - 1);
    const point = Util.point;

    let perviousPoints = list.map((t, i) => {
        return [padding + i * xw, padding + ch];
    });

    const summary = state.summary;
    const maxTests = chart.trendMax.tests;

    // desc caseTypes
    const descCaseTypes = [].concat(state.reportData.caseTypes).reverse();
    chart.lines = descCaseTypes.map((caseType) => {
        const meta = summary[caseType];
        const currentPoints = list.map((t, i) => {
            const [px, py] = perviousPoints[i];
            const y = py - t[caseType] / maxTests * ch;
            return [px, y];
        });

        const points = currentPoints.concat(perviousPoints.reverse());

        perviousPoints = currentPoints;

        const d = `M${points.map((it) => {
            const [x, y] = it;
            return point(x, y);
        }).join('L')}z`;

        return {
            fill: meta.color,
            stroke: 'none',
            opacity: '0.8',
            d
        };
    });
};

const getItemLines = (list, items) => {
    const padding = chart.padding;
    const cw = chart.width - padding * 2;
    const ch = chart.height - padding * 2;
    const xw = cw / (list.length - 1);
    const point = Util.point;
    const trendMax = chart.trendMax;

    const lines = [];
    items.forEach((item) => {

        const k = item.type;
        const points = list.map((t, i) => {
            const x = padding + i * xw;
            const y = padding + ch - t[k] / trendMax[k] * ch;
            return [x, y];
        });

        const ps = points.map((it) => {
            const [x, y] = it;
            return point(x, y);
        });

        const dStroke = `M${ps.join('L')}`;
        const color = item.color;

        lines.push({
            fill: 'none',
            stroke: color,
            d: dStroke
        });

        const dFill = `M0,${ch}L${ps.join('L')}V${ch}`;

        lines.push({
            fill: color,
            stroke: 'none',
            fillOpacity: '0.1',
            d: dFill
        });

    });

    chart.lines = lines;
};

const render = () => {
    const trendList = chart.trendList;
    if (!trendList) {
        return;
    }

    const list = getListByDensity();
    chart.list = list;

    const type = chart.type;
    const typeItems = {
        Duration: [{
            icon: 'time',
            type: 'duration',
            name: 'Duration',
            color: '#005BA4'
        }],
        Steps: [{
            icon: 'step',
            type: 'steps',
            name: 'Steps',
            color: '#8B12AE'
        }],
        Errors: [{
            icon: 'error',
            type: 'errors',
            name: 'Errors',
            color: '#d00'
        }],
        Retries: [{
            icon: 'reload',
            type: 'retries',
            name: 'Retries',
            color: 'orange'
        }]
    };
    chart.typeItems = typeItems;
    chart.typeOptions = ['Status'].concat(Object.keys(typeItems));

    const items = typeItems[type];
    if (items) {
        return getItemLines(list, items);
    }

    return getStatusLines(list);
};

const initDensity = (duration) => {
    const densityOptions = ['Series'];
    const h = 60 * 60 * 1000;
    if (duration > h) {
        densityOptions.push('Hour');
    }
    if (duration > 24 * h) {
        densityOptions.push('Day');
    }
    chart.densityOptions = densityOptions;
};

const initTrendList = (trendList) => {
    // console.log('trendList', trendList);
    const summaryTypes = Object.keys(state.summary);
    const trendTypes = summaryTypes.concat('duration');
    chart.trendTypes = trendTypes;
    const trendMax = {};
    trendTypes.forEach((k) => {
        // max not 0
        trendMax[k] = 1;
    });

    trendList.forEach((item) => {
        trendTypes.forEach((k) => {
            trendMax[k] = Math.max(trendMax[k], item[k]);
        });
    });

    chart.trendMax = trendMax;
    chart.trendList = trendList;

    // date
    const first = trendList[0];
    const last = trendList[trendList.length - 1];
    const duration = last.date - first.date;
    initDensity(duration);

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

watch([
    () => chart.type,
    () => chart.density
], (v) => {
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
