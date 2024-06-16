<script setup>
import { shallowReactive } from 'vue';
import { components } from 'vine-ui';

import IconLabel from '../icon-label.vue';

import Util from '../../utils/util.js';

const { VuiFlex } = components;

const props = defineProps({
    rowItem: {
        type: Object,
        default: () => {}
    }
});

const data = shallowReactive({

});

const onLocationClick = (item) => {
    if (data.locationLabel) {

        Util.copyText(props.rowItem.location).then((res) => {
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
        data.locationLabel = props.rowItem.location;
    }
};

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


      <div
        v-if="Util.isNum(rowItem.duration)"
        class="mcr-detail-duration"
      >
        {{ Util.TF(rowItem.duration) }}
      </div>

      <IconLabel
        v-if="rowItem.location"
        icon="location"
        :tooltip="rowItem.location"
        @click="onLocationClick(item)"
      >
        {{ data.locationLabel }}
      </IconLabel>
    </VuiFlex>
  </VuiFlex>
</template>

<style>
.mcr-step-info {
    position: relative;
}
</style>
