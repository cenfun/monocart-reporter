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

const showTraceHelp = (e) => {
    Object.assign(state.trace, {
        color: d.color,
        protocol: d.protocol,
        popoverTarget: e.currentTarget,
        popoverVisible: true
    });
};


onMounted(() => {

    const defaultUrl = 'https://trace.playwright.dev/?trace={traceUrl}';

    const traceViewerUrl = state.reportData.traceViewerUrl || defaultUrl;

    d.protocol = window.location.protocol;
    const isOnline = ['http:', 'https:'].includes(d.protocol);

    d.icon = isOnline ? 'help' : 'error';
    d.iconStyle = isOnline ? '' : 'color: var(--color-flaky);';
    d.color = isOnline ? 'color: green;' : 'color: red;';

    const { path } = props.data;

    const traceUrl = new URL(path, window.location.href);
    d.viewerUrl = Util.replace(traceViewerUrl, {
        traceUrl: encodeURIComponent(traceUrl)
    });

});

</script>

<template>
  <div class="mcr-attachment-trace">
    <VuiFlex gap="3px">
      <IconLabel
        icon="link"
        :button="false"
      />
      <a
        :href="d.viewerUrl"
        target="_blank"
      >View trace</a>
    </VuiFlex>
    <IconLabel
      :icon="d.icon"
      :style="d.iconStyle"
      @click="showTraceHelp"
    />
    <VuiFlex gap="3px">
      <IconLabel icon="download" />
      <a
        :href="props.data.path"
        :download="props.data.fileName || props.data.name"
        target="_blank"
      >Download</a>
    </VuiFlex>
  </div>
</template>

<style lang="scss">
.mcr-attachment-trace {
    display: flex;
    flex: auto;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    padding: 0 10px;

    a {
        white-space: nowrap;
    }

    details {
        margin-left: 5px;

        summary {
            color: var(--text-secondary);
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
