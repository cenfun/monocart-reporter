<script setup>
import {
    inject, watch, shallowReactive
} from 'vue';

import { createCodeViewer } from 'monocart-code-viewer';
import { format } from 'monocart-formatter';

import Util from '../utils/util.js';

const state = inject('state');

const data = shallowReactive({
    previewType: 'other',
    imageSrc: ''
});

let codeViewer;
const getTextFormatted = async (content, type) => {
    if (content.textFormatted) {
        return content.textFormatted;
    }

    if (type) {
        const resFormatted = await format(content.text, type);
        if (resFormatted) {
            content.textFormatted = resFormatted.content;
            return resFormatted.content;
        }
    }

    return content.text;
};

const showEditor = async (content, type) => {

    state.loading = true;
    data.previewType = 'editor';

    // make sure loading is show up
    await Util.delay(10);

    const textFormatted = await getTextFormatted(content, type);

    // console.log(textFormatted);

    if (codeViewer) {
        codeViewer.update({
            content: textFormatted
        });
    } else {
        const container = document.querySelector('.mcr-content-editor');
        codeViewer = createCodeViewer(container, {
            content: textFormatted
        });
    }

    state.loading = false;
};

const update = (entry) => {
    // console.log(entry);

    const content = entry.response.content;

    // console.log(content);
    data.previewType = 'other';
    if (!content.text) {
        return;
    }

    const resourceType = entry.resourceType;
    if (resourceType === 'image') {
        // console.log(content.encoding);
        // svg
        let text = content.text;
        let base64 = 'base64';
        if (text.includes('<')) {
            base64 = 'charset=utf8';
            text = encodeURIComponent(text);
        }

        // data:[<mediatype>][;base64],<data>
        data.imageSrc = `data:${content.mimeType};${base64},${text}`;
        data.previewType = 'image';
        return;
    }

    const formattedTypes = ['js', 'css', 'html', 'json'];
    if (formattedTypes.includes(resourceType)) {
        showEditor(content, resourceType);
        return;
    }

    if (resourceType === 'text') {
        showEditor(content);
    }


};

watch(() => state.entry, (v) => {
    if (v) {
        update(v);
    }
});

</script>

<template>
  <div class="mcr-content">
    <div
      v-show="data.previewType==='image'"
      class="mcr-content-image"
    >
      <img :src="data.imageSrc">
    </div>
    <div
      v-show="data.previewType==='editor'"
      class="mcr-content-editor"
    />
    <div
      v-show="data.previewType==='other'"
      class="mcr-content-other"
    >
      No content preview
    </div>
  </div>
</template>

<style lang="scss">
.mcr-content {
    position: relative;
    padding: 0;
}

.mcr-content-other {
    padding: 20px;
    color: gray;
}

.mcr-content-image {
    padding: 10px;

    img {
        display: block;
        border: 1px solid #f5f5f5;
    }
}

.mcr-content-editor {
    height: 100%;
}
</style>
