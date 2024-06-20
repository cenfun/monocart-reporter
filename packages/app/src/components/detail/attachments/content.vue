<script setup>
import {
    onMounted, ref, watch
} from 'vue';

import Util from '../../../utils/util.js';
import { markdownFormatter } from '../../../modules/formatters.js';

const props = defineProps({
    data: {
        type: Object,
        default: () => {}
    }
});

const el = ref(null);
let $el;

const showContent = () => {
    if (!$el) {
        return;
    }

    const { contentType, content } = props.data;

    if (Util.isMarkdownType(contentType)) {
        // console.log('markdown', content);
        $el.innerHTML = markdownFormatter(content);
        return;
    }

    // if (Util.isJsonType(contentType)) {
    // console.log('json', content);
    // }

    $el.innerHTML = `<pre><code>${content}</code></pre>`;
};

onMounted(() => {
    $el = el.value;
    showContent();
});


watch(() => props.data, () => {
    showContent();
});

</script>

<template>
  <div
    ref="el"
    class="mcr-attachment-body"
  />
</template>

<style lang="scss">
.mcr-attachment-content {
    .mcr-attachment-body {
        padding: 10px;

        pre {
            margin: 0;
            padding: 0;
            overflow-x: auto;
        }

        code {
            margin: 0;
            padding: 0;
        }
    }
}
</style>
