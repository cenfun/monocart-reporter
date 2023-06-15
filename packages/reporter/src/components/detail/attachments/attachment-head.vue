<script setup>
import { components } from 'vine-ui';
const { VuiFlex } = components;

const props = defineProps({
    retry: {
        type: Number,
        default: 0
    }
});
</script>

<template>
  <summary class="mcr-attachment-head">
    <VuiFlex
      gap="10px"
      wrap
    >
      <div><slot /></div>
      <div class="vui-flex-auto" />
      <div
        v-if="props.retry"
        class="mcr-attachment-retry"
      >
        Retry #{{ props.retry }}
      </div>
    </VuiFlex>
  </summary>
</template>

<style lang="scss">
.mcr-attachment-head {
    position: relative;
    padding: 3px 0;
    cursor: default;
}

.mcr-attachment-head:hover {
    background-color: #f8f8f8;
}

.mcr-attachment-retry {
    margin-right: 10px;
    color: var(--color-flaky);
    font-size: small;
    cursor: default;
    user-select: none;
}
</style>
