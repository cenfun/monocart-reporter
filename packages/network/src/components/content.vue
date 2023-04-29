<template>
  <div class="mcr-summary-container">
    <SummaryList
      title="Content"
      :list="data.list"
    />
    <details
      v-show="data.preview"
      open
      class="mcr-content-preview"
    >
      <summary>
        <b>Preview</b>
      </summary>
      <div
        ref="el"
        class="mcr-content-preview-image"
      />
    </details>
  </div>
</template>
<script setup>
import {
    ref, inject, watch, shallowReactive, onMounted
} from 'vue';

import SummaryList from './summary-list.vue';
import Util from '../utils/util';

const state = inject('state');

const el = ref(null);
let $el;

const data = shallowReactive({
    preview: false,
    list: []
});

const update = (entry) => {
    // console.log(entry);

    const content = entry.response.content;

    console.log(content);

    data.list = [{
        name: 'Resource Type',
        value: `${content.mimeType} (${entry.resourceType})`
    }, {
        name: 'Resource Size',
        value: `${Util.NF(Math.max(content.size, 0))} Bytes`
    }];

    data.preview = false;

    if (entry.resourceType === 'image') {
        console.log(content.encoding);
        $el.innerHTML = `<img src="data:${content.mimeType};base64,${content.text}" />`;
        data.preview = true;
    }


};

watch(() => state.entry, (v) => {
    if (v) {
        update(v);
    }
});

onMounted(() => {
    $el = el.value;
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
    margin-top: 5px;
    margin-left: 15px;

    img {
        display: block;
        border: 1px solid #f5f5f5;
    }
}
</style>
