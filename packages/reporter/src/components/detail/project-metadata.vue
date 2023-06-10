<script setup>
import { components } from 'vine-ui';
import IconLabel from '../icon-label.vue';
const { VuiFlex } = components;

const props = defineProps({
    column: {
        type: Object,
        default: () => {}
    }
});

</script>

<template>
  <div class="mcr-project-metadata">
    <VuiFlex
      v-if="props.column.list"
      gap="10px"
      padding="10px"
      wrap
    >
      <VuiFlex
        v-for="(item, i) in props.column.list"
        :key="i"
        gap="5px"
      >
        <IconLabel
          :icon="item.icon"
          :button="false"
        >
          <b>{{ item.name }}</b>
        </IconLabel>
        <a
          v-if="item.isLink"
          :href="item.value"
          target="_blank"
        >{{ item.value }}</a>
        <span v-else>{{ item.value }}</span>
      </VuiFlex>
    </VuiFlex>
  </div>
</template>

<style>
.mcr-project-metadata {
    position: relative;
}
</style>
