<script setup>
import {
    onMounted, onUnmounted, computed
} from 'vue';
import { components } from 'vine-ui';

// import IconLabel from '../icon-label.vue';
import DurationLocation from './duration-location.vue';
import DetailColumns from './detail-columns.vue';

// import Util from '../../utils/util.js';
import { showTooltip, hideTooltip } from '../../modules/tooltip.js';

const { VuiFlex } = components;

const props = defineProps({
    rowItem: {
        type: Object,
        default: () => {}
    }
});

// const data = shallowReactive({

// });

const classMap = computed(() => {
    const ls = ['mcr-step-info'];
    if (props.rowItem.tg_row_height_fixable) {
        ls.push('tg-multiline-fixing');
    }
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


onMounted(() => {

});

onUnmounted(() => {

});

</script>

<template>
  <VuiFlex
    :class="classMap"
    direction="column"
  >
    <VuiFlex gap="10px">
      <div
        class="mcr-tooltip vui-flex-auto"
        @mouseenter="onMouseenter"
        @mouseleave="onMouseleave"
      >
        {{ rowItem.title }}
      </div>

      <DurationLocation :row-item="rowItem" />
    </VuiFlex>

    <DetailColumns
      class="mcr-detail-body"
      :list="rowItem.tg_detailColumns"
    />
  </VuiFlex>
</template>

<style>
.mcr-step-info {
    position: relative;
}

.mcr-tooltip {
    text-overflow: ellipsis;
}
</style>
