<script setup>
import { computed } from 'vue';
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
    },
    columnItem: {
        type: Object,
        default: () => {}
    }
});

const emit = defineEmits(['resize']);

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

const onResize = (e) => {
    emit('resize', props.rowItem);
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
      class="mcr-step-body"
      :list="rowItem.tg_detailColumns"
      @resize="onResize"
    />
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
