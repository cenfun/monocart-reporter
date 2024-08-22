<script setup>
import {
    watch, watchEffect, shallowReactive, onUnmounted
} from 'vue';
import { components } from 'vine-ui';
import { microtask } from '../../../common/common.js';

import Util from '../../../utils/util.js';
import state from '../../../modules/state.js';
import { setPosition } from '../../../modules/detail.js';

import IconLabel from '../../icon-label.vue';

const {
    VuiFlex, VuiTab, VuiSwitch
} = components;


const props = defineProps({
    data: {
        type: Object,
        default: () => {}
    }
});

const d = shallowReactive({
    touch: Util.isTouchDevice(),
    tabIndex: 0,
    tempIndex: 0,
    startX: 0,
    imageTop: 0,
    imageLeft: 0,
    imageStyle: '',
    containerStyle: ''
});


const initImageComparison = (list) => {
    const titles = {
        diff: 'Diff',
        actual: 'Actual',
        expected: 'Expected',
        previous: 'Previous'
    };

    d.indexes = {};
    d.categories = [];

    const imageMap = {};

    d.imageList = list.map((it, i) => {

        const {
            category, name, path
        } = it;

        d.indexes[category] = i;
        d.categories.push(category);

        const item = {
            title: titles[category],
            category,
            name,
            path
        };

        imageMap[category] = item;

        return item;
    });

    // console.log(imageMap);
    d.imageMap = imageMap;
    d.sideLeft = imageMap.expected;
    d.sideRight = imageMap.actual;


    if (Util.hasOwn(d.indexes, 'diff')) {
        d.tabIndex = d.indexes.diff;
    }
};

const initTextComparison = (list) => {

    // list[0].content = ['<script>', 'alert(1);', '<', '/', 'script>', '</code>', 'next'].join('');

    d.textList = list;
};

const initComparison = () => {
    d.imageList = null;
    d.textList = null;
    const {
        contentType, list, message, position
    } = props.data;

    d.message = message;
    d.position = position;

    if (contentType && contentType.startsWith('image')) {
        initImageComparison(list);
        return;
    }

    // text/plain
    if (contentType && contentType.startsWith('text')) {
        initTextComparison(list);
        // return;
    }

    // console.log(contentType);


};

const onErrorClick = () => {
    setPosition(d.position);
};

// eslint-disable-next-line complexity
const switchTo = (e, offset = 0) => {
    const category = d.categories[d.tempIndex];
    let target;

    if (category === 'diff') {
        target = offset > 0 ? 'expected' : 'actual';
    } else if (category === 'actual') {
        target = offset < 0 ? 'diff' : 'expected';
    } else if (category === 'expected') {
        target = offset < 0 ? 'diff' : 'actual';
    }

    if (Util.hasOwn(d.indexes, target)) {
        e.preventDefault();
        d.tabIndex = d.indexes[target];
    }
};

const onMouseUp = (e) => {
    d.tabIndex = d.tempIndex;
    Util.unbindEvents(windowEvents);
};

const onMouseMove = (e) => {
    const offsetX = e.pageX - d.startX;
    const offsetY = e.pageY - d.startY;

    // pan if zoom
    if (d.percent > d.minPercent && d.container) {
        const minWidth = getMinWidth();
        const minHeight = Math.round(d.hw * minWidth);
        const w = d.imageWidth;
        const h = Math.round(d.hw * w);

        const l = d.startL + offsetX;
        const t = d.startT + offsetY;

        updateImage(l, t, w, h, minWidth, minHeight, true);

        return;
    }


    // switch the third one
    if (Math.abs(offsetX) < 10) {
        return;
    }
    switchTo(e, offsetX);
    d.startX = e.pageX;
};

const windowEvents = {
    mousemove: {
        handler: (e) => {
            onMouseMove(e);
        },
        options: true
    },
    mouseup: {
        handler: (e) => {
            onMouseUp(e);
        },
        options: {
            once: true
        }
    }
};

const onMouseDown = (e) => {
    d.startX = e.pageX;
    d.startY = e.pageY;
    d.startL = d.imageLeft;
    d.startT = d.imageTop;
    d.tempIndex = d.tabIndex;
    switchTo(e, 0);
    Util.bindEvents(windowEvents, window);
    // console.log(e.offsetX, e.offsetY);
};

const getMinWidth = () => {
    const padding = 10 * 2;
    const minWidth = d.container.clientWidth - padding;
    return Math.min(minWidth, d.maxWidth);
};

const updateImage = (l, t, w, h, minWidth, minHeight, dragging) => {

    const maxL = w - minWidth;
    const maxT = h - minHeight;
    // console.log(l, t, maxL, maxT);

    l = Util.clamp(l, -maxL, 0);
    t = Util.clamp(t, -maxT, 0);

    const ls = ['max-width: none;'];
    ls.push(`left: ${l}px;`);
    ls.push(`top: ${t}px;`);
    ls.push(`width: ${w}px;`);
    if (dragging) {
        ls.push('transition: none;');
    }

    d.imageStyle = ls.join(' ');

    d.imageLeft = l;
    d.imageTop = t;
    d.imageWidth = w;

    d.percent = Math.round(w / d.maxWidth * 100);
};

const zoomTo = (e, percent) => {
    if (!d.container) {
        return;
    }
    const minWidth = getMinWidth();
    const v = Math.round(d.maxWidth * percent * 0.01);
    const w = Math.min(Math.max(v, minWidth), d.maxWidth * 2);
    if (d.imageWidth === w) {
        return;
    }

    const br = d.container.getBoundingClientRect();
    const ox = Math.round(e.pageX - br.left - 10);
    const oy = Math.round(e.pageY - br.top - 10);

    // console.log(ox, oy);

    const imageHeight = d.hw * d.imageWidth;
    const sx = (-d.imageLeft + ox) / d.imageWidth;
    const sy = (-d.imageTop + oy) / imageHeight;

    const h = Math.round(d.hw * w);
    const l = -Math.round(w * sx - ox);
    const t = -Math.round(h * sy - oy);
    // console.log(l, t);


    const minHeight = Math.round(d.hw * minWidth);
    const padding = 10 * 2;
    const ch = minHeight + padding;
    d.containerStyle = `height: ${ch}px`;

    // console.log(l, t);

    updateImage(l, t, w, h, minWidth, minHeight);

};

const onDblClick = (e) => {
    if (d.tabIndex >= 3) {
        return;
    }

    if (!state.imageZoom) {
        return;
    }

    // console.log('onDblClick');
    setTimeout(() => {
        if (d.percent === 100) {
            zoomTo(e, d.minPercent - 1);
            return;
        }
        zoomTo(e, 100);
    });
};

const onMouseWheel = (e) => {
    if (!state.imageZoom) {
        return;
    }

    const deltaY = e.deltaY;
    const delta = deltaY > 0 ? -1 : 1;
    const percent = d.percent + 10 * delta;

    e.preventDefault();

    zoomTo(e, percent);

};

const onContainerResize = microtask(() => {
    if (!d.container) {
        return;
    }
    const minWidth = getMinWidth();
    d.imageWidth = minWidth;
    d.imageLeft = 0;
    d.imageTop = 0;
    d.imageStyle = `left: 0; top: 0; transition: none; width: ${minWidth}px;`;
    d.containerStyle = '';
    // init percent
    d.minPercent = Math.round(minWidth / d.maxWidth * 100);
    d.percent = d.minPercent;
});


const containerEvents = {
    mousedown: {
        handler: (e) => {
            onMouseDown(e);
        }
    },
    wheel: {
        handler: (e) => {
            onMouseWheel(e);
        }
    },
    dblclick: {
        handler: (e) => {
            onDblClick(e);
        }
    }
};

const onImgLoad = (e) => {
    const img = e.target;
    if (img && !d.size) {
        const container = img.parentNode.parentNode;
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const t = (w * h).toLocaleString();
        d.size = `${w} x ${h} = ${t} total pixels`;
        d.maxWidth = w;
        d.maxHeight = h;
        d.hw = h / w;
        d.container = container;
        Util.bindEvents(containerEvents, container);
        onContainerResize();
    }
};

const onSideClick = () => {
    console.log('side click');
    if (d.sideRight === d.imageMap.actual) {
        d.sideRight = d.imageMap.diff;
    } else {
        d.sideRight = d.imageMap.actual;
    }
};

const showHelp = (e, visible) => {

    const tooltip = state.tooltip;

    tooltip.visible = visible;
    if (!visible) {

        tooltip.target = null;
        tooltip.html = false;
        tooltip.text = '';

        return;
    }

    tooltip.target = e.target;
    tooltip.html = true;

    const $content = e.target.querySelector('div[hidden]');
    if ($content) {
        tooltip.text = $content.innerHTML;
    }

};

watchEffect(() => {
    initComparison();
});

watch([
    () => state.flyoverWidth,
    () => state.windowWidth,
    () => state.imageZoom
], () => {
    onContainerResize();
});

onUnmounted(() => {
    d.container = null;
    Util.unbindEvents(windowEvents);
    Util.unbindEvents(containerEvents);
});

</script>

<template>
  <div class="mcr-attachment-comparison">
    <VuiTab
      v-if="d.imageList"
      v-model="d.tabIndex"
      class="mcr-comparison-tab"
    >
      <template #right>
        <div class="mcr-comparison-zoom">
          <VuiSwitch
            v-if="!d.touch"
            v-model="state.imageZoom"
            width="28px"
            height="16px"
            :label-clickable="true"
            label-position="right"
          >
            Zoom
            {{ d.percent }}%
          </VuiSwitch>
        </div>
        <div
          class="mcr-comparison-note"
          @mouseenter="showHelp($event, true)"
          @mouseleave="showHelp($event, false)"
        >
          <IconLabel icon="help" />
          <div hidden>
            <div class="mcr-readme mcr-comparison-help">
              <h3>Help on the image:</h3>
              <li class="mcr-item">
                Mouse Down/Up: switch view with neighbor
              </li>
              <li class="mcr-item">
                Double Click: zoom to 100% or reset
              </li>
              <li class="mcr-item">
                Mouse Wheel: zoom in/out
              </li>
              <li class="mcr-item">
                Mouse Drag: switch view or pan
              </li>
            </div>
          </div>
        </div>
      </template>
      <template #tabs>
        <div
          v-for="(item, i) of d.imageList"
          :key="i"
        >
          {{ item.title }}
        </div>
        <div>Side by side</div>
        <div>Slider</div>
      </template>
      <template #panes>
        <div
          v-for="(item, i) of d.imageList"
          :key="i"
          class="mcr-comparison-image"
          :style="d.containerStyle"
        >
          <img
            :src="item.path"
            :alt="item.name"
            :style="d.imageStyle"
            @load="onImgLoad"
          >
        </div>
        <div>
          <div
            v-if="d.imageMap"
            class="mcr-side-by-side"
          >
            <div class="mcr-side-item">
              <img
                :src="d.sideLeft.path"
                :alt="d.sideLeft.name"
              >
              <div>{{ d.sideLeft.title }}</div>
            </div>
            <div class="mcr-side-item">
              <img
                :src="d.sideRight.path"
                :alt="d.sideRight.name"
                @click="onSideClick"
              >
              <div>{{ d.sideRight.title }}</div>
            </div>
          </div>
        </div>
        <div>Slider</div>
      </template>
    </VuiTab>

    <VuiFlex
      v-if="d.textList"
      gap="10px"
      padding="10px"
      width="100%"
      align-items="start"
      shirk
      wrap
    >
      <div
        v-for="(item, i) of d.textList"
        :key="i"
        class="mcr-text-item"
      >
        <div class="mcr-text-head">
          {{ item.category }}
        </div>
        <pre><code>{{ item.content }}</code></pre>
      </div>
    </VuiFlex>

    <VuiFlex
      direction="column"
      gap="10px"
      padding="10px"
    >
      <VuiFlex
        v-if="d.message"
        gap="10px"
        wrap
        shirk
      >
        <IconLabel
          icon="error"
          gap="10px"
          @click="onErrorClick"
        >
          {{ d.message }}
        </IconLabel>
        <div v-if="d.size">
          ({{ d.size }})
        </div>
      </VuiFlex>

      <VuiFlex
        gap="10px"
        wrap
      >
        <a
          v-for="(item, i) of props.data.list"
          :key="i"
          :href="item.path"
          target="_blank"
          :download="item.name"
          class="mcr-item"
        >{{ item.name }}</a>
      </VuiFlex>
    </VuiFlex>
  </div>
</template>

<style lang="scss">
.mcr-attachment-comparison {
    .mcr-text-item {
        position: relative;
        max-width: 100%;
        overflow: hidden;

        pre {
            margin: 0;
            padding: 5px;
            border: 1px solid #ccc;
            border-radius: 5px;
            background: #f8f8f8;
            overflow-x: auto;
        }

        code {
            margin: 0;
            padding: 0;
        }
    }

    .mcr-text-head {
        margin-bottom: 5px;
        text-transform: capitalize;
    }

    .vui-tab-header {
        background: #f5f5f5;
    }

    .vui-tab-tabs {
        padding-top: 5px;
    }

    .vui-tab-item {
        justify-content: center;
        height: 30px;
        min-width: 60px;
        line-height: 30px;
        text-align: center;
    }

    .vui-tab-item::before {
        bottom: 10px;
        height: 15px;
    }

    .mcr-comparison-tab {
        border-bottom: 1px solid #eee;
    }

    .mcr-comparison-note {
        margin-right: 10px;
    }

    .mcr-comparison-image {
        padding: 10px;
        cursor: default;
        overflow: hidden;
        user-select: none;

        img {
            position: relative;
            display: block;
            max-width: 100%;
            box-shadow: var(--image-shadow);
            transition: all 0.1s ease-out;
        }
    }

    .mcr-side-by-side {
        display: flex;
        justify-content: space-between;
        padding: 10px;

        .mcr-side-item {
            width: calc(50% - 5px);
            text-align: center;

            img {
                position: relative;
                display: block;
                width: 100%;
                margin-bottom: 10px;
                box-shadow: var(--image-shadow);
                transition: all 0.1s ease-out;
            }
        }
    }
}

/**
in tooltip, out of component
*/
.mcr-comparison-help {
    min-width: 300px;

    h3 {
        margin: 5px 0;
    }
}
</style>
