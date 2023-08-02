<script setup>
import { watchEffect, shallowReactive } from 'vue';
import { components } from 'vine-ui';

import Util from '../../../utils/util.js';
import state from '../../../modules/state.js';

import IconLabel from '../../icon-label.vue';
import AttachmentHead from './attachment-head.vue';

const { VuiFlex, VuiTab } = components;


const props = defineProps({
    data: {
        type: Object,
        default: () => {}
    }
});

const d = shallowReactive({
    tabIndex: 0,
    tempIndex: 0,
    mousedown: false,
    startX: 0
});

const initImageComparison = () => {
    d.list = null;
    const {
        contentType, list, message, position
    } = props.data;

    d.message = message;
    d.position = position;

    if (contentType && contentType.startsWith('image')) {
        const titles = {
            diff: 'Diff',
            actual: 'Actual',
            expected: 'Expected',
            previous: 'Previous'
        };

        d.indexes = {};
        d.categories = [];

        d.list = list.map((it, i) => {

            const {
                category, name, path
            } = it;

            d.indexes[category] = i;
            d.categories.push(category);

            return {
                title: titles[category],
                name,
                path
            };
        });

        if (Util.hasOwn(d.indexes, 'diff')) {
            d.tabIndex = d.indexes.diff;
        }

    }
};

const onErrorClick = () => {
    if (d.position) {
        state.position = d.position;
    }
};

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
    d.mousedown = false;
    d.tabIndex = d.tempIndex;
    Util.unbindEvents(windowEvents);
};

const onMouseMove = (e) => {
    if (!d.mousedown) {
        return;
    }
    const offsetX = e.pageX - d.startX;
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
    d.mousedown = true;
    d.startX = e.pageX;
    d.tempIndex = d.tabIndex;
    switchTo(e, 0);
    Util.bindEvents(windowEvents, window);
};

const onImgLoad = (e) => {
    const img = e.target;
    if (img && !d.size) {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const t = (w * h).toLocaleString();
        d.size = `${w} x ${h} = ${t} total pixels`;
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
    initImageComparison();
});

</script>

<template>
  <details
    class="mcr-attachment-comparison"
    open
  >
    <AttachmentHead :retry="props.data.retry">
      <IconLabel
        v-if="d.list"
        icon="image"
        :button="false"
      />
      <div>mismatch: {{ props.data.name }}</div>
    </AttachmentHead>
    <div class="mcr-attachment-body">
      <VuiTab
        v-if="d.list"
        v-model="d.tabIndex"
        class="mcr-comparison-tab"
      >
        <template #right>
          <div
            class="mcr-comparison-note"
            @mouseenter="showHelp($event, true)"
            @mouseleave="showHelp($event, false)"
          >
            <IconLabel icon="help" />
            <div hidden>
              <div class="mcr-readme">
                For quick comparison of the image, click and hold on the image. Depending on which tab you are on, the image will swap to a different one.
                <p>For example: </p>
                To compare the actual image with the expected one, select the <code>Actual</code> tab, click and hold the mouse on the image and it will show the image from the <code>Expected</code> tab.
                <br>
                Releasing the mouse will swap back to the image from the <code>Actual</code> tab.
              </div>
            </div>
          </div>
        </template>
        <template #tabs>
          <div
            v-for="(item, i) of d.list"
            :key="i"
          >
            {{ item.title }}
          </div>
        </template>
        <template #panes>
          <div
            v-for="(item, i) of d.list"
            :key="i"
            class="mcr-comparison-image"
            @mousedown="onMouseDown"
          >
            <img
              :src="item.path"
              :alt="item.name"
              @load="onImgLoad"
            >
          </div>
        </template>
      </VuiTab>

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
            class="mcr-item"
          >{{ item.name }}</a>
        </VuiFlex>
      </VuiFlex>
    </div>
  </details>
</template>

<style lang="scss">
.mcr-attachment-comparison {
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
    }

    .vui-tab-item::before {
        bottom: 10px;
        height: 10px;
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
        user-select: none;

        img {
            display: block;
            max-width: 100%;
            box-shadow: var(--image-shadow);
        }
    }
}
</style>
