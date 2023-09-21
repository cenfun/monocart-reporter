<script setup>
import AttachmentHead from './attachment-head.vue';
const props = defineProps({
    data: {
        type: Object,
        default: () => {}
    }
});
</script>

<template>
  <details class="mcr-attachment-content">
    <AttachmentHead :retry="props.data.retry">
      {{ props.data.name }}
    </AttachmentHead>
    <div class="mcr-attachment-body">
      {{ props.data.content }}
    </div>
  </details>
</template>

<style lang="scss">
.mcr-attachment-content {
    .mcr-attachment-body {
        padding: 10px;
    }
}
</style>
