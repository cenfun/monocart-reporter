<template>
  <div class="vui-flyover-main vui-flex-column">
    <VuiFlex
      gap="10px"
      padding="10px"
      class="vui-flyover-header"
    >
      <IconLabel
        icon="arrow-right"
        size="20px"
        @click="state.flyoverVisible=false"
      />
      <div class="vui-flyover-title vui-flex-auto">
        {{ state.flyoverTitle }}
      </div>
      <IconLabel
        icon="close"
        size="20px"
        @click="state.flyoverVisible=false"
      />
    </VuiFlex>
    <div class="vui-flyover-content vui-flex-auto">
      <Detail v-show="state.caseItem" />
      <Report v-show="!state.caseItem" />
    </div>
  </div>
</template>

<script setup>
import { components } from 'vine-ui';
import state from '../modules/state.js';

import Detail from './detail.vue';
import Report from './report.vue';
import IconLabel from './icon-label.vue';

const { VuiFlex } = components;

</script>
