<script setup>
import { components } from 'vine-ui';
import IconLabel from './icon-label.vue';
const { VuiFlex } = components;

const props = defineProps({
    list: {
        type: Array,
        default: () => []
    }
});

</script>

<template>
  <div class="mcr-metadata-list">
    <VuiFlex
      v-if="props.list"
      gap="10px"
      padding="10px"
      wrap
      shrink
    >
      <VuiFlex
        v-for="(item, i) in props.list"
        :key="i"
        gap="5px"
        shrink
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
.mcr-metadata-list {
    position: relative;
}
</style>
