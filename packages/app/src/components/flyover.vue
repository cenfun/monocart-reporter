<template>
  <VuiFlyover
    ref="flyover"
    position="right"
    :visible="state.flyoverVisible"
    :width="state.flyoverWidth"
    min-width="350"
    @end="onFlyoverEnd"
    @resize="onFlyoverResize"
  >
    <div class="mcr-flyover-main vui-flex-column">
      <VuiFlex
        gap="10px"
        padding="10px"
        class="mcr-flyover-header"
      >
        <IconLabel
          icon="arrow-right"
          size="20px"
          @click="state.flyoverVisible=false"
        />
        <div class="mcr-flyover-title vui-flex-auto">
          {{ state.flyoverTitle }}
        </div>
        <IconLabel
          icon="close"
          size="20px"
          @click="state.flyoverVisible=false"
        />
      </VuiFlex>
      <div class="mcr-flyover-content vui-flex-auto">
        <KeepAlive>
          <component :is="flyoverComponents[state.flyoverComponent]" />
        </KeepAlive>
      </div>
    </div>
  </VuiFlyover>
</template>

<script setup>
import { components } from 'vine-ui';
import state from '../modules/state.js';
import Util from '../utils/util.js';

import IconLabel from './icon-label.vue';
import Detail from './detail.vue';
import Report from './report.vue';

const { VuiFlex, VuiFlyover } = components;

const flyoverComponents = {
    detail: Detail,
    report: Report
};

// remove tag till flyover animation end
const onFlyoverEnd = () => {
    if (!state.flyoverVisible) {
        Util.delHash('page');
    }
};

const onFlyoverResize = (width) => {
    state.flyoverWidth = width;
};

</script>
<style lang="scss">
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
    color: #fff;
    background-color: #005ba4;
}

.mcr-flyover-title {
    font-weight: bold;
    font-size: 16px;
    line-height: 22px;
}

.mcr-flyover-content {
    overflow: auto;
}

</style>
