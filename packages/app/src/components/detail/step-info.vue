<script setup>
// import { shallowReactive } from 'vue';
import { components } from 'vine-ui';

// import IconLabel from '../icon-label.vue';
import DurationLocation from './duration-location.vue';

// import Util from '../../utils/util.js';

const { VuiFlex } = components;

defineProps({
    rowItem: {
        type: Object,
        default: () => {}
    }
});

// const data = shallowReactive({

// });

</script>

<template>
  <VuiFlex
    class="mcr-step-info"
    direction="column"
  >
    <VuiFlex gap="10px">
      <div class="vui-flex-auto">
        {{ rowItem.title }}
      </div>

      <DurationLocation :row-item="rowItem" />
    </VuiFlex>
  </VuiFlex>
</template>

<style>
.mcr-step-info {
    position: relative;
}
</style>
