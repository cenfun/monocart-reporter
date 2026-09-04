<script setup>
import { computed } from 'vue';

import Util from '../../utils/util.js';
import { titleTagsFormatter } from '../../modules/formatters.js';

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
const stepCount = computed(() => {
    if (props.rowItem.type === 'step' && props.rowItem.count) {
        return Util.NF(props.rowItem.count);
    }
    return '';
});
</script>

<template>
  <div
    v-if="isCase"
    class="tg-cell-open"
    v-html="formattedValue"
  />
  <template v-else>
    <span v-html="formattedValue" />
    <span
      v-if="caseNum"
      class="mcr-num"
    >{{ caseNum }}</span>
    <span
      v-if="stepCount"
      class="mcr-num mcr-count"
    >{{ stepCount }}</span>
  </template>
</template>
