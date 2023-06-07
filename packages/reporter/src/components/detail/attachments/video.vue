<script setup>
const props = defineProps({
    data: {
        type: Object,
        default: () => {}
    }
});
</script>

<template>
  <div class="mcr-attachment-video">
    <div class="mcr-attachment-head">
      <a
        :href="props.data.path"
        target="_blank"
        class="mcr-item"
      >{{ props.data.name }}</a>
    </div>
    <div class="mcr-attachment-body">
      <video
        controls
      ><source
        :src="props.data.path"
        :type="props.data.contentType"
      ></video>
    </div>
  </div>
</template>

<style lang="scss">
.mcr-attachment-video {
    video {
        display: block;
        max-width: 100%;
        background-color: #000;
    }
}
</style>
