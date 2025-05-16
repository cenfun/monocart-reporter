<script setup>
import { onMounted, shallowReactive } from 'vue';
import { components } from 'vine-ui';

import Util from '../../../utils/util.js';
import state from '../../../modules/state.js';
import IconLabel from '../../icon-label.vue';

const { VuiFlex } = components;

const props = defineProps({
    data: {
        type: Object,
        default: () => {}
    }
});

const d = shallowReactive({

});

const defaultUrl = 'https://trace.playwright.dev/?trace={traceUrl}';

onMounted(() => {

    const traceViewerUrl = state.reportData.traceViewerUrl || defaultUrl;

    d.protocol = window.location.protocol;
    const isOnline = ['http:', 'https:'].includes(d.protocol);

    d.color = isOnline ? 'color: green;' : 'color: red;';

    const { path } = props.data;

    const traceUrl = new URL(path, window.location.href);
    d.viewerUrl = Util.replace(traceViewerUrl, {
        traceUrl: encodeURIComponent(traceUrl)
    });

});

</script>

<template>
  <VuiFlex
    gap="10px"
    direction="column"
    class="mcr-attachment-trace"
  >
    <VuiFlex gap="3px">
      <IconLabel icon="link" />
      <a
        :href="d.viewerUrl"
        target="_blank"
      >View trace</a>
    </VuiFlex>
    <VuiFlex gap="3px">
      <IconLabel icon="download" />
      <a
        :href="props.data.path"
        :download="props.data.fileName || props.data.name"
        target="_blank"
      >Download</a>
    </VuiFlex>
    <details>
      <summary>
        NOTE
      </summary>

      <dl class="mcr-readme">
        <dd class="mcr-item">
          The <a
            href="https://trace.playwright.dev/"
            target="_blank"
          >Trace Viewer</a> requires that the trace file must be loaded over the http:// or https:// protocols (current protocol is <code :style="d.color">{{ d.protocol }}</code>)
          without <a
            href="https://developer.mozilla.org/en-US/docs/Glossary/CORS"
            target="_blank"
          >CORS</a> issue,
          try <code>npx monocart show-report &lt;your-outputFile-path&gt;</code> start a local web server, please keep attachments and reports under the same directory.
        </dd>
        <dd class="mcr-item">
          or download the trace file and load it to the page <a
            href="https://trace.playwright.dev/"
            target="_blank"
          >Trace Viewer</a> manually.
        </dd>
        <dd class="mcr-item">
          or customize a trace viewer url with option <code>traceViewerUrl: "{{ defaultUrl }}"</code>
        </dd>
      </dl>
    </details>
  </VuiFlex>
</template>

<style lang="scss">
.mcr-attachment-trace {
    padding: 10px;
    background-color: #f6f8fa;

    a {
        white-space: nowrap;
    }

    details {
        margin-left: 5px;

        summary {
            color: #666;
            cursor: pointer;
            user-select: none;
        }

        dl {
            margin: 0;
        }

        dd {
            margin: 0;
        }
    }
}
</style>
