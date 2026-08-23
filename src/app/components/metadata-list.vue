<script setup>
import { VuiFlex, VuiIconLabel } from 'vine-ui';

import state from '../modules/state.js';


const props = defineProps({
    list: {
        type: Array,
        default: () => []
    }
});

const onMetadataClick = (e, data) => {
    // already open, after close it
    const currentTarget = e.currentTarget;
    if (currentTarget === state.metadata.popoverTarget && state.metadata.popoverVisible) {
        return;
    }

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
        <VuiIconLabel
          :icon="item.icon"
          :button="false"
        >
          <b v-if="item.name">{{ item.name }}</b>
        </VuiIconLabel>
        <VuiIconLabel
          v-if="item.isObject"
          button
          icon="more"
          @click="onMetadataClick($event, item.value)"
        />
        <a
          v-else-if="item.isLink"
          :href="item.value"
          target="_blank"
        >{{ item.value }}</a>
        <div
          v-else-if="item.isHtml"
          class="mcr-metadata-html"
          v-html="item.value"
        />
        <span v-else>{{ item.value }}</span>
      </VuiFlex>
    </VuiFlex>
  </div>
</template>

<style lang="scss">
.mcr-metadata-list {
    position: relative;
}

.mcr-metadata-html {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    align-items: center;
    word-break: break-all;
}
</style>
