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
      <CaseDetail v-show="state.caseItem" />
      <MenuDetail v-show="!state.caseItem" />
    </div>
  </div>
</template>

<script setup>
import { components } from 'vine-ui';
import CaseDetail from './case-detail.vue';
import MenuDetail from './menu-detail.vue';
import IconLabel from './icon-label.vue';

import state from '../modules/state.js';

const { VuiFlex } = components;

</script>
