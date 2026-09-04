<template>
  <div class="mcr-attachment-video">
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
      <VuiIconLabel
        button
        icon="download"
      />
      <a
        :href="props.data.path"
        :download="props.data.fileName || props.data.name"
        target="_blank"
      >Download video</a>
    </VuiFlex>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import {
    VuiFlex,
    VuiIconLabel
} from 'vine-ui';

import Util from '../../../utils/util.js';

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

<style lang="scss">
.mcr-attachment-video {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: normal;
    padding: 10px;
    text-overflow: ellipsis;
    overflow: hidden;

    > * {
        flex-shrink: 0;
    }

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
