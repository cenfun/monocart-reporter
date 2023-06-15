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
    class="mcr-attachment-video"
    open
  >
    <AttachmentHead :retry="props.data.retry">
      <a
        :href="props.data.path"
        target="_blank"
      >{{ props.data.name }}</a>
    </AttachmentHead>
    <div class="mcr-attachment-body">
      <video
        controls
      ><source
        :src="props.data.path"
        :type="props.data.contentType"
      ></video>
    </div>
  </details>
</template>

<style lang="scss">
.mcr-attachment-video {
    .mcr-attachment-body {
        padding: 10px;
        border: none;
    }

    video {
        display: block;
        max-width: 100%;
        box-shadow: var(--image-shadow);
    }
}
</style>
