<template>
  <div
    v-if="data.durationLabel || data.locationLabel || rowItem.progress"
    class="mcr-duration-location"
  >
    <VuiIconLabel
      v-if="data.locationLabel"
      button
      class="mcr-detail-location"
      icon="location"
      :tooltip="data.locationLabel"
      @click="onLocationClick"
    />

    <div
      v-if="data.durationLabel || rowItem.progress"
      class="mcr-detail-duration"
    >
      {{ data.durationLabel }}
      <span
        v-if="rowItem.type === 'step' && rowItem.progress"
        class="mcr-duration-progress"
        :style="{
          '--mcr-progress-start': `${rowItem.progress[0]}%`,
          '--mcr-progress-end': `${rowItem.progress[1]}%`
        }"
        aria-hidden="true"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted, shallowReactive } from 'vue';
import {
    VuiIconLabel, setToastContainerPosition, showToast
} from 'vine-ui';


import Util from '../../utils/util.js';


const props = defineProps({
    rowItem: {
        type: Object,
        default: () => {}
    }
});

const data = shallowReactive({

});

const onLocationClick = () => {
    Util.copyText(data.locationLabel).then((copied) => {
        if (copied) {
            setToastContainerPosition('right', 'bottom', 20);
            showToast({
                type: 'success',
                content: 'copied'
            });
        }
    });
};

onMounted(() => {
    data.durationLabel = Util.isNum(props.rowItem.duration) ? Util.TF(props.rowItem.duration) : '';
    data.locationLabel = props.rowItem.location;
});

</script>

<style>
.mcr-detail-duration {
    display: flex;
    flex-shrink: 0;
    gap: 5px;
    align-items: center;
}

.mcr-duration-progress {
    --mcr-progress-elapsed: color-mix(in srgb, var(--border-primary) 90%, black);
    --mcr-progress-active: #00bd7e;
    --mcr-progress-remaining: color-mix(in srgb, var(--border-primary) 55%, var(--bg-primary));

    position: relative;
    display: inline-block;
    flex: 0 0 16px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background:
        conic-gradient(
            var(--mcr-progress-elapsed) 0 var(--mcr-progress-start),
            var(--mcr-progress-active) var(--mcr-progress-start) var(--mcr-progress-end),
            var(--mcr-progress-remaining) var(--mcr-progress-end) 100%
        );
}

.mcr-dark .mcr-duration-progress {
    --mcr-progress-active: #39e3a5;
}

.mcr-duration-progress::after {
    position: absolute;
    inset: 4px;
    content: "";
    border-radius: 50%;
    background: var(--bg-primary);
}

.mcr-duration-location {
    position: relative;
    display: flex;
    flex-shrink: 0;
    gap: 10px;
    align-items: center;
    max-width: 50%;
    font-weight: normal;
    text-overflow: ellipsis;
    overflow: hidden;
}
</style>
