<script setup>
import { components } from 'vine-ui';

import state from '../../modules/state.js';

import IconLabel from '../icon-label.vue';
const { VuiFlex } = components;

const props = defineProps({
    list: {
        type: Array,
        default: () => []
    }
});


const onMetadataClick = (e, data) => {
    // already open, after close it
    const currentTarget = e.currentTarget;
    if (state.metadata.popoverVisible) {
        setTimeout(() => {
            onMetadataClick({
                currentTarget
            }, data);
        }, 100);
        return;
    }
    // console.log('metadata click', data, state.metadata);
    state.metadata.popoverTarget = currentTarget;
    state.metadata.data = data;
    state.metadata.popoverVisible = true;
};

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
        <IconLabel
          v-if="item.isObject"
          icon="comment-popover"
          @click="onMetadataClick($event, item.value)"
        />
        <a
          v-else-if="item.isLink"
          :href="item.value"
          target="_blank"
        >{{ item.value }}</a>
        <span v-else>{{ item.value }}</span>
      </VuiFlex>
    </VuiFlex>
  </div>
</template>

<style lang="scss">
.mcr-metadata-list {
    position: relative;
}
</style>
