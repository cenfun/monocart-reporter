<script setup>
import { ref } from 'vue';
import { components } from 'vine-ui';
const { VuiFlex } = components;

import Util from '../../../utils/util.js';
import IconLabel from '../../icon-label.vue';

const props = defineProps({
    data: {
        type: Object,
        default: () => {}
    }
});

const videoClass = ref('mcr-attachment-video-class');
const onMetaData = (e) => {
    const { videoWidth, videoHeight } = e.target;
    // console.log('onMetaData', videoWidth, videoHeight, e);
    if (Util.isNum(videoWidth) && Util.isNum(videoHeight)) {
        const whScale = videoWidth / videoHeight;
        if (whScale < 1) {
            videoClass.value = 'mcr-attachment-video-class-v';
        }
    }
};

</script>

<template>
  <VuiFlex
    gap="10px"
    direction="column"
    class="mcr-attachment-video"
  >
    <div class="mcr-attachment-video-main">
      <video
        controls
        :src="props.data.path"
        :class="videoClass"
        @loadedmetadata="onMetaData"
      ><source
        :src="props.data.path"
        :type="props.data.contentType"
      ></video>
    </div>
    <VuiFlex gap="3px">
      <IconLabel icon="download" />
      <a
        :href="props.data.path"
        :download="props.data.fileName || props.data.name"
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
        min-height: 30px;
        box-shadow: var(--image-shadow);
    }
}

.mcr-attachment-video-main {
    display: flex;
    width: 100%;
}

.mcr-attachment-video-class {
    max-width: 100%;
}

.mcr-attachment-video-class-v {
    max-width: 100%;

    /** remove header 40 + 60 */
    max-height: calc(100vh - 100px);
}
</style>
