<script setup>
import { shallowReactive } from 'vue';
import { components } from 'vine-ui';

import IconLabel from '../icon-label.vue';

import Util from '../../utils/util.js';

const { VuiFlex } = components;

defineProps({
    rowItem: {
        type: Object,
        default: () => {}
    }
});

const data = shallowReactive({

});

const onLocationClick = (rowItem) => {
    if (data.locationLabel) {

        Util.copyText(rowItem.location).then((res) => {
            if (res) {
                data.locationLabel = 'copied';
                setTimeout(() => {
                    data.locationLabel = '';
                }, 1000);
            } else {
                data.locationLabel = '';
            }
        });

    } else {
        data.locationLabel = rowItem.location;
    }
};

</script>

<template>
  <VuiFlex
    gap="10px"
    class="mcr-duration-location"
  >
    <div
      v-if="Util.isNum(rowItem.duration)"
      class="mcr-detail-duration"
    >
      {{ Util.TF(rowItem.duration) }}
    </div>

    <IconLabel
      v-if="rowItem.location"
      class="mcr-detail-location"
      icon="location"
      :tooltip="rowItem.location"
      @click="onLocationClick(rowItem)"
    >
      {{ data.locationLabel }}
    </IconLabel>
  </VuiFlex>
</template>

<style>
.mcr-duration-location {
    position: relative;
    font-weight: normal;
}
</style>
