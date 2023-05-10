<template>
  <div
    class="mcr-timeline-chart"
  >
    <div>
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
          font-size="12px"
        >

          <g
            v-if="chart.workerList"
            class="mcr-timeline-workers"
          >
            <g
              v-for="(item, i) in chart.workerList"
              :key="i"
            >
              <text
                :x="chart.padding"
                :y="item.y+item.height*0.5"
                :fill="item.color"
                alignment-baseline="middle"
              >{{ item.name }}</text>

              <g :transform="translate(item.x,item.y)">
                <rect
                  :width="item.width"
                  :height="item.height"
                  fill="#ececec"
                />
                <path
                  v-for="(bar, j) in item.bars"
                  :key="j"
                  :d="bar.d"
                  :fill="bar.color"
                  opacity="0.8"
                />
              </g>

            </g>
          </g>

          <g
            v-if="chart.usage"
            class="mcr-timeline-usage"
          >
            <g>
              <text
                v-for="(line, i) in chart.lines"
                :key="i"
                :x="chart.padding"
                :y="line.y"
                :fill="line.color"
                alignment-baseline="middle"
              >{{ line.name }}</text>
            </g>

            <g :transform="translate(chart.usage.x,chart.usage.y)">
              <path
                :d="chart.grid.d"
                :stroke="chart.grid.color"
                fill="none"
              />
              <g
                v-for="(line, j) in chart.lines"
                :key="j"
              >
                <path
                  :d="line.dFill"
                  :fill="line.color"
                  fill-opacity="0.1"
                />
                <path
                  :d="line.dStroke"
                  :stroke="line.color"
                  fill="none"
                />
              </g>
              <g>
                <circle
                  v-for="(item, i) in chart.points"
                  :key="i"
                  :cx="item.x"
                  :cy="item.y"
                  :fill="item.color"
                  r="3"
                />
              </g>

            </g>

          </g>

          <g
            v-if="chart.axis"
            class="mcr-timeline-axis"
          >
            <g :transform="translate(chart.axis.x,chart.axis.y)">
              <path
                :d="chart.axis.d"
                :stroke="chart.axis.color"
              />
              <text
                v-for="(item, i) in chart.labels"
                :key="i"
                :x="item.x"
                :y="item.y"
                :text-anchor="item.anchor"
                :fill="item.color"
                alignment-baseline="middle"
              >{{ item.label }}</text>
            </g>
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

    <VuiPopover
      ref="popover"
      v-model="pd.visible"
      :positions="['top','bottom']"
      :target="pd.target"
      nonreactive
      class="mcr-timeline-popover"
      width="320px"
    >
      <VuiFlex
        direction="column"
        gap="10px"
      >
        <VuiFlex
          v-for="(item, i) in pd.results"
          :key="i"
          direction="column"
          gap="10px"
          class="mcr-timeline-result"
        >
          <VuiFlex gap="5px">
            <IconLabel
              :icon="item.caseType"
              :button="false"
            />
            <div class="mcr-long-label">
              {{ item.title }}
            </div>
          </VuiFlex>
          <VuiFlex gap="10px">
            <IconLabel
              icon="worker"
              :button="false"
            >
              {{ item.parallelIndex + 1 }}
            </IconLabel>
            <IconLabel
              icon="number"
              :button="false"
            >
              {{ item.workerIndex }}
            </IconLabel>

            <IconLabel
              icon="time"
              :button="false"
            >
              {{ Util.TF(item.duration) }}
            </IconLabel>
          </VuiFlex>
        </VuiFlex>

        <template v-if="pd.tick">
          <VuiFlex gap="10px">
            <IconLabel
              icon="cpu"
              :button="false"
              :style="'color:'+pd.tick.cpu.color"
            >
              <b>CPU</b> {{ pd.tick.cpu.percent }}%
            </IconLabel>

            <IconLabel
              icon="memory"
              :button="false"
              :style="'color:'+pd.tick.mem.color"
            >
              <b>Memory</b> {{ pd.tick.mem.used }} ({{ pd.tick.mem.percent }}%)
            </IconLabel>
          </VuiFlex>
        </template>

        <IconLabel
          icon="time"
          :button="false"
        >
          Started
          <span class="mcr-num">{{ Util.TF(chart.currentTimeStarted) }}</span>
          {{ new Date(chart.currentTimestamp).toLocaleString() }}
        </IconLabel>
      </VuiFlex>
    </VuiPopover>
  </div>
</template>
<script setup>
import {
    shallowReactive, watch, computed, ref, onMounted
} from 'vue';
import { components } from 'vine-ui';
import { microtask } from 'async-tick';
import niceTicks from 'nice-ticks';

import Util from '../utils/util.js';
import state from '../modules/state.js';

import IconLabel from './icon-label.vue';

const { VuiFlex, VuiPopover } = components;

const chart = shallowReactive({
    padding: 5,
    left: 80,
    width: 1000,
    // dynamic
    height: 0,
    gap: 10

});

const viewBox = computed(() => `0 0 ${chart.width} ${chart.height}`);

const translate = (x, y) => {
    return `translate(${x},${y})`;
};

// =========================================================================================

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

    const left = chart.left;
    const innerWidth = chart.innerWidth;

    const vx = offsetX / rect.width * chart.width;
    if (vx < left || vx > left + innerWidth) {
        hidePopover();
        return;
    }

    const system = state.system;
    const time_start = system.timestampStart;
    const time_end = system.timestampEnd;
    const duration = time_end - time_start;

    const per = (vx - left) / innerWidth;
    const timestamp = Math.round(per * duration) + time_start;

    chart.currentTimestamp = timestamp;
    chart.currentTimeStarted = timestamp - time_start;

    const results = findResults(timestamp);
    const tick = findTick(timestamp);

    if (!results && !tick) {
        hidePopover();
        return;
    }

    pd.results = results;
    pd.tick = tick;

    const point = Util.point;
    const pxFixed = Util.pxFixed;

    const padding = chart.padding;
    const height = chart.axisY - padding;

    chart.focus = {
        d: `M${point(pxFixed(vx), padding)}v${height}`,
        color: '#ccc'
    };

    // target
    pd.target = {
        left: rect.x + offsetX,
        top: rect.y,
        width: 0,
        height: rect.height - padding
    };
    pd.visible = true;

};

const onMouseMove = microtask(onMouseMoveSync);

const findResults = (timestamp) => {
    const results = [];
    chart.workerList.forEach((item) => {
        const result = item.list.find((it) => {
            if (timestamp >= it.timestamp && timestamp <= it.timestamp + it.duration) {
                return true;
            }
        });
        if (result) {
            results.push(result);
        }
    });
    if (results.length) {
        return results;
    }
};

const findTick = (timestamp) => {
    const tick = Util.findBetween(state.system.ticks, (a, b) => {
        const av = timestamp - a.timestamp;
        const bv = b.timestamp - timestamp;
        if (av >= 0 && bv >= 0) {
            return av > bv ? b : a;
        }
    });
    if (tick) {
        const { cpu, mem } = tick;
        chart.points = [{
            x: cpu.x,
            y: cpu.y,
            color: cpu.color
        }, {
            x: mem.x,
            y: mem.y,
            color: mem.color
        }];
    }
    return tick;
};

watch(() => pd.target, () => {
    if (pd.visible && popover.value) {
        popover.value.update();
    }
});

// =========================================================================================

const workerListHandler = () => {

    // width - left - padding
    chart.innerWidth = chart.width - chart.left - chart.padding;

    const system = state.system;
    const summary = state.summary;
    const jobs = system.jobs;
    // console.log(jobs);

    // init worker title and type
    jobs.forEach((item) => {
        const caseItem = state.detailMap[item.caseId];
        if (caseItem) {
            item.caseType = caseItem.caseType;
            item.title = caseItem.title;
        }
    });

    // sort by timestamp
    jobs.sort((a, b) => {
        if (a.timestamp === b.timestamp) {
            return a.parallelIndex - b.parallelIndex;
        }
        return a.timestamp - b.timestamp;
    });

    // console.log(list);
    const time_start = system.timestampStart;
    const time_end = system.timestampEnd;
    const duration = time_end - time_start;

    const point = Util.point;
    const dFixed = Util.dFixed;

    const left = chart.left;
    const padding = chart.padding;
    const width = chart.innerWidth;
    const height = 20;

    // group by parallelIndex
    const workerGroups = new Map();
    jobs.forEach((item) => {
        const index = item.parallelIndex;
        let group = workerGroups.get(index);
        if (!group) {
            group = {
                index,
                width,
                height,
                list: [],
                // failed, passed ...
                types: {}
            };
            workerGroups.set(index, group);
        }

        // console.log(item);

        const x = (item.timestamp - time_start) / duration * width;
        const w = item.duration / duration * width;

        group.list.push({
            ... item,
            x,
            w
        });

        // bar type d list
        let ds = group.types[item.caseType];
        if (!ds) {
            ds = [];
            group.types[item.caseType] = ds;
        }

        // min width 1px
        const sw = dFixed(Math.max(w, 1));
        ds.push(`M${point(x, 0)} h${sw} v${height} h-${sw} v-${height}z`);

    });

    const workerList = [];
    workerGroups.forEach((group) => {
        workerList.push(group);
    });

    workerList.sort((a, b) => {
        return a.index - b.index;
    });

    let barY = padding;
    workerList.forEach((item, i) => {
        item.bars = Object.keys(item.types).map((type) => {
            return {
                d: item.types[type].join(' '),
                color: summary[type].color
            };
        });
        item.x = left;
        item.y = barY;
        item.width = width;
        item.height = height;
        item.color = '#333';
        item.name = `Worker ${(item.index + 1)}`;
        barY += height + chart.gap;
    });

    chart.workerList = workerList;

    chart.height = barY;
};

const labelFixHandler = microtask((lastItem, maxItem) => {
    const $chart = document.querySelector('.mcr-timeline-chart');
    if (!$chart) {
        return;
    }

    const [$last, $max] = Array.from($chart.querySelectorAll('.mcr-timeline-axis text')).slice(-2);
    if (!$last || !$max) {
        return;
    }

    const chartBR = $chart.getBoundingClientRect();
    const chartEnd = chartBR.x + chartBR.width;

    const lastBR = $last.getBoundingClientRect();
    const lastEnd = lastBR.x + lastBR.width;

    if (lastEnd >= chartEnd) {
        $last.setAttribute('anchor', 'end');
        $max.innerHTML = '';
        return;
    }

    const maxBR = $max.getBoundingClientRect();
    const maxStart = maxBR.x - 10;
    if (lastEnd > maxStart) {
        $max.innerHTML = '';
    }
});

const gridHandler = (width, height) => {

    // width is innerWidth

    const point = Util.point;
    const pxFixed = Util.pxFixed;

    const system = state.system;
    const time_start = system.timestampStart;
    const time_end = system.timestampEnd;
    const maxTime = time_end - time_start;
    // console.log('maxTime', maxTime);

    const maxColumns = 10;
    const timeTicks = niceTicks(0, maxTime, maxColumns);
    const axisTicks = timeTicks.map((it) => {
        return {
            value: it,
            x: pxFixed(it / maxTime * width),
            anchor: 'middle',
            label: it ? Util.TF(it) : '0'
        };
    });

    // last and max
    const maxItem = axisTicks[axisTicks.length - 1];
    maxItem.isMax = true;
    maxItem.anchor = 'end';

    if (maxItem.value > maxTime) {
        // override max value and label
        maxItem.value = maxTime;
        maxItem.x = pxFixed(width);
        maxItem.label = Util.TF(maxTime);

        // label fixing
        const lastItem = axisTicks[axisTicks.length - 2];
        labelFixHandler(lastItem, maxItem);
    }

    // console.log(axisTicks);

    chart.axisTicks = axisTicks;

    // grid lines
    const gridList = [];

    const out = 5;
    axisTicks.forEach((it) => {
        gridList.push(`M${point(it.x, 0)}L${point(it.x, height + out)}`);
    });

    const gridRows = 4;
    const gridHeight = height / gridRows;
    for (let i = 0; i <= gridRows; i++) {
        const gy = pxFixed(i * gridHeight);
        gridList.push(`M${point(0, gy)}L${point(width, gy)}`);
    }
    const gridD = gridList.join('');

    chart.grid = {
        d: gridD,
        color: '#ddd'
    };
};

const usageHandler = () => {

    const system = state.system;

    // console.log(system);
    const time_start = system.timestampStart;
    const time_end = system.timestampEnd;
    const duration = time_end - time_start;
    // console.log('duration', duration);

    const point = Util.point;
    const dFixed = Util.dFixed;

    const left = chart.left;
    const width = chart.innerWidth;
    const height = 100;
    const y = chart.height;

    const cpuLine = {
        name: 'CPU',
        color: system.cpu.color,
        y: y + height * 0.5 - 10,
        ps: [],
        dStroke: '',
        dFill: ''
    };

    const memLine = {
        name: 'Memory',
        color: system.mem.color,
        y: y + height * 0.5 + 10,
        ps: [],
        dStroke: '',
        dFill: ''
    };

    const tickNum = system.ticks.length;
    if (tickNum) {
        const firstTick = JSON.parse(JSON.stringify(system.ticks[0]));
        const lastTick = JSON.parse(JSON.stringify(system.ticks[tickNum - 1]));
        // fix pre and post
        firstTick.timestamp = time_start;
        lastTick.timestamp = time_end;

        system.ticks.unshift(firstTick);
        system.ticks.push(lastTick);
    }

    const memTotal = system.mem.total;
    system.ticks.forEach((item, i) => {
        const {
            cpu, mem, timestamp
        } = item;

        const cpuPercent = cpu.percent;
        const memFree = mem.free;

        const x = (timestamp - time_start) / duration * width;
        const cpuY = (1 - cpuPercent / 100) * height;
        cpu.x = dFixed(x);
        cpu.y = dFixed(cpuY);
        cpu.color = cpuLine.color;
        cpuLine.ps.push(point(x, cpuY));

        const memY = memFree / memTotal * height;
        mem.x = dFixed(x);
        mem.y = dFixed(memY);
        mem.color = memLine.color;
        mem.used = Util.BF(system.mem.total - mem.free);
        mem.percent = ((system.mem.total - mem.free) / system.mem.total * 100).toFixed(2);
        memLine.ps.push(point(x, memY));
    });

    if (cpuLine.ps.length) {
        cpuLine.dStroke = `M${cpuLine.ps.join('L')}`;
        cpuLine.dFill = `M0,${height}L${cpuLine.ps.join('L')}V${height}`;
    }

    if (memLine.ps.length) {
        memLine.dStroke = `M${memLine.ps.join('L')}`;
        memLine.dFill = `M0,${height}L${memLine.ps.join('L')}V${height}`;
    }

    chart.lines = [memLine, cpuLine];

    gridHandler(width, height);

    chart.usage = {
        x: left,
        y,
        width,
        height
    };

    chart.height = y + height;

};

const axisHandler = () => {
    const point = Util.point;

    const left = chart.left;
    const padding = chart.padding;
    const width = chart.width - padding * 2;
    const height = 26;

    const x = padding;
    const y = chart.height;

    chart.axisY = y;

    const labelX = left - padding;

    const d = `M${point(0.5, 0.5)}h${width}`;

    chart.axis = {
        x,
        y,
        d,
        color: '#999'
    };

    const axisTicks = chart.axisTicks;

    chart.labels = axisTicks.map((item) => {
        return {
            x: labelX + item.x,
            y: height * 0.5,
            color: '#666',
            anchor: item.anchor,
            label: item.label
        };
    });

    chart.height = y + height + padding;
};

const update = () => {
    workerListHandler();
    usageHandler();
    axisHandler();
};

watch(() => state.system, (v) => {
    update();
});

onMounted(() => {
    update();
});

</script>

<style lang="scss">
.mcr-timeline-chart {
    position: relative;

    svg {
        max-width: 1000px;
    }
}

.mcr-long-label {
    flex-shrink: 1;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}

.mcr-timeline-popover {
    pointer-events: none;
}

.mcr-timeline-result {
    padding-bottom: 10px;
    border-bottom: 1px solid #ccc;
}

</style>
