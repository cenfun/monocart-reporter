<script setup>
const props = defineProps({
    data: {
        type: Object,
        default: () => {}
    }
});
</script>

<template>
  <div class="mcr-attachment-image">
    <a
      :href="props.data.path"
      target="_blank"
    ><img
      :src="props.data.path"
      :alt="props.data.name"
    ></a>
  </div>
</template>

<style lang="scss">
.mcr-attachment-image {
    padding: 10px;

    img {
        display: block;
        max-width: 100%;
        min-height: 50px;
        box-shadow: var(--image-shadow);
    }
}
</style>
