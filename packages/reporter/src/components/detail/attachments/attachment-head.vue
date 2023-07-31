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
  <summary>
    <VuiFlex
      gap="10px"
      wrap
    >
      <VuiFlex gap="5px">
        <slot />
      </VuiFlex>
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
.mcr-attachment-retry {
    margin-right: 10px;
    color: var(--color-flaky);
    font-size: small;
    cursor: default;
    user-select: none;
}
</style>
