<script setup>
import {
    watch, watchEffect, reactive, shallowReactive, onUnmounted, onMounted, ref
} from 'vue';
import { components } from 'vine-ui';
import { microtask } from '../../../common/common.js';

import Util from '../../../utils/util.js';
import state from '../../../modules/state.js';
import { setPosition } from '../../../modules/detail.js';

import SME from '../../../common/start-move-end.js';

import IconLabel from '../../icon-label.vue';

const {
    VuiFlex, VuiTab, VuiSwitch, VuiProgress
} = components;

const props = defineProps({
    data: {
        type: Object,
        default: () => {}
    }
});

// full size image
const imgF = reactive({
    startX: 0,
    startY: 0,
    imageTop: 0,
    imageLeft: 0,
    opacity: 100,
    imageStyle: {},
    wrapperStyle: {}
});

// half size image (side by side)
const imgH = reactive({
    startX: 0,
    startY: 0,
    imageTop: 0,
    imageLeft: 0,
    opacity: 100,
    imageStyle: {},
    wrapperStyle: {}
});

const d = shallowReactive({
    tabIndex: 0,
    tempIndex: 0,
    img: imgF
});

const el = ref(null);
const gutter = ref(null);

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

    if (d.tabIndex >= 3) {
        return;
    }

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

// ===================================================================================================

const onDragDown = (e) => {
    // stop drag event for side by side
    e.preventDefault();

    const ee = e.type.startsWith('touch') ? e.touches[0] : e;

    d.img.startX = ee.pageX;
    d.img.startY = ee.pageY;

    d.startL = d.img.imageLeft;
    d.startT = d.img.imageTop;
    d.tempIndex = d.tabIndex;

    switchTo(e, 0);

};

const onDragMove = (e) => {

    const ee = e.type.startsWith('touch') ? e.touches[0] : e;

    const offsetX = ee.pageX - d.img.startX;
    const offsetY = ee.pageY - d.img.startY;

    // pan if zoom
    if (d.img.percent > d.img.minPercent && d.container) {

        const minWidth = getMinWidth();
        const minHeight = Math.round(d.hw * minWidth);
        const w = d.img.imageWidth;
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
    d.img.startX = ee.pageX;
};


const onDragUp = (e) => {
    d.tabIndex = d.tempIndex;
};

const getMinWidth = () => {
    const minWidth = d.container.clientWidth;
    return Math.min(minWidth, d.maxWidth);
};

const updateImage = (l, t, w, h, minWidth, minHeight, dragging) => {

    const maxL = w - minWidth;
    const maxT = h - minHeight;
    // console.log(l, t, maxL, maxT);

    l = Util.clamp(l, -maxL, 0);
    t = Util.clamp(t, -maxT, 0);

    const imageStyle = {
        'max-width': 'none',
        'left': `${l}px`,
        'top': `${t}px`,
        'width': ` ${w}px`
    };

    if (dragging) {
        imageStyle.transition = 'none';
    }

    d.img.imageStyle = imageStyle;

    d.img.imageLeft = l;
    d.img.imageTop = t;
    d.img.imageWidth = w;

    d.img.percent = Math.round(w / d.maxWidth * 100);
};

const zoomTo = (e, percent) => {
    const minWidth = getMinWidth();
    const v = Math.round(d.maxWidth * percent * 0.01);
    const w = Math.min(Math.max(v, minWidth), d.maxWidth * 2);
    if (d.img.imageWidth === w) {
        return;
    }

    const br = d.container.getBoundingClientRect();

    const ee = e.type.startsWith('touch') ? e.touches[0] : e;

    const ox = Math.round(ee.pageX - br.left - 10);
    const oy = Math.round(ee.pageY - br.top - 10);

    // console.log(ox, oy);

    const imageHeight = d.hw * d.img.imageWidth;
    const sx = (-d.img.imageLeft + ox) / d.img.imageWidth;
    const sy = (-d.img.imageTop + oy) / imageHeight;

    const h = Math.round(d.hw * w);
    const l = -Math.round(w * sx - ox);
    const t = -Math.round(h * sy - oy);
    // console.log(l, t);


    const minHeight = Math.round(d.hw * minWidth);
    d.img.wrapperStyle = {
        height: `${minHeight}px`
    };

    // console.log(l, t);

    updateImage(l, t, w, h, minWidth, minHeight);

};

const onDblClick = (e) => {

    if (!state.imageZoom) {
        return;
    }

    // console.log('onDblClick');
    setTimeout(() => {

        if (d.img.percent < 100) {
            zoomTo(e, 100);
            return;
        }

        if (d.img.percent < 200) {
            zoomTo(e, 200);
            return;
        }

        zoomTo(e, d.img.minPercent - 1);
    });
};


const onMouseWheel = (e) => {
    if (!state.imageZoom) {
        return;
    }

    const deltaY = e.deltaY;
    const delta = deltaY > 0 ? -1 : 1;
    const percent = d.img.percent + 10 * delta;

    e.preventDefault();

    // d.imageCursor = delta > 0 ? 'zoom-in' : 'zoom-out';

    zoomTo(e, percent);

};

const onContainerResize = microtask((reset) => {
    if (!d.container) {
        return;
    }
    const minWidth = getMinWidth();
    if (d.img.minWidth === minWidth && !reset) {
        return;
    }

    d.img.minWidth = minWidth;
    d.img.imageWidth = minWidth;
    d.img.imageLeft = 0;
    d.img.imageTop = 0;
    d.img.imageStyle = {
        left: 0,
        top: 0,
        transition: 'none',
        width: `${minWidth}px`
    };
    d.img.wrapperStyle = {};

    // init percent
    d.img.minPercent = Math.round(minWidth / d.maxWidth * 100);
    d.img.percent = d.img.minPercent;

    // fix gutter
    updateGutter(gutter.value);
});


const onImgLoad = (e) => {
    const img = e.target;
    if (img && !d.size) {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const t = (w * h).toLocaleString();
        d.size = `${w} x ${h} = ${t} total pixels`;
        d.maxWidth = w;
        d.maxHeight = h;
        d.hw = h / w;
        onContainerResize();
    }
};

const onSideClick = () => {
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

const getMaskImage = (pos) => {
    return `linear-gradient(to right, red, red ${pos}, transparent ${pos}, transparent)`;
};


const updateGutter = ($gutter) => {
    if (!$gutter) {
        return;
    }

    const padding = 10;
    const $top = $gutter.parentNode.parentNode.querySelector('.mcr-slider-top');

    const max = $gutter.parentNode.getBoundingClientRect().width;
    if (max > 0) {
        const x = Math.max(Math.min(d.gutterLeft, max), 0);
        $gutter.style.left = `${x - padding / 2}px`;
        $top.style.maskImage = getMaskImage(`${x + padding}px`);
    } else {
        $gutter.style.left = `calc(50% - ${padding / 2}px)`;
        $top.style.maskImage = getMaskImage('50%');
    }

};

const initGutter = () => {
    const $gutter = gutter.value;

    updateGutter($gutter);

    const sme = new SME($gutter);
    const padding = 10;

    let left = 0;
    sme.bind(SME.START, (e) => {
        d.gutterEnabled = true;
        left = $gutter.offsetLeft + padding / 2;
    });

    sme.bind(SME.MOVE, (e) => {
        if (d.gutterEnabled) {
            d.gutterLeft = left + e.detail.offsetX;
            updateGutter($gutter);
        }
    });

    sme.bind(SME.END, (e) => {
        d.gutterEnabled = false;
    });
};

const updateOpacity = (imageStyle) => {
    return {
        ... imageStyle,
        opacity: d.img.opacity / 100
    };
};

const initOpacity = () => {
    const $el = el.value;
    const $opacity = $el.querySelector('.mcr-comparison-opacity');
    const sme = new SME($opacity);
    sme.bind(SME.START, (e) => {
        if (d.tabIndex === 4) {

            const ed = e.detail;
            const ee = ed.e;

            const eee = ee.type.startsWith('touch') ? ee.touches[0] : ee;

            const x = eee.pageX - ee.target.getBoundingClientRect().left;
            // console.log(x);

            d.opacityEnabled = true;
            const left = sme.clamp(Math.round(x), 0, 100);
            d.img.opacityLeft = left;
            d.img.opacity = left;

        }
    });

    sme.bind(SME.MOVE, (e) => {
        if (d.opacityEnabled) {
            const ed = e.detail;
            const left = sme.clamp(Math.round(d.img.opacityLeft + ed.offsetX), 0, 100);
            d.img.opacity = left;
        }
    });

    sme.bind(SME.END, (e) => {
        d.opacityEnabled = true;
    });
};

const getEventTargetContainer = (e) => {
    let node = e.target;

    // slider is top
    if (node.classList.contains('mcr-slider')) {
        return node.parentNode.querySelector('.mcr-comparison-image');
    }

    while (node) {
        if (node.classList && node.classList.contains('mcr-comparison-image')) {
            return node;
        }
        node = node.parentNode;
    }
};

let previousTouch = Date.now();
const globalEvents = {
    wheel: {
        handler: (e) => {
            const container = getEventTargetContainer(e);
            if (container) {
                d.container = container;
                onMouseWheel(e);
            }
        }
    },
    dblclick: {
        handler: (e) => {
            // can not get event target container
            if (d.container) {
                onDblClick(e);
            }
        }
    },
    touchstart: {
        handler: (e) => {
            // mock dblclick
            const now = Date.now();
            if (now - previousTouch < 400) {

                const container = getEventTargetContainer(e);
                if (container) {
                    d.container = container;
                    onDblClick(e);
                }
            }
            previousTouch = now;
        },
        options: {
            passive: false
        }
    }
};

const initEvents = () => {
    const $el = el.value;
    Util.bindEvents(globalEvents, $el);

    const sme = new SME($el, {
        proxy: (e) => {
            const container = getEventTargetContainer(e);
            if (container) {
                return true;
            }
        }
    });

    sme.bind(SME.START, (e) => {

        if (d.gutterEnabled) {
            return;
        }

        const ed = e.detail;
        const ee = ed.e;
        const container = getEventTargetContainer(ee);
        if (!container) {
            return;
        }

        d.container = container;
        d.dragEnabled = true;

        onDragDown(ee);

    });

    sme.bind(SME.MOVE, (e) => {
        if (d.dragEnabled) {
            const ed = e.detail;
            const ee = ed.e;
            onDragMove(ee);
        }
    });

    sme.bind(SME.END, (e) => {
        d.dragEnabled = false;
        const ed = e.detail;
        const ee = ed.e;
        onDragUp(ee);
    });

};

const updateCurrentTabContainer = () => {
    const $el = el.value;
    const $pane = $el.querySelector(`.vui-tab-pane[index="${d.tabIndex}"]`);
    if ($pane) {
        d.container = $pane.querySelector('.mcr-comparison-image');
    }
};

watchEffect(() => {
    initComparison();
});

watch(() => d.tabIndex, (i) => {
    updateCurrentTabContainer();

    // side by side
    if (i === 3) {
        d.img = imgH;
    } else {
        d.img = imgF;
    }

    const reset = !state.imageZoom;
    onContainerResize(reset);
});

watch([
    () => state.flyoverWidth,
    () => state.windowWidth,
    () => state.imageZoom
], () => {
    onContainerResize(true);
});

onMounted(() => {
    updateCurrentTabContainer();
    initEvents();
    initGutter();
    initOpacity();
});

onUnmounted(() => {
    Util.unbindEvents(globalEvents);
});

</script>

<template>
  <div
    ref="el"
    class="mcr-attachment-comparison"
  >
    <VuiTab
      v-if="d.imageList"
      v-model="d.tabIndex"
    >
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
        >
          <div
            class="mcr-comparison-image"
            :style="d.img.wrapperStyle"
          >
            <img
              :src="item.path"
              :alt="item.name"
              :style="d.img.imageStyle"
              @load="onImgLoad"
            >
          </div>
        </div>
        <div>
          <div
            v-if="d.imageMap"
            class="mcr-side-by-side"
          >
            <div
              class="mcr-comparison-image"
              :style="d.img.wrapperStyle"
            >
              <img
                :src="d.sideLeft.path"
                :alt="d.sideLeft.name"
                :title="d.sideLeft.title"
                :style="d.img.imageStyle"
              >
            </div>
            <div
              class="mcr-comparison-image"
              :style="d.img.wrapperStyle"
            >
              <img
                :src="d.sideRight.path"
                :alt="d.sideRight.name"
                :title="d.sideRight.title"
                :style="d.img.imageStyle"
                @click="onSideClick"
              >
            </div>
          </div>
        </div>
        <div>
          <div
            class="mcr-comparison-image"
            :style="d.img.wrapperStyle"
          >
            <img
              :src="d.imageMap.expected.path"
              :alt="d.imageMap.expected.name"
              :style="d.img.imageStyle"
            >
          </div>

          <div class="mcr-slider-top">
            <div
              class="mcr-comparison-image"
              :style="d.img.wrapperStyle"
            >
              <img
                :src="d.imageMap.actual.path"
                :alt="d.imageMap.actual.name"
                :style="updateOpacity(d.img.imageStyle)"
              >
            </div>
          </div>

          <div class="mcr-slider">
            <div
              ref="gutter"
              :class="['mcr-slider-gutter', d.gutterEnabled?'mcr-slider-gutter-moving':'']"
            >
              <div />
            </div>
          </div>
        </div>
      </template>
    </VuiTab>

    <VuiFlex
      class="mcr-comparison-toolbar"
      align="space-between"
      padding="5px 10px 10px 10px"
    >
      <VuiFlex gap="20px">
        <VuiSwitch
          v-model="state.imageZoom"
          class="mcr-comparison-zoom"
          width="28px"
          height="16px"
          :label-clickable="true"
          label-position="right"
        >
          <VuiFlex gap="5px">
            <div>Zoom In/Out</div>
            <b v-if="state.imageZoom">
              {{ d.img.percent }}%
            </b>
          </VuiFlex>
        </VuiSwitch>

        <VuiFlex
          v-show="d.tabIndex===4"
          gap="5px"
        >
          <div>Opacity</div>
          <VuiProgress
            class="mcr-comparison-opacity"
            :percentage="d.img.opacity"
            height="8px"
            width="100px"
          />
          <b>{{ d.img.opacity }}%</b>
        </VuiFlex>
      </VuiFlex>
      <div
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
              Double Click: zoom in 100%/200% or reset
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
    </VuiFlex>

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

    > div {
        min-width: 420px;
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

    .mcr-comparison-toolbar {
        border-bottom: 1px solid #eee;
        user-select: none;
    }

    .mcr-comparison-image {
        width: calc(100% - 20px);
        margin: 10px;
        box-shadow: var(--image-shadow);
        cursor: default;
        overflow: hidden;
        user-select: none;

        img {
            position: relative;
            display: block;
            width: 100%;
            transition: all 0.1s ease-out;
        }
    }

    .mcr-side-by-side {
        display: flex;
        user-select: none;
    }

    .mcr-slider {
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 100;
        width: calc(100% - 20px);
        height: calc(100% - 20px);
        user-select: none;
    }

    .mcr-slider-gutter {
        position: absolute;
        top: 0;
        left: 50%;
        width: 10px;
        height: 100%;
        cursor: ew-resize;

        &::before {
            position: absolute;
            top: -10px;
            left: 0;
            content: "";
            width: 10px;
            height: 10px;
            background-image: url("../../../images/gutter-up.svg");
            opacity: 0.6;
        }

        &::after {
            position: absolute;
            top: 100%;
            left: 0;
            content: "";
            width: 10px;
            height: 10px;
            background-image: url("../../../images/gutter-down.svg");
            opacity: 0.3;
        }

        div {
            position: relative;
            left: 50%;
            height: 100%;
            border-left: thin solid #000;
            opacity: 0.5;
        }
    }

    .mcr-slider-gutter-moving,
    .mcr-slider-gutter:hover {
        &::before,
        &::after,
        div {
            opacity: 1;
        }
    }

    .mcr-slider-top {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 10;
        width: 100%;

        .mcr-comparison-image {
            box-shadow: none;
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
