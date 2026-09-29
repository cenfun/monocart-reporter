<template>
  <VuiPopover
    v-if="state.metadata"
    v-model="state.metadata.popoverVisible"
    :target="state.metadata.popoverTarget"
    :auto-close="false"
    width="auto"
  >
    <div
      ref="metadataEl"
      class="mcr-metadata-grid"
      @mouseenter="cancelMetadataClose"
      @mouseleave="onMetadataPopoverLeave"
    >
      <div
        v-for="(item, ii) in list"
        :key="ii"
        class="mcr-metadata-item"
        :style="'margin-left:'+ (item.level * 20) + 'px'"
      >
        {{ item.name }} <a
          v-if="item.isLink"
          :href="item.value"
          target="_blank"
        >{{ item.value }}</a>
        <span v-else>{{ item.value }}</span>
      </div>
    </div>
  </VuiPopover>
</template>
<script setup>
import { ref, watch } from 'vue';
import { VuiPopover } from 'vine-ui';

import state from '../modules/state.js';
import {
    cancelMetadataClose, cleanupMetadata, onMetadataPopoverLeave
} from '../modules/metadata.js';
import Util from '../utils/util.js';


const list = ref([]);

const initList = (data, ls, level) => {
    if (!data || typeof data !== 'object') {
        return;
    }
    const keys = Object.keys(data);
    keys.forEach((key) => {
        const value = data[key];
        if (value && typeof value === 'object') {
            ls.push({
                name: key,
                level,
                value: ''
            });
            initList(value, ls, level + 1);
        } else {
            ls.push({
                name: key,
                level,
                isLink: Util.isLink(value),
                value: value
            });
        }
    });
};

const update = () => {
    const ls = [];
    initList(state.metadata.data, ls, 0);
    list.value = ls;
};

watch(() => [state.metadata.popoverVisible, state.metadata.data], ([visible]) => {
    if (visible) {
        update();
    } else {
        // VuiPopover can close itself on native scroll/resize.
        cleanupMetadata();
    }
});

</script>
<style lang="scss">
.mcr-metadata-grid {
    display: flex;
    flex-direction: column;
    gap: 5px;
    max-width: 300px;
    max-height: 500px;
    overflow: auto;
}

.mcr-metadata-item {
    display: flex;
    gap: 5px;
    font-weight: bold;
    font-family: var(--font-monospace);

    a,
    span {
        font-weight: normal;
        word-break: normal;
        overflow-wrap: normal;
        overflow: hidden;
    }

    a {
        word-break: break-all;
    }

    span {
        overflow: visible;
    }
}
</style>
