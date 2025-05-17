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

<template>
  <VuiFlex
    gap="10px"
    direction="column"
    class="mcr-attachment-image"
  >
    <div class="mcr-attachment-image-main">
      <img
        :src="props.data.path"
        :alt="props.data.name"
        :class="imgClass"
        @load="onImgLoad"
      >
    </div>
    <VuiFlex gap="3px">
      <IconLabel icon="download" />
      <a
        :href="props.data.path"
        :download="props.data.fileName || props.data.name"
        target="_blank"
      >Download image</a>
    </VuiFlex>
  </VuiFlex>
</template>

<style lang="scss">
.mcr-attachment-image {
    padding: 10px;

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
