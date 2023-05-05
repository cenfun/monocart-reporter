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
      <div>Request started at</div>
      <div>{{ Util.TSF(data.durationStart) }}</div>
    </VuiFlex>

    <VuiFlex
      v-for="(item, i) in data.rects"
      :key="i"
      gap="10px"
      padding="5px"
    >
      <div
        class="mcr-timing-legend"
        :style="item.style"
      />
      <div>{{ item.name }}</div>
      <div>{{ Util.TSF(item.value) }}</div>
    </VuiFlex>

    <VuiFlex
      gap="10px"
      padding="5px"
    >
      <div>Request time</div>
      <div>{{ Util.TSF(data.time) }}</div>
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
      <div>{{ item.name }}</div>
      <div>{{ Util.TSF(item.value) }}</div>
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
            timestampStart: entry.timestampStart,
            start: entry.start,
            time: entry.time
        };
        currentPage = state.pageMap[entry.pageref];
    }

    if (currentPage) {
        pageTimings = {
            ... currentPage.pageTimings,
            timestampStart: currentPage.timestampStart,
            start: currentPage.start,
            time: currentPage.time
        };
    }

    data.pageTimings = pageTimings;
    data.timings = timings;
    data.time = entry.time;

    if (!timings || !pageTimings) {
        return;
    }

    data.durationStart = timings.timestampStart - pageTimings.timestampStart;

    data.rects = [];
    Util.timings.forEach((item) => {
        const v = timings[item.key];
        data.rects.push({
            name: item.name,
            value: Math.max(v, 0),
            style: {
                background: item.color
            }
        });
    });


    data.lines = [];
    Util.pageTimings.forEach((item) => {
        const v = pageTimings[item.key];
        if (v > 0) {
            data.lines.push({
                name: item.name,
                value: Math.max(v, 0),
                style: {
                    background: item.color
                }
            });
        }
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

.mcr-timing-legend {
    width: 10px;
    height: 10px;
}

</style>
