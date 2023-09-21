<script setup>
import { onMounted, ref } from 'vue';
import AttachmentHead from './attachment-head.vue';

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

onMounted(() => {
    $el = el.value;

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

});


</script>

<template>
  <details
    class="mcr-attachment-content"
    open
  >
    <AttachmentHead :retry="props.data.retry">
      {{ props.data.name }}
    </AttachmentHead>
    <div
      ref="el"
      class="mcr-attachment-body"
    />
  </details>
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
