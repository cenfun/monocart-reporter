<template>
  <div class="mcr-timing">
    <div class="mcr-timing-waterfall">
      <Waterfall
        :timings="data.timings"
        :page-timings="data.pageTimings"
      />
    </div>
    <VuiFlex
      gap="10px"
      padding="5px"
    >
      <div class="mcr-timing-legend mcr-timing-legend-start" />
      <div>{{ Util.TF(data.durationStart," ") }}</div>
      <div>Request start time</div>
    </VuiFlex>

    <VuiFlex
      v-for="(item, i) in data.rects"
      :key="i"
      gap="10px"
      padding="5px"
      class="mcr-timing-rect"
    >
      <div
        class="mcr-timing-legend"
        :style="item.style"
      />
      <div>{{ Util.TF(item.value," ") }}</div>
      <div>{{ item.name }}</div>
    </VuiFlex>

    <VuiFlex
      v-for="(item, i) in data.lines"
      :key="i"
      gap="10px"
      padding="5px"
      class="mcr-timing-line"
    >
      <div
        class="mcr-timing-legend"
        :style="item.style"
      />
      <div>{{ Util.TF(item.value," ") }}</div>
      <div>{{ item.name }}</div>
    </VuiFlex>
  </div>
</template>
<script setup>
import {
    inject, shallowReactive, watchEffect
} from 'vue';

import { components } from 'vine-ui';

import Util from '../utils/util.js';
import Waterfall from './waterfall.vue';

const { VuiFlex } = components;

const props = defineProps({
    entry: {
        type: Object,
        default: null
    }
});

const state = inject('state');

const data = shallowReactive({
    rects: [],
    lines: []
});

const update = (entry) => {
    if (!entry) {
        return;
    }

    let timings = null;
    let pageTimings = null;

    let currentPage;
    if (entry.type === 'page') {
        currentPage = entry;
    } else {
        timings = {
            ... entry.timings,
            timestampStart: entry.timestampStart
        };
        currentPage = state.pageMap[entry.pageref];
    }

    if (currentPage) {
        pageTimings = {
            ... currentPage.pageTimings,
            timestampStart: currentPage.timestampStart,
            timestampEnd: currentPage.timestampEnd
        };
    }

    data.pageTimings = pageTimings;
    data.timings = timings;

    if (!timings || !pageTimings) {
        return;
    }

    data.durationStart = timings.timestampStart - pageTimings.timestampStart;

    data.rects = [];
    Util.timings.forEach((item) => {
        const v = timings[item.key];
        data.rects.push({
            name: item.name,
            value: v,
            style: {
                background: item.color
            }
        });
    });


    data.lines = [];
    Util.pageTimings.forEach((item) => {
        const v = pageTimings[item.key];
        data.lines.push({
            name: item.name,
            value: v,
            style: {
                background: item.color
            }
        });
    });


};

watchEffect(() => {
    update(props.entry);
});

</script>
<style lang="scss">
.mcr-timing {
    position: relative;
}

.mcr-timing-waterfall {
    height: 32px;
}

.mcr-timing-rect {
    margin-left: 20px;
}

.mcr-timing-legend {
    width: 10px;
    height: 10px;
}

.mcr-timing-legend-start {
    border: 1px solid #eee;
    background-color: #f8f8f8;
}
</style>
