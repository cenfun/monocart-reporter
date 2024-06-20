<script setup>
import { components } from 'vine-ui';
const { VuiFlex } = components;
import IconLabel from '../../icon-label.vue';

const props = defineProps({
    data: {
        type: Object,
        default: () => {}
    }
});
</script>

<template>
  <VuiFlex
    gap="10px"
    direction="column"
    class="mcr-attachment-video"
  >
    <video
      controls
      :src="props.data.path"
    ><source
      :src="props.data.path"
      :type="props.data.contentType"
    ></video>
    <VuiFlex>
      <IconLabel icon="item-arrow" />
      <a
        :href="props.data.path"
        target="_blank"
      >Download video</a>
    </VuiFlex>
  </VuiFlex>
</template>

<style lang="scss">
.mcr-attachment-video {
    padding: 10px;

    video {
        display: block;
        max-width: 100%;
        box-shadow: var(--image-shadow);
    }
}
</style>
