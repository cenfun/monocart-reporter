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
          <Pie />
        </div>
        <VuiFlex
          gap="15px"
          direction="column"
          padding="0 15px 15px 15px"
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
                :tooltip="item.description"
                @click="onAmountClick(item)"
              >
                {{ item.name }}: {{ Util.NF(item.value) }}
              </IconLabel>
            </VuiFlex>
          </template>

          <VuiFlex
            gap="15px"
            wrap
          >
            <IconLabel
              icon="top"
              @click="onSortClick('tests','duration')"
            >
              Top Slowest
            </IconLabel>

            <IconLabel
              icon="top"
              @click="onSortClick('failed','duration')"
            >
              Top Slowest Failed
            </IconLabel>
          </VuiFlex>
        </VuiFlex>
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
            gap="10px"
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
              icon="parallel"
              :button="false"
            >
              <b>Max Workers</b> <span class="mcr-num">{{ Util.NF(state.workers) }}</span>
            </IconLabel>

            <IconLabel
              icon="time"
              :button="false"
            >
              <b>Parallel Duration</b> <span class="mcr-num">{{ state.parallelDuration }}</span>
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
            <VuiFlex
              v-for="(item, i) in state.workerList"
              :key="i"
              class="mcr-report-worker"
              gap="10px"
            >
              <div :tooltip="'Parallel Index ' + item.index">
                <span class="mcr-num">{{ item.index }}</span>
              </div>
              <div class="vui-flex-auto">
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
          </VuiFlex>
        </div>
      </div>
    </div>
    <div class="mcr-report-footer">
      <VuiFlex
        gap="10px"
        padding="10px"
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
      ref="popover"
      v-model="data.popoverVisible"
      :positions="['top','bottom']"
      class="mcr-report-popover"
      :target="data.popoverTarget"
      width="260px"
    >
      <VuiFlex
        v-if="data.result"
        direction="column"
        gap="10px"
      >
        <IconLabel :icon="data.result.type">
          {{ data.result.title }}
        </IconLabel>
        <VuiFlex gap="10px">
          <IconLabel icon="calendar">
            {{ new Date(data.result.timestamp).toLocaleString() }}
          </IconLabel>
          <IconLabel icon="time">
            {{ Util.TF(data.result.duration) }}
          </IconLabel>
        </VuiFlex>
        <IconLabel icon="parallel">
          <VuiFlex gap="10px">
            <div>Parallel Index: {{ data.result.parallelIndex }}</div>
            <div>Worker Index: {{ data.result.workerIndex }}</div>
          </VuiFlex>
        </IconLabel>
      </VuiFlex>
    </VuiPopover>
  </VuiFlex>
</template>

<script setup>
import {
    reactive, watch, ref
} from 'vue';
import { components } from 'vine-ui';

import state from '../modules/state.js';
import Util from '../utils/util.js';
import {
    renderGrid, updateGrid, hideFlyover
} from '../modules/grid.js';

import IconLabel from './icon-label.vue';
import Pie from './pie.vue';

const { VuiFlex, VuiPopover } = components;

const popover = ref(null);

const data = reactive({
    item: null,
    offsetX: 0,
    barWidth: 0,

    result: null,
    popoverTarget: null,
    popoverVisible: false
});

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

    if (state.suiteVisible === false && state.caseType === caseType) {
        // manual render when same value
        renderGrid();
        return;
    }

    // auto renderGrid by watch state change
    state.suiteVisible = false;
    state.caseType = caseType;

};

const onTagClick = (tag) => {
    state.flyoverVisible = false;
    state.keywords = `@${tag.name}`;
    updateGrid();
};

// ====================================================================================

const hideResultPopover = () => {
    data.popoverVisible = false;
    data.item = null;
    data.result = null;
};

const showResultPopover = (result) => {
    if (!result) {
        hideResultPopover();
        return;
    }
    data.popoverVisible = true;
};

const onBarMouseMove = (item, e) => {
    data.item = item;
    data.offsetX = e.offsetX;

    const br = e.target.getBoundingClientRect();
    data.barX = br.x;
    data.barY = br.y;
    data.barWidth = br.width;
    data.barHeight = br.height;
};

watch([
    () => data.item,
    () => data.offsetX,
    () => data.barWidth
], () => {
    if (!data.item) {
        return;
    }
    const t = Math.round(data.offsetX / data.barWidth * data.item.duration) + data.item.time_start;
    const result = data.item.list.find((it) => {
        if (t >= it.timestamp && t <= it.timestamp + it.duration) {
            return true;
        }
    });

    data.result = result;
    if (!result) {
        return;
    }

    // console.log(result);

    const left = (result.timestamp - data.item.time_start) / data.item.duration * data.barWidth;
    const width = result.duration / data.item.duration * data.barWidth;

    const padding = 10;
    const target = {
        left: data.barX + left - padding,
        top: data.barY - padding,
        width: width + padding * 2,
        height: data.barHeight + padding * 2
    };

    data.popoverTarget = target;

});

watch(() => data.result, (result) => {
    showResultPopover(result);
});

watch(() => data.popoverTarget, () => {
    if (data.popoverVisible && popover.value) {
        popover.value.update();
    }
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
    border-bottom: 1px solid #cedbe9;
    background-color: #eef6ff;

    .mcr-num {
        background-color: #0888f0;
    }
}

.mcr-report-chart {
    padding: 10px;
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

.mcr-report-popover {
    pointer-events: none;
}

.mcr-report-footer {
    border-top: 1px solid #ddd;
    background-color: #eee;

    a:visited,
    a:link {
        color: #333;
    }
}
</style>
