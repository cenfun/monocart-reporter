<script setup>
import { inject, watch } from 'vue';
import {
    VuiFlyover,
    VuiTab,
    VuiLoading
} from 'vine-ui';

import IconLabel from './icon-label.vue';

import Request from './request.vue';
import Response from './response.vue';
import Content from './content.vue';
import Timing from './timing.vue';


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

<template>
  <VuiFlyover
    ref="flyover"
    v-model="state.flyoverVisible"
    position="right"
    :width="state.flyoverWidth"
    min-width="350"
    @resize="onFlyoverResize"
  >
    <div class="mcr-report">
      <VuiTab
        v-model="state.tabIndex"
        :options="['Request', 'Response', 'Content', 'Timing']"
        align="center"
        class="mcr-tab-header"
      >
        <template #left>
          <div class="mcr-tab-left">
            <IconLabel
              icon="arrow-right"
              size="20px"
              @click="state.flyoverVisible=false"
            />
          </div>
        </template>
        <template #right>
          <div class="mcr-tab-right">
            <IconLabel
              icon="close"
              size="20px"
              @click="state.flyoverVisible=false"
            />
          </div>
        </template>
      </VuiTab>
      <div class="mcr-tab-panes">
        <Request v-show="state.tabIndex === 0" />
        <Response v-show="state.tabIndex === 1" />
        <Content v-show="state.tabIndex === 2" />
        <Timing
          v-show="state.tabIndex === 3"
          :entry="state.entry"
        />
      </div>
    </div>
    <VuiLoading
      center
      :visible="state.loading"
    />
  </VuiFlyover>
</template>

<style lang="scss">
.mcr-report {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    height: 100%;
    overflow: hidden;

    .vui-tab {
        flex-shrink: 0;
    }

    .vui-tab-item {
        font-weight: bold;
    }

    .vui-tab > :first-child,
    .vui-tab > :last-child {
        padding: 0 10px;
    }
}

.mcr-tab-header {
    width: 100%;
}

.mcr-tab-left {
    flex: auto;
}

.mcr-tab-right {
    display: flex;
    flex: auto;
    justify-content: flex-end;
}

.mcr-tab-panes {
    position: relative;
    flex: auto;
    min-height: 0;
    overflow: hidden;

    > * {
        position: relative;
        width: 100%;
        height: 100%;
        padding: 10px;
        box-sizing: border-box;
        overflow-y: auto;
    }

    > .mcr-content {
        padding: 0;
    }
}

</style>
