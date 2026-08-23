<script setup>
import {
    onMounted, shallowReactive, watch
} from 'vue';
import {
    VuiFlex,
    VuiIconLabel
} from 'vine-ui';


import Util from '../../utils/util.js';


const props = defineProps({
    rowItem: {
        type: Object,
        default: () => {}
    }
});

const emit = defineEmits(['update']);

const data = shallowReactive({

});

const onLocationClick = () => {
    if (data.copiedLabel) {
        Util.copyText(data.locationLabel).then((res) => {
            if (res) {
                data.copiedLabel = 'copied';
                setTimeout(() => {
                    data.copiedLabel = '';
                }, 1000);
            }
        });
    } else {
        data.copiedLabel = data.locationLabel;
    }
};

watch(() => data.copiedLabel, (val) => {
    emit('update');
});

onMounted(() => {
    data.durationLabel = Util.isNum(props.rowItem.duration) ? Util.TF(props.rowItem.duration) : '';
    data.locationLabel = props.rowItem.location;
});

</script>

<template>
  <VuiFlex
    v-if="data.durationLabel || data.locationLabel"
    gap="10px"
    class="mcr-duration-location"
  >
    <div
      v-if="data.durationLabel"
      class="mcr-detail-duration"
    >
      {{ data.durationLabel }}
    </div>

    <VuiIconLabel
      v-if="data.locationLabel"
      button
      class="mcr-detail-location"
      icon="location"
      :tooltip="data.locationLabel"
      @click="onLocationClick"
    >
      {{ data.copiedLabel }}
    </VuiIconLabel>
  </VuiFlex>
</template>

<style>
.mcr-duration-location {
    position: relative;
    flex-shrink: 0;
    font-weight: normal;
}
</style>
