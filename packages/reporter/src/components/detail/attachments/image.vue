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
  <details
    class="mcr-attachment-image"
    open
  >
    <AttachmentHead :retry="props.data.retry">
      <a
        :href="props.data.path"
        target="_blank"
      >{{ props.data.name }}</a>
    </AttachmentHead>
    <div class="mcr-attachment-body">
      <a
        :href="props.data.path"
        target="_blank"
      ><img
        :src="props.data.path"
        :alt="props.data.name"
      ></a>
    </div>
  </details>
</template>

<style lang="scss">
.mcr-attachment-image {
    .mcr-attachment-body {
        padding: 10px;
        border: none;
    }

    img {
        display: block;
        max-width: 100%;
        box-shadow: var(--image-shadow);
    }
}
</style>
