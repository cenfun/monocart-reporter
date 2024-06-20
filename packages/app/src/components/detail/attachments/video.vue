<script setup>
const props = defineProps({
    data: {
        type: Object,
        default: () => {}
    }
});
</script>

<template>
  <div class="mcr-attachment-body">
    <video
      controls
      :src="props.data.path"
    ><source
      :src="props.data.path"
      :type="props.data.contentType"
    ></video>
  </div>
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
