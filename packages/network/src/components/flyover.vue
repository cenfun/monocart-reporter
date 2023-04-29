<template>
  <VuiFlyover
    ref="flyover"
    position="right"
    :visible="state.flyoverVisible"
    :width="state.flyoverWidth"
    min-width="350"
    @resize="onFlyoverResize"
  >
    <VuiTab
      v-model="state.tabIndex"
      align="center"
      class="mcr-report"
    >
      <template #left>
        <IconLabel
          icon="arrow-right"
          size="20px"
          @click="state.flyoverVisible=false"
        />
      </template>
      <template #right>
        <IconLabel
          icon="close"
          size="20px"
          @click="state.flyoverVisible=false"
        />
      </template>
      <template #tabs>
        <div>Request</div>
        <div>Response</div>
        <div>Timing</div>
      </template>
      <template #panes>
        <Request />
        <Response />
        <Timing />
      </template>
    </VuiTab>
    <VuiLoading
      center
      :visible="state.loading"
    />
  </VuiFlyover>
</template>

<script setup>
import { inject, watch } from 'vue';
import { components } from 'vine-ui';

import IconLabel from './icon-label.vue';

import Request from './request.vue';
import Response from './response.vue';
import Timing from './timing.vue';

const {
    VuiFlyover, VuiTab, VuiLoading
} = components;

const state = inject('state');

const onFlyoverResize = (width) => {
    state.flyoverWidth = width;
};

const showReport = () => {
    const id = state.flyoverData;
    if (!id) {
        return;
    }
    state.entry = state.entryMap[id];
};

watch(() => state.flyoverData, (v) => {
    showReport();
});

</script>
<style lang="scss">
.mcr-report {
    position: relative;
    height: 100%;

    .vui-tab-item {
        font-weight: bold;
    }

    .vui-tab-header-left,
    .vui-tab-header-right {
        padding: 0 10px;
    }

    .vui-tab-pane {
        padding: 10px;
        overflow-y: auto;
    }
}

</style>
