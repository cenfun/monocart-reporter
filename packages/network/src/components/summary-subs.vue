<template>
  <div
    v-if="props.list.length"
    class="mcr-summary-subs"
  >
    <details open>
      <summary>
        <b>{{ props.title }}</b>
      </summary>
      <VuiFlex
        class="mcr-summary-subs-body"
        direction="column"
        gap="5px"
      >
        <div
          v-for="(item, i) in props.list"
          :key="i"
          class="mcr-summary-subs-item"
        >
          <span class="mcr-summary-subs-name">
            {{ item.name }}:
          </span>
          <span class="mcr-summary-subs-value">
            {{ item.value }}
          </span>
          <span
            v-if="item.fileName"
            class="mcr-summary-subs-value"
          >
            fileName: {{ item.fileName }}
          </span>
          <span
            v-if="item.contentType"
            class="mcr-summary-subs-value"
          >
            contentType: {{ item.contentType }}
          </span>
        </div>
      </VuiFlex>
    </details>
  </div>
</template>
<script setup>
import { components } from 'vine-ui';

const { VuiFlex } = components;

const props = defineProps({
    title: {
        type: String,
        default: ''
    },
    list: {
        type: Array,
        default: () => {
            return [];
        }
    }
});


</script>
<style lang="scss">
.mcr-summary-subs {
    position: relative;

    details {
        summary {
            padding-bottom: 5px;
            cursor: pointer;
            user-select: none;
        }
    }

    .mcr-summary-subs-body {
        margin-left: 15px;
    }

    .mcr-summary-subs-item {
        position: relative;
        font-family: var(--font-monospace);
    }

    .mcr-summary-subs-name {
        color: #333;
        font-weight: bold;
    }

    .mcr-summary-subs-value {
        color: #666;
        font-size: 13px;
        word-break: break-all;
    }
}
</style>

