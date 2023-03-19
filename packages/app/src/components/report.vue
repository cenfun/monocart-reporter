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
          >
            <IconLabel
              v-for="(item, i) in state.pieHeads"
              :key="i"
              :icon="item.icon"
              :button="false"
            >
              <b>{{ item.name }}</b> <span class="mcr-num">{{ Util.NF(item.value) }}</span>
            </IconLabel>
          </VuiFlex>
        </div>
        <div class="mcr-report-chart">
          <Pie />
        </div>
      </div>

      <div
        v-if="state.tagList"
        class="mcr-report-item"
      >
        <div class="mcr-report-head">
          <VuiFlex>
            <IconLabel
              icon="tag"
              :button="false"
            >
              <b>Tags</b> <span class="mcr-num">{{ Util.NF(state.tagList.length) }}</span>
            </IconLabel>
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
          <VuiFlex gap="15px">
            <IconLabel
              icon="parallel"
              :button="false"
            >
              <b>Workers</b> <span class="mcr-num">{{ Util.NF(state.workers) }}</span>
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
            v-for="(item, i) in state.workerList"
            :key="i"
            class="mcr-report-worker"
            gap="10px"
            padding="5px"
          >
            <div>
              <span class="mcr-num">{{ item.index }}</span>
            </div>
            <div class="vui-flex-auto">
              bar
            </div>
            <div>
              {{ Util.TF(item.duration) }}
            </div>
          </VuiFlex>
        </div>
      </div>
    </div>
    <div class="mcr-menu-footer">
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
  </VuiFlex>
</template>

<script setup>
import { components } from 'vine-ui';
import IconLabel from './icon-label.vue';
import state from '../modules/state.js';
import Util from '../utils/util.js';
import { updateGrid } from '../modules/grid.js';

import Pie from './pie.vue';

const { VuiFlex } = components;

const onTagClick = (tag) => {
    state.flyoverVisible = false;
    state.keywords = `@${tag.name}`;
    updateGrid();
};

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

.mcr-menu-footer {
    border-top: 1px solid #ddd;
    background-color: #eee;

    a:visited,
    a:link {
        color: #333;
    }
}
</style>
