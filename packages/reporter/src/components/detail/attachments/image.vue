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
    <div class="mcr-attachment-head">
      <a
        :href="props.data.path"
        target="_blank"
        class="mcr-item"
      >{{ props.data.name }}</a>
    </div>
    <div class="mcr-attachment-body">
      <a
        :href="props.data.path"
        target="_blank"
      ><img
        :src="props.data.path"
        :alt="props.data.name"
      ></a>
    </div>
  </div>
</template>

<style lang="scss">
.mcr-attachment-image {
    img {
        display: block;
        max-width: 100%;
    }
}
</style>
