<template>
  <VuiFlex
    direction="column"
    class="mcr-report"
  >
    <div class="mcr-report-main vui-flex-auto">
      <div class="mcr-report-item">
        <div class="mcr-report-head">
          <VuiFlex
            v-if="state.pieHeads"
            gap="15px"
            wrap
          >
            <IconLabel
              v-for="(item, i) in state.pieHeads"
              :key="i"
              :icon="item.icon"
              :tooltip="item.description"
              :button="false"
            >
              <b>{{ item.name }}</b> <span class="mcr-num">{{ Util.NF(item.value) }}</span>
            </IconLabel>
          </VuiFlex>
        </div>
        <div class="mcr-report-chart">
          <VuiFlex wrap>
            <Pie />
            <VuiFlex
              gap="15px"
              direction="column"
              padding="10px"
            >
              <template v-if="state.amounts">
                <VuiFlex
                  v-for="(group, i) in state.amounts"
                  :key="i"
                  gap="15px"
                  wrap
                >
                  <IconLabel
                    v-for="(item, j) in group.list"
                    :key="j"
                    :icon="item.icon || group.icon"
                    :button="group.button"
                    :primary="group.primary"
                    :tooltip="item.description"
                    @click="onAmountClick(item)"
                  >
                    {{ item.name }} <span class="mcr-num">{{ Util.NF(item.value) }}</span>
                  </IconLabel>
                </VuiFlex>
              </template>

              <VuiFlex
                gap="15px"
                wrap
              >
                <IconLabel
                  icon="time"
                  primary
                  @click="onSortClick('tests','duration')"
                >
                  Top Slowest
                </IconLabel>

                <IconLabel
                  icon="time"
                  primary
                  @click="onSortClick('failed','duration')"
                >
                  Top Failed Slowest
                </IconLabel>
              </VuiFlex>
            </VuiFlex>
          </VuiFlex>
        </div>
      </div>

      <div
        v-if="state.tagList"
        class="mcr-report-item"
      >
        <div class="mcr-report-head">
          <VuiFlex
            gap="15px"
            wrap
          >
            <IconLabel
              icon="tag"
              :button="false"
            >
              <b>Tags</b> <span class="mcr-num">{{ Util.NF(state.tagList.length) }}</span>
            </IconLabel>
            <div class="vui-flex-auto" />
            <a
              href="https://playwright.dev/docs/test-annotations#tag-tests"
              target="_blank"
            >
              <IconLabel icon="help">
                Tag Tests
              </IconLabel>
            </a>
          </VuiFlex>
        </div>
        <div class="mcr-report-chart">
          <VuiFlex
            gap="15px"
            wrap
            padding="10px"
          >
            <div
              v-for="(item, i) in state.tagList"
              :key="i"
              class="mcr-report-tag"
              @click="onTagClick(item)"
            >
              <span
                :style="item.style"
                :tooltip="item.description"
                class="mcr-tag"
              >{{ item.name }}</span>
              <span
                v-if="item.value>1"
                class="mcr-num"
              >{{ Util.NF(item.value) }}</span>
            </div>
          </VuiFlex>
        </div>
      </div>

      <div class="mcr-report-item">
        <div class="mcr-report-head">
          <VuiFlex
            gap="15px"
            wrap
          >
            <IconLabel
              icon="worker"
              :button="false"
            >
              <b>Workers</b> (Max: {{ Util.NF(state.workers) }})
            </IconLabel>

            <div class="vui-flex-auto" />

            <a
              href="https://playwright.dev/docs/test-parallel"
              target="_blank"
            >
              <IconLabel icon="help">
                Test Parallel
              </IconLabel>
            </a>
          </VuiFlex>
        </div>
        <div class="mcr-report-chart">
          <VuiFlex
            direction="column"
            gap="15px"
            padding="10px"
          >
            <div
              v-for="(item, i) in state.workerList"
              :key="i"
              class="mcr-report-worker"
            >
              <svg
                v-if="item.bars"
                :viewBox="item.viewBox"
                width="100%"
                height="100%"
                xmlns="http://www.w3.org/2000/svg"
                @mouseleave="hideResultPopover"
              >
                <rect
                  :width="item.width"
                  :height="item.height"
                  fill="#eee"
                  @mousemove="onBarMouseMove(item, $event)"
                />
                <g pointer-events="none">
                  <path
                    v-for="(bar, j) in item.bars"
                    :key="j"
                    :d="bar.d"
                    :fill="bar.color"
                  />
                </g>
              </svg>
            </div>
          </VuiFlex>
        </div>
      </div>

      <div class="mcr-report-item">
        <div class="mcr-report-head">
          <VuiFlex
            gap="15px"
            wrap
          >
            <IconLabel
              icon="system"
              :button="false"
            >
              <b>System</b>
            </IconLabel>

            <IconLabel
              icon="time"
              :button="false"
            >
              <b>Duration</b> <span class="mcr-num">{{ state.duration }}</span>
            </IconLabel>
          </VuiFlex>
        </div>
        <div class="mcr-report-chart">
          <VuiFlex
            gap="15px"
            padding="10px 10px 0 10px"
            wrap
          >
            <VuiFlex
              v-for="(item, j) in state.usageLegends"
              :key="j"
              gap="5px"
            >
              <IconLabel
                :icon="item.icon"
                :button="false"
                :style="'color:'+item.color"
              >
                <b>{{ item.name }}</b>
              </IconLabel>
              <div>{{ item.value }}</div>
            </VuiFlex>
          </VuiFlex>
          <VuiFlex
            v-if="state.usageChart"
            direction="column"
            gap="15px"
            padding="10px"
            class="mcr-report-usage"
          >
            <svg
              :viewBox="state.usageChart.viewBox"
              width="100%"
              height="100%"
              xmlns="http://www.w3.org/2000/svg"
              @mouseleave="hideUsagePopover"
            >
              <rect
                x="0.5"
                y="0.5"
                :width="state.usageChart.width-1"
                :height="state.usageChart.height-1"
                fill="#fff"
                :stroke="state.usageChart.color"
                @mousemove="showUsagePopover($event)"
              />
              <path
                :d="state.usageChart.grid.d"
                :stroke="state.usageChart.grid.color"
                pointer-events="none"
                fill="none"
              />
              <g
                v-if="state.usageChart.lines"
                pointer-events="none"
              >
                <g
                  v-for="(line, j) in state.usageChart.lines"
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
              </g>
              <g v-if="ud.points">
                <circle
                  v-for="(item, i) in ud.points"
                  :key="i"
                  :cx="item.x"
                  :cy="item.y"
                  :fill="item.color"
                  r="3"
                />
              </g>
            </svg>
          </VuiFlex>
          <VuiFlex
            gap="15px"
            direction="column"
            padding="10px"
          >
            <VuiFlex
              v-for="(group, i) in state.systemList"
              :key="i"
              gap="15px"
              wrap
            >
              <VuiFlex
                v-for="(item, j) in group.list"
                :key="j"
                gap="5px"
              >
                <IconLabel
                  :icon="item.icon"
                  :button="false"
                  :style="'color:'+item.color"
                >
                  <b>{{ item.name }}</b>
                </IconLabel>
                <div>{{ item.value }}</div>
              </VuiFlex>
            </VuiFlex>
          </VuiFlex>
        </div>
      </div>

      <div class="mcr-report-item">
        <div class="mcr-report-head">
          <VuiFlex
            gap="15px"
            wrap
          >
            <IconLabel
              icon="export"
              :button="false"
            >
              <b>Export Data</b>
            </IconLabel>
          </VuiFlex>
        </div>
        <div class="mcr-report-chart">
          <VuiFlex
            gap="15px"
            direction="column"
            padding="10px"
            class="mcr-report-export"
          >
            <VuiFlex
              v-for="(group, i) in exportList"
              :key="i"
              gap="15px"
              wrap
            >
              <IconLabel
                v-for="(item, j) in group.list"
                :key="j"
                :icon="item.icon"
                primary
                @click="onExportClick(item)"
              >
                {{ item.name }}
              </IconLabel>
            </VuiFlex>
          </VuiFlex>
        </div>
      </div>
    </div>
    <div class="mcr-report-footer">
      <VuiFlex
        gap="15px"
        padding="10px 15px"
      >
        <a
          href="https://github.com/microsoft/playwright"
          target="_blank"
        ><IconLabel
          icon="playwright"
          size="20px"
        >
          {{ state.playwright }}
        </IconLabel>
        </a>

        <a
          href="https://github.com/cenfun/monocart-reporter"
          target="_blank"
        ><IconLabel
          icon="github"
          size="20px"
        >
          {{ state.monocart }}
        </IconLabel>
        </a>
      </VuiFlex>
    </div>

    <VuiPopover
      ref="wdPopover"
      v-model="wd.visible"
      :positions="['top-','bottom-']"
      :target="wd.target"
      class="mcr-wd-popover"
      width="260px"
    >
      <VuiFlex

        direction="column"
        gap="10px"
      >
        <template v-if="wd.result">
          <IconLabel
            :icon="wd.result.type"
            :button="false"
          >
            {{ wd.result.title }}
          </IconLabel>
          <VuiFlex gap="10px">
            <IconLabel
              icon="calendar"
              :button="false"
            >
              {{ new Date(wd.result.timestamp).toLocaleString() }}
            </IconLabel>
            <IconLabel
              icon="time"
              :button="false"
            >
              {{ Util.TF(wd.result.duration) }}
            </IconLabel>
          </VuiFlex>
          <IconLabel
            icon="worker"
            :button="false"
          >
            Worker Index: {{ wd.result.workerIndex }}
          </IconLabel>
        </template>
        <IconLabel
          icon="parallel"
          :button="false"
        >
          Parallel Index: <span class="mcr-num">{{ wd.parallelIndex }}</span>
        </IconLabel>
      </VuiFlex>
    </VuiPopover>

    <VuiPopover
      ref="udPopover"
      v-model="ud.visible"
      :positions="['top-','bottom-']"
      :target="ud.target"
      class="mcr-ud-popover"
    >
      <VuiFlex
        v-if="ud.tick"
        direction="column"
        gap="10px"
      >
        <IconLabel
          icon="cpu"
          :button="false"
          :style="'color:'+ud.tick.cpu.color"
        >
          <b>CPU</b> {{ ud.tick.cpu.percent }}%
        </IconLabel>

        <IconLabel
          icon="memory"
          :button="false"
          :style="'color:'+ud.tick.mem.color"
        >
          <b>Memory</b> {{ ud.tick.mem.used }} ({{ ud.tick.mem.percent }}%)
        </IconLabel>
        <IconLabel
          icon="calendar"
          :button="false"
        >
          {{ new Date(ud.tick.timestamp).toLocaleString() }}
        </IconLabel>
      </VuiFlex>
    </VuiPopover>
  </VuiFlex>
</template>

<script setup>
import {
    shallowReactive, watch, ref
} from 'vue';
import { components } from 'vine-ui';
import { saveAs } from 'file-saver';

import state from '../modules/state.js';
import Util from '../utils/util.js';
import {
    renderGrid, updateGrid, hideFlyover
} from '../modules/grid.js';

import IconLabel from './icon-label.vue';
import Pie from './pie.vue';

const { VuiFlex, VuiPopover } = components;

// ====================================================================================

const onAmountClick = (item) => {

    const sortFields = {
        errors: 'errors',
        logs: 'logs',
        attachments: 'attachments',
        retries: 'retry'
    };

    const sortField = sortFields[item.id];
    if (sortField) {
        onSortClick('tests', sortField);
    }

};

const onSortClick = (caseType, sortField) => {
    hideFlyover(true);
    state.sortField = sortField;
    state.sortAsc = false;
    state.keywords = '';

    if (state.suiteVisible === false && state.caseType === caseType) {
        // manual render when same value
        renderGrid();
        return;
    }

    // auto renderGrid by watch state change
    state.suiteVisible = false;
    state.caseType = caseType;

};

// ====================================================================================

const onTagClick = (tag) => {
    state.flyoverVisible = false;
    state.caseType = 'tests';
    state.keywords = `@${tag.name}`;
    updateGrid();
};

// ====================================================================================

const getExportCases = (caseType) => {
    const list = [];
    Util.forEach(state.reportData.rows, (item) => {
        if (item.type === 'case' && item.caseType === caseType) {
            const it = {
                ... item
            };
            delete it.subs;
            delete it.steps;
            list.push(it);
        }
    });
    return list;
};

const exportList = [{
    list: [{
        name: 'Report Data',
        icon: 'item',
        getData: () => {
            return state.reportData;
        }
    }, {
        name: 'Summary',
        icon: 'item',
        getData: () => {
            return state.reportData.summary;
        }
    }, {
        name: 'Tags',
        icon: 'item',
        getData: () => {
            return state.tagList;
        }
    }, {
        name: 'Workers',
        icon: 'item',
        getData: () => {
            return state.workerList;
        }
    }]
}, {
    list: [{
        name: 'Errors',
        icon: 'item',
        getData: () => {
            const list = [];
            Util.forEach(state.reportData.rows, (item) => {
                if (item.errors) {
                    const it = {
                        ... item
                    };
                    delete it.subs;
                    delete it.steps;
                    list.push(it);
                }
            });
            return list;
        }
    }, {
        name: 'Failed Cases',
        icon: 'item',
        getData: () => {
            return getExportCases('failed');
        }
    }, {
        name: 'Skipped Cases',
        icon: 'item',
        getData: () => {
            return getExportCases('skipped');
        }
    }]
}];

const onExportClick = (item) => {
    const d = item.getData();
    if (!d) {
        return;
    }
    const string = JSON.stringify(d, null, 4);
    const blob = new Blob([string], {
        type: 'text/plain;charset=utf-8'
    });
    const filename = [state.title, state.date, item.name].join('-').replace(/[\s:/]+/g, '-');
    saveAs(blob, `${filename}.json`);
};


// ====================================================================================

const wdPopover = ref(null);

const wd = shallowReactive({
    item: null,
    offsetX: 0,
    barWidth: 0,

    parallelIndex: 0,
    result: null,
    target: null,
    visible: false
});


const hideResultPopover = () => {
    wd.visible = false;
    wd.item = null;
    wd.result = null;
};

const showResultPopover = () => {

    const result = wd.result;

    // console.log(result);

    let left = wd.offsetX;
    let width = 0;


    if (result) {
        left = (result.timestamp - wd.item.time_start) / wd.item.duration * wd.barWidth;
        width = result.duration / wd.item.duration * wd.barWidth;
    }

    const padding = 10;
    const target = {
        left: wd.barX + left - padding,
        top: wd.barY - padding,
        width: width + padding * 2,
        height: wd.barHeight + padding * 2
    };

    wd.target = target;

    wd.visible = true;

};

const onBarMouseMove = (item, e) => {
    wd.item = item;
    wd.offsetX = e.offsetX;

    const br = e.target.getBoundingClientRect();
    wd.barX = br.x;
    wd.barY = br.y;
    wd.barWidth = br.width;
    wd.barHeight = br.height;
};

watch([
    () => wd.item,
    () => wd.offsetX,
    () => wd.barWidth
], () => {
    if (!wd.item) {
        return;
    }
    wd.parallelIndex = wd.item.index;
    const t = Math.round(wd.offsetX / wd.barWidth * wd.item.duration) + wd.item.time_start;
    const result = wd.item.list.find((it) => {
        if (t >= it.timestamp && t <= it.timestamp + it.duration) {
            return true;
        }
    });
    wd.result = result;
    showResultPopover();
});

watch(() => wd.target, () => {
    if (wd.visible && wdPopover.value) {
        wdPopover.value.update();
    }
});

// ====================================================================================

const udPopover = ref(null);

const ud = shallowReactive({
    visible: false,
    target: null,
    tick: null,
    points: null
});

const hideUsagePopover = () => {
    ud.visible = false;
    ud.tick = null;
    ud.points = null;
};

const showUsagePopover = (e) => {
    const offsetX = e.offsetX;
    const br = e.target.getBoundingClientRect();
    const {
        x, y, width, height
    } = br;

    ud.x = x;
    ud.y = y;
    ud.width = width;
    ud.height = height;

    const ticks = state.system.ticks;
    const i = Math.floor(offsetX / width * ticks.length);
    const tick = ticks[i];
    ud.tick = tick;
};

watch(() => ud.target, () => {
    if (ud.visible && udPopover.value) {
        udPopover.value.update();
    }
});

watch(() => ud.tick, (tick) => {
    if (!tick) {
        return;
    }

    const { cpu, mem } = tick;

    ud.points = [{
        x: cpu.x,
        y: cpu.y,
        color: cpu.color
    }, {
        x: mem.x,
        y: mem.y,
        color: mem.color
    }];

    const ox = cpu.x / state.usageChart.width * ud.width;

    const padding = 10;
    const target = {
        left: ud.x + ox - padding,
        top: ud.y - padding,
        width: padding * 2,
        height: ud.height + padding * 2
    };

    // console.log(target);

    ud.target = target;

    ud.visible = true;
});

</script>
<style lang="scss">
.mcr-report {
    height: 100%;
}

.mcr-report-main {
    overflow-y: auto;
}

.mcr-report-item {
    position: relative;
}

.mcr-report-head {
    padding: 10px;
    border-bottom: 1px solid #dae9fa;
    background-color: #eef6ff;

    .mcr-num {
        background-color: #0888f0;
    }

    a {
        color: #333;
    }
}

.mcr-report-chart {
    padding: 10px;

    .vui-flex {
        flex-shrink: 1;
    }
}

.mcr-report-tag {
    position: relative;
    cursor: pointer;

    &:hover {
        opacity: 0.8;
    }

    .mcr-tag {
        position: relative;
        margin-top: 10px;
        vertical-align: middle;
    }

    .mcr-num {
        position: relative;
        margin-bottom: 10px;
        margin-left: -5px;
        vertical-align: middle;
    }
}

.mcr-report-worker {
    svg {
        max-width: 1000px;
    }

    .mcr-num {
        background: #888;
        cursor: default;
    }
}

.mcr-report-usage {
    svg {
        max-width: 1000px;
    }
}

.mcr-wd-popover {
    pointer-events: none;
}

.mcr-report-footer {
    background-color: #eee;

    a:visited,
    a:link {
        color: #333;
    }
}
</style>
