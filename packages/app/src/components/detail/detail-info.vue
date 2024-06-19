<script setup>
import { computed } from 'vue';
import { components } from 'vine-ui';

// import IconLabel from '../icon-label.vue';
import DurationLocation from './duration-location.vue';
import DetailSimpleList from './detail-simple-list.vue';

// import Util from '../../utils/util.js';
import { showTooltip, hideTooltip } from '../../modules/tooltip.js';

const { VuiFlex } = components;

const props = defineProps({
    rowItem: {
        type: Object,
        default: () => {}
    },
    columnItem: {
        type: Object,
        default: () => {}
    }
});

// const data = shallowReactive({

// });

const classMap = computed(() => {
    const ls = ['mcr-step-info'];

    return ls;
});

const onMouseenter = (e) => {
    const node = e.target;
    if (node.clientWidth < node.scrollWidth) {
        const html = false;
        const text = node.innerText;
        showTooltip(node, text, html);
    }
};

const onMouseleave = (e) => {
    hideTooltip();
};


</script>

<template>
  <VuiFlex
    :class="classMap"
    direction="column"
    gap="5px"
  >
    <VuiFlex
      gap="10px"
      class="mcr-step-head"
    >
      <VuiFlex
        v-if="rowItem.type==='step-info'"
        gap="5px"
      >
        <b>{{ rowItem.title }}</b>
        <div class="mcr-num">
          {{ rowItem.stepNum }}
        </div>
      </VuiFlex>
      <div
        v-else
        class="mcr-tooltip"
        @mouseenter="onMouseenter"
        @mouseleave="onMouseleave"
      >
        {{ rowItem.title }}
      </div>

      <DetailSimpleList :list="rowItem.tg_simpleColumns" />

      <div class="vui-flex-auto" />

      <DurationLocation :row-item="rowItem" />
    </VuiFlex>
  </VuiFlex>
</template>

<style lang="scss">
.mcr-step-info {
    position: relative;
    font-weight: normal;
    overflow: hidden;
}

.mcr-step-head {
    min-height: 26px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}

.mcr-step-body {
    padding: 1px 0;
}

.mcr-tooltip {
    text-overflow: ellipsis;
}
</style>
