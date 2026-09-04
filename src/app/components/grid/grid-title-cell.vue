<template>
  <div :class="['grid-title-cell', isCase ? 'tg-cell-open' : '']">
    <div v-html="formattedValue" />
    <div
      v-if="caseNum"
      class="mcr-num"
    >
      {{ caseNum }}
    </div>
    <div
      v-if="stepCount"
      class="mcr-num mcr-count"
    >
      {{ stepCount }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

import Util from '../../utils/util.js';
import { titleTagsFormatter } from '../../modules/title-tags.js';

const props = defineProps({
    rowItem: {
        type: Object,
        default: () => ({})
    },
    columnItem: {
        type: Object,
        default: () => ({})
    }
});

const formattedValue = computed(() => titleTagsFormatter(props.rowItem, props.columnItem));
const isCase = computed(() => props.rowItem.type === 'case');
const caseNum = computed(() => {
    if (props.rowItem.type === 'suite' && props.rowItem.caseNum) {
        return Util.NF(props.rowItem.caseNum);
    }
    return '';
});

// xN repeated step count
const stepCount = computed(() => {
    if (props.rowItem.type === 'step' && props.rowItem.count) {
        return Util.NF(props.rowItem.count);
    }
    return '';
});
</script>

<style lang="scss" scoped>
.grid-title-cell {
    display: flex;
    gap: 5px;
    align-items: center;
}

</style>
