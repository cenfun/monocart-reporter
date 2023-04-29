<template>
  <div class="mcr-summary-container">
    <div
      v-if="data.resourceType==='image'"
      class="mcr-content-preview-image"
    >
      <img :src="data.imageSrc">
    </div>
  </div>
</template>
<script setup>
import {
    inject, watch, shallowReactive
} from 'vue';

// import Util from '../utils/util.js';

const state = inject('state');

const data = shallowReactive({
    resourceType: '',
    imageSrc: ''
});

const update = (entry) => {
    // console.log(entry);

    const content = entry.response.content;

    // console.log(content);

    const resourceType = entry.resourceType;
    data.resourceType = resourceType;

    if (resourceType === 'image') {
        // console.log(content.encoding);
        data.imageSrc = `data:${content.mimeType};base64,${content.text}`;
    }


};

watch(() => state.entry, (v) => {
    if (v) {
        update(v);
    }
});

</script>
<style lang="scss">
.mcr-content {
    position: relative;
}

.mcr-content-preview {
    > summary {
        padding: 5px 0;
        cursor: pointer;
        user-select: none;
    }
}

.mcr-content-preview-image {
    img {
        display: block;
        border: 1px solid #f5f5f5;
    }
}
</style>
