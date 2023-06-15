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
  <details class="mcr-attachment-link">
    <AttachmentHead :retry="props.data.retry">
      <a
        :href="props.data.path"
        target="_blank"
      >{{ props.data.name }}</a>
    </AttachmentHead>
    <div class="mcr-attachment-body">
      {{ props.data.path }}
    </div>
  </details>
</template>

<style lang="scss">
.mcr-attachment-link {
    .mcr-attachment-body {
        padding: 10px;
    }
}
</style>
