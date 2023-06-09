<script setup>
import { watchEffect, shallowReactive } from 'vue';
import { components } from 'vine-ui';

import Util from '../../../utils/util.js';

import IconLabel from '../../icon-label.vue';

const { VuiFlex, VuiTab } = components;

const props = defineProps({
    data: {
        type: Object,
        default: () => {}
    }
});

const d = shallowReactive({
    tabIndex: 0,
    tempIndex: 0
});

const initImageComparison = () => {
    d.list = null;
    const { contentType, list } = props.data;
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

const switchTo = (e, category) => {
    if (Util.hasOwn(d.indexes, category)) {
        e.preventDefault();
        d.tabIndex = d.indexes[category];
    }
};

const onMouseDown = (e) => {
    d.tempIndex = d.tabIndex;
    const category = d.categories[d.tabIndex];
    if (category === 'actual') {
        switchTo(e, 'expected');
    } else if (category === 'expected') {
        switchTo(e, 'actual');
    } else if (category === 'diff') {
        switchTo(e, 'actual');
    }
};

const onMouseUp = (e) => {
    d.tabIndex = d.tempIndex;
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
    <summary class="mcr-attachment-head">
      <span v-if="d.list">image </span>mismatch: {{ props.data.name }}
    </summary>
    <div class="mcr-attachment-body">
      <VuiTab
        v-if="d.list"
        v-model="d.tabIndex"
        class="mcr-comparison-tab"
      >
        <template #right>
          <div class="mcr-comparison-note">
            <IconLabel
              icon="help"
              tooltip="Holding and Releasing the mouse on the image to quickly switch previews"
            />
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
            @mouseup="onMouseUp"
          >
            <img
              :src="item.path"
              :alt="item.name"
            >
          </div>
        </template>
      </VuiTab>

      <VuiFlex
        direction="column"
        gap="5px"
        padding="10px"
        class="mcr-comparison-list"
      >
        <a
          v-for="(item, i) of props.data.list"
          :key="i"
          :href="item.path"
          target="_blank"
          class="mcr-item"
        >{{ item.name }}</a>
      </VuiFlex>
    </div>
  </details>
</template>

<style lang="scss">
.mcr-attachment-comparison {
    .mcr-attachment-head {
        cursor: default;
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
        min-width: 81px;
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
