<template>
  <div class="mcr-waterfall">
    <div
      v-for="(item, i) in data.rects"
      :key="i"
      :style="item.style"
      class="mcr-waterfall-rect"
    />
    <div
      v-for="(item, i) in data.lines"
      :key="i"
      :style="item.style"
      class="mcr-waterfall-line"
    />
  </div>
</template>
<script setup>
import { shallowReactive, watchEffect } from 'vue';
import Util from '../utils/util.js';
const props = defineProps({
    timings: {
        type: Object,
        default: null
    },
    pageTimings: {
        type: Object,
        default: null
    }
});

const data = shallowReactive({
    lines: [],
    rects: []
});

const update = (pageTimings, timings) => {

    if (!pageTimings) {
        return;
    }

    const { timestampStart, time } = pageTimings;

    data.lines = [];

    Util.pageTimings.forEach((item) => {
        const v = pageTimings[item.key];
        if (v > 0) {
            data.lines.push({
                style: {
                    left: Util.PF(v, time),
                    background: item.color
                }
            });
        }
    });

    data.rects = [];
    if (!timings) {
        return;
    }

    const startDuration = timings.timestampStart - timestampStart;

    let pos = 0;
    Util.timings.forEach((item) => {
        const v = timings[item.key];
        if (v && v > 0) {
            data.rects.push({
                style: {
                    left: Util.PF(startDuration + pos, time),
                    width: Util.PF(v, time),
                    background: item.color
                }
            });
            pos += v;
        }
    });
};

watchEffect(() => {
    update(props.pageTimings, props.timings);
});
</script>
<style lang="scss">
.mcr-waterfall {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: #f8f8f8;
}

.mcr-waterfall-line {
    position: absolute;
    top: 0;
    width: 1px;
    height: 100%;
}

.mcr-waterfall-rect {
    position: absolute;
    top: 50%;
    height: 50%;
    transform: translateY(-50%);
}
</style>
