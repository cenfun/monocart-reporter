<script setup>
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
    <summary class="mcr-attachment-head">
      <a
        :href="props.data.path"
        target="_blank"
      >{{ props.data.name }}</a>
    </summary>
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
    img {
        display: block;
        max-width: 100%;
    }
}
</style>
