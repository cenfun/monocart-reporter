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

    const {
        timestampStart, timestampEnd,
        onContentLoad, onLoad
    } = pageTimings;

    const duration = timestampEnd - timestampStart;

    data.lines = [];
    data.lines.push({
        style: {
            left: Util.PF(onContentLoad, duration),
            background: '#1a1aa6'
        }
    });

    data.lines.push({
        style: {
            left: Util.PF(onLoad, duration),
            background: '#c80000'
        }
    });

    data.rects = [];
    if (!timings) {
        return;
    }

    const startDuration = timings.timestampStart - timestampStart;
    const items = [{
        key: 'blocked',
        background: '#858585'
    }, {
        key: 'dns',
        background: '#009688'
    }, {
        key: 'connect',
        background: '#b52dcd'
    }, {
        key: 'send',
        background: '#74979a'
    }, {
        key: 'wait',
        background: '#00a846'
    }, {
        key: 'receive',
        background: '#0299de'
    }];
    let pos = 0;
    items.forEach((item) => {
        const v = timings[item.key];
        if (v && v > 0) {
            data.rects.push({
                style: {
                    left: Util.PF(startDuration + pos, duration),
                    width: Util.PF(v, duration),
                    background: item.background
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
    height: 10px;
    transform: translateY(-50%);
}
</style>
