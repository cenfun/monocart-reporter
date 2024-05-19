<script setup>
import { components } from 'vine-ui';
import { titleTagsFormatter } from '../../modules/formatters.js';
import IconLabel from '../icon-label.vue';
const { VuiFlex } = components;

const props = defineProps({
    item: {
        type: Object,
        default: () => {}
    }
});

</script>

<template>
  <VuiFlex gap="5px">
    <IconLabel
      v-if="props.item.icon"
      :icon="props.item.icon"
      :button="false"
    />
    <div
      class="mcr-detail-title"
      v-html="titleTagsFormatter(props.item.data, props.item.titleColumn)"
    />

    <span
      v-if="props.item.data.count"
      class="mcr-num mcr-count"
    >{{ props.item.data.count }}</span>
  </VuiFlex>
</template>
