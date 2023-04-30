<template>
  <div
    v-if="props.list.length"
    class="mcr-summary-list"
  >
    <details open>
      <summary>
        <b>{{ props.title }}</b>
      </summary>
      <VuiFlex
        class="mcr-summary-body"
        direction="column"
        gap="5px"
      >
        <div
          v-for="(item, i) in props.list"
          :key="i"
          class="mcr-summary-item"
        >
          <span class="mcr-summary-name">
            {{ item.name }}:
          </span>
          <span
            class="mcr-summary-value"
            v-html="item.value"
          />
        </div>
        <slot />
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
.mcr-summary-list {
    position: relative;

    > details {
        > summary {
            padding: 5px 0;
            cursor: pointer;
            user-select: none;
        }
    }

    .mcr-summary-body {
        margin-left: 15px;
    }

    .mcr-summary-item {
        position: relative;
        font-family: var(--font-monospace);
    }

    .mcr-summary-name {
        color: #333;
        font-weight: bold;
    }

    .mcr-summary-value {
        color: #666;
        font-size: 13px;
        word-break: break-all;
    }
}
</style>

