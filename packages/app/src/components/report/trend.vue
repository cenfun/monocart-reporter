<script setup>
import {
    shallowReactive, computed, watch, ref, onMounted
} from 'vue';
import { components } from 'vine-ui';
import { microtask } from '../../common/common.js';

import state from '../../modules/state.js';
import Util from '../../utils/util.js';

import IconLabel from '../icon-label.vue';

const {
    VuiFlex, VuiSelect, VuiPopover
} = components;

const chart = shallowReactive({
    padding: 5,
    axisHeight: 20,
    width: 1000,
    height: 200,
    lines: [],
    list: null,

    density: 'serial',
    // depends on duration
    densityOptions: [],

    bezier: false,

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
    let dateH = Util.dateFormat(d, state.locale);

    const items = chart.typeItems[chart.type];
    if (items) {
        appendItemResults(item, results, items);
    } else {
        appendStatusResults(item, results);
    }

    const density = item.density;
    if (density) {

        const densityItem = chart.densityOptions.find((it) => it.value === density);

        results.push({
            icon: 'time',
            name: densityItem.label,
            value: item.count
        });

        if (density === 'day') {
            dateH = Util.dateFormat(d, state.locale, 'date');
        }

    }

    results.push({
        icon: 'calendar',
        colspan: 3,
        name: dateH
    });

    return results;
};

const appendStatusResults = (item, results) => {

    const summary = state.summary;

    const ns = item.ns;
    const tests = item[`${ns}tests`];
    // console.log(tests);

    const growth = item.growth;

    results.push({
        icon: 'case',
        name: summary.tests.name,
        value: tests,
        growth: growth >= 0 ? `+${growth}` : growth
    });

    // asc caseTypes
    chart.caseTypes.forEach((k) => {
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
    if (density === 'serial') {
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
    if (density === 'hour') {
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

const toBezier = (points, S = 'M', Z = '') => {
    points = [].concat(points);
    const ps = [];
    const [fx, fy] = points.shift();
    const [sx, sy] = points.shift();
    const fmx = (sx - fx) * 0.5 + fx;

    const point = Util.point;
    ps.push(`${S}${point(fx, fy)}C${point(fmx, fy)} ${point(fmx, sy)} ${point(sx, sy)}`);
    points.reduce((pp, p) => {
        const [px] = pp;
        const [x, y] = p;
        const mx = (x - px) * 0.5 + px;
        ps.push(`S ${point(mx, y)} ${point(x, y)}`);
        return p;
    }, [sx, sy]);

    // console.log(ps);
    const d = ps.join(' ');

    return d + Z;
};

const toStraight = (points, S = 'M', Z = '') => {
    const point = Util.point;
    const ps = points.map((it) => {
        const [x, y] = it;
        return point(x, y);
    });

    const d = `${S}${ps.join('L')}`;
    return d + Z;
};

const getLineD = (currentPoints, backPoints) => {
    if (chart.bezier) {
        return toBezier(currentPoints) + toBezier(backPoints, 'L', 'z');
    }

    const points = currentPoints.concat(backPoints);
    return toStraight(points, 'M', 'z');
};

const getStatusLines = (list) => {
    const padding = chart.padding;
    const cw = chart.width - padding * 2;
    const ch = chart.height - padding * 2 - chart.axisHeight;
    const xw = cw / (list.length - 1);

    let perviousPoints = list.map((t, i) => {
        return [padding + i * xw, padding + ch];
    });

    const summary = state.summary;
    const maxTests = chart.trendMax.tests;

    const caseTypes = [].concat(chart.caseTypes).reverse();

    chart.lines = caseTypes.map((caseType) => {
        const meta = summary[caseType];
        const currentPoints = list.map((t, i) => {
            const [px, py] = perviousPoints[i];
            const y = py - t[caseType] / maxTests * ch;
            return [px, y];
        });
        const backPoints = perviousPoints.reverse();
        perviousPoints = currentPoints;

        const d = getLineD(currentPoints, backPoints);

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
    const ch = chart.height - padding * 2 - chart.axisHeight;
    const xw = cw / (list.length - 1);
    const trendMax = chart.trendMax;

    const lines = [];
    items.forEach((item) => {

        const k = item.type;
        const points = list.map((t, i) => {
            const x = padding + i * xw;
            const y = padding + ch - t[k] / trendMax[k] * ch;
            return [x, y];
        });

        const dStroke = chart.bezier ? toBezier(points) : toStraight(points);
        const color = item.color;

        lines.push({
            fill: 'none',
            stroke: color,
            d: dStroke
        });

        const lineFill = chart.bezier ? toBezier(points, 'L') : toStraight(points, 'L');
        const dFill = `M${padding},${padding + ch}${lineFill}V${padding + ch}z`;

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

    // desc caseTypes
    chart.caseTypes = [].concat(state.reportData.caseTypes);

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

    let startDate = new Date(list[0].date);
    let endDate = new Date(list[list.length - 1].date);

    if (chart.density === 'day') {
        startDate = Util.dateFormat(startDate, state.locale, 'date');
        endDate = Util.dateFormat(endDate, state.locale, 'date');
    } else {
        startDate = Util.dateFormat(startDate, state.locale);
        endDate = Util.dateFormat(endDate, state.locale);
    }

    chart.startDate = startDate;
    chart.endDate = endDate;

    const items = typeItems[type];
    if (items) {
        return getItemLines(list, items);
    }

    return getStatusLines(list);
};

const initDensity = (duration) => {
    const densityOptions = [{
        label: 'Serial',
        value: 'serial'
    }];
    const h = 60 * 60 * 1000;
    if (duration > h) {
        densityOptions.push({
            label: 'By Hour',
            value: 'hour'
        });
    }
    if (duration > 24 * h) {
        densityOptions.push({
            label: 'By Day',
            value: 'day'
        });
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

    let prevItem;
    trendList.forEach((item) => {
        trendTypes.forEach((k) => {
            trendMax[k] = Math.max(trendMax[k], item[k]);
        });
        if (prevItem) {
            item.growth = item.tests - prevItem.tests;
        }
        prevItem = item;
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
    () => chart.density,
    () => chart.bezier
], (v) => {
    render();
});

onMounted(() => {
    trendsHandler();
});

</script>

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
          @click="chart.bezier=!chart.bezier"
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

            <g>
              <text
                :x="chart.padding"
                :y="chart.height-chart.padding"
                text-anchor="start"
              >{{ chart.startDate }}</text>
              <text
                :x="chart.width-chart.padding"
                :y="chart.height-chart.padding"
                text-anchor="end"
              >{{ chart.endDate }}</text>
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
      <table class="popover-table">
        <tbody>
          <tr
            v-for="(item, i) in pd.results"
            :key="i"
            gap="10px"
          >
            <td :colspan="item.colspan">
              <IconLabel
                :icon="item.icon"
                :button="false"
              >
                {{ item.name }}
              </IconLabel>
            </td>
            <td>
              <span
                v-if=" item.value"
                class="mcr-num"
              >{{ item.value }}</span>
            </td>
            <td>
              <span v-if="item.percent">{{ item.percent }}</span>
              <span
                v-if="item.growth"
                class="mcr-num"
              >{{ item.growth }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </VuiPopover>
  </div>
</template>

<style lang="scss">
.mcr-trend-chart {
    position: relative;

    svg {
        max-width: 1000px;
    }
}

.popover-table {
    td {
        padding: 3px 10px 3px 0;
        white-space: nowrap;
        text-align: center;
    }

    td:last-child {
        text-align: right;
    }

    td:first-child {
        text-align: left;
    }
}
</style>
