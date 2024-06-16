<script setup>
import {
    watch, shallowReactive, onActivated
} from 'vue';
import { components } from 'vine-ui';
import { microtask } from 'monocart-common';

import state from '../../modules/state.js';

import IconLabel from '../icon-label.vue';
import DetailSteps from './detail-steps.vue';
import DetailTest from './detail-test.vue';

const { VuiFlex, VuiTab } = components;

const data = shallowReactive({

});

const updateCase = microtask(() => {
    const caseId = state.flyoverData;
    if (!caseId) {
        return;
    }
    const caseItem = state.detailMap[caseId];
    if (!caseItem) {
        return;
    }
    data.stepNum = caseItem.stepNum;
});

watch(() => state.flyoverData, (v) => {
    if (state.flyoverComponent === 'detail') {
        updateCase();
    }
});

onActivated(() => {
    updateCase();
});

</script>

<template>
  <VuiTab
    v-model="state.tabIndex"
    class="mcr-detail"
  >
    <template #tabs>
      <div>
        <VuiFlex gap="5px">
          <IconLabel icon="case" />
          <b>Test</b>
        </VuiFlex>
      </div>
      <div>
        <VuiFlex gap="5px">
          <IconLabel icon="step" />
          <b>Steps</b>
          <div
            v-if="data.stepNum"
            class="mcr-num"
          >
            {{ data.stepNum }}
          </div>
        </VuiFlex>
      </div>
    </template>
    <template #panes>
      <div>
        <DetailTest />
      </div>
      <div>
        <DetailSteps />
      </div>
    </template>
  </VuiTab>
</template>
