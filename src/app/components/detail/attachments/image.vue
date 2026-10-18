<template>
  <div class="mcr-attachment-image">
    <div class="mcr-attachment-image-main">
      <img
        :src="props.data.path"
        :alt="props.data.name"
        :class="imgClass"
        role="button"
        tabindex="0"
        @load="onImgLoad"
        @click="previewVisible = true"
        @keydown.enter.prevent="previewVisible = true"
        @keydown.space.prevent="previewVisible = true"
      >
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
      >Download image</a>
    </VuiFlex>
    <ImagePreview
      v-if="previewVisible"
      :src="props.data.path"
      :alt="props.data.name"
      @close="previewVisible = false"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import {
    VuiFlex,
    VuiIconLabel
} from 'vine-ui';

import Util from '../../../utils/util.js';
import ImagePreview from '../../common/image-preview.vue';

const props = defineProps({
    data: {
        type: Object,
        default: () => {}
    }
});

const previewVisible = ref(false);
const imgClass = ref('mcr-attachment-image-class');
const onImgLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (Util.isNum(naturalWidth) && Util.isNum(naturalHeight)) {
        const whScale = naturalWidth / naturalHeight;
        if (whScale < 1) {
            imgClass.value = 'mcr-attachment-image-class-v';
        }
    }
};

</script>

<style lang="scss">
.mcr-attachment-image {
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

    img {
        display: block;
        min-height: 30px;
        box-shadow: var(--image-shadow);
    }
}

.mcr-attachment-image-main {
    display: flex;
    width: 100%;
}

.mcr-attachment-image-class {
    max-width: 100%;
}

.mcr-attachment-image-class-v {
    max-width: 100%;

    /** remove header 40 + 60 */
    max-height: calc(100vh - 100px);
}
</style>
