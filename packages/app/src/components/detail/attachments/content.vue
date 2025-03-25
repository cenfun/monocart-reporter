<script setup>
import {
    onMounted, ref, watch
} from 'vue';

import Util from '../../../utils/util.js';
import { markdownFormatter } from '../../../modules/formatters.js';
import state from '../../../modules/state.js';

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
        $el.innerHTML = markdownFormatter(content);
        return;
    }

    if (Util.isMermaidType(contentType)) {
        $el.innerHTML = `<pre class="mermaid">${content}</pre>`;
        state.mermaidEnabled = true;
        return;
    }

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
    class="mcr-attachment-content"
  />
</template>

<style lang="scss">
.mcr-attachment-content {
    padding: 10px;
    background-color: #f6f8fa;

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
</style>
