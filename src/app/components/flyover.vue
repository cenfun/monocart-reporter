<script setup>
import {
    VuiFlyover,
    VuiLoading,
    VuiIconLabel
} from 'vine-ui';

import { hash } from '../common/common.js';

import state from '../modules/state.js';

import Detail from './detail/detail.vue';
import Report from './report/report.vue';


const flyoverComponents = {
    detail: Detail,
    report: Report
};

// remove tag till flyover animation end
const onFlyoverEnd = () => {
    if (!state.flyoverVisible) {
        hash.remove('page');
    }
};

const onFlyoverResize = (width) => {
    state.flyoverWidth = width;
};

</script>

<template>
  <VuiFlyover
    ref="flyover"
    v-model="state.flyoverVisible"
    position="right"
    :width="state.flyoverWidth"
    min-width="350"
    @end="onFlyoverEnd"
    @resize="onFlyoverResize"
  >
    <div class="mcr-flyover-main vui-flex-column">
      <div class="mcr-flyover-header">
        <VuiIconLabel
          button
          icon="arrow-right"
          size="20px"
          @click="state.flyoverVisible=false"
        />
        <div class="mcr-flyover-title mcr-flex-auto">
          {{ state.flyoverTitle }}
        </div>
        <VuiIconLabel
          button
          icon="close"
          size="20px"
          @click="state.flyoverVisible=false"
        />
      </div>
      <div class="mcr-flyover-content mcr-flex-auto">
        <KeepAlive>
          <component :is="flyoverComponents[state.flyoverComponent]" />
        </KeepAlive>
      </div>
    </div>
    <VuiLoading
      center
      :visible="state.loading"
    />
  </VuiFlyover>
</template>

<style lang="scss">
.vui-flyover {
    color: var(--color-primary);
    background-color: var(--bg-primary);
}

.mcr-flyover-icon {
    position: absolute;
    top: 0;
    right: 0;
    width: 20px;
    height: 100%;
}

.mcr-flyover-main {
    height: 100%;
    overflow: hidden;
}

.mcr-flyover-header {
    position: relative;
    display: flex;
    flex-shrink: 0;
    gap: 10px;
    align-items: center;
    padding: 10px;
    color: #fff;
    text-overflow: ellipsis;
    overflow: hidden;

    > * {
        flex-shrink: 0;
    }
    background-color: #005ba4;
}

.mcr-flyover-title {
    height: 24px;
    font-weight: bold;
    font-size: 16px;
    line-height: 24px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}

.mcr-flyover-content {
    position: relative;
    overflow: auto;
}

</style>
