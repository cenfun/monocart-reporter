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
