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
        data.imageSrc = `data:${content.mimeType};base64,${content.text}`;
        data.previewType = 'image';
        return;
    }

    const formattedTypes = ['js', 'css', 'html', 'json'];
    if (formattedTypes.includes(resourceType)) {
        showEditor(content, resourceType);
        return;
    }

    if (resourceType === 'text' && content.text) {
        showEditor(content);
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

    .cm-editor {
        width: 100%;
        height: 100%;
    }

    .cm-scroller {
        overflow: auto;
    }

    /* stylelint-disable-next-line selector-class-pattern */
    .cm-gutterElement {
        .cm-fold {
            display: block;
            width: 15px;
            height: 100%;
            padding-left: 3px;
            background-repeat: no-repeat;
            background-position: center center;
            background-size: 10px 10px;
            cursor: pointer;
            opacity: 0.6;
            overflow: hidden;
            user-select: none;
        }

        .cm-fold-open {
            background-image: url("../images/arrow-fold-open.svg");
        }

        .cm-fold-close {
            background-image: url("../images/arrow-fold-close.svg");
        }
    }

    /* stylelint-disable-next-line selector-class-pattern */
    .cm-activeLineGutter {
        .cm-fold {
            opacity: 1;
        }
    }
}
</style>
