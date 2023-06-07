<script setup>
const props = defineProps({
    data: {
        type: Object,
        default: () => {}
    }
});
</script>

<template>
  <div class="mcr-attachment-link">
    <div class="mcr-attachment-head">
      <a
        :href="props.data.path"
        target="_blank"
        class="mcr-item"
      >{{ props.data.name }}</a>
    </div>
  </div>
</template>

<style lang="scss">
.mcr-attachment-link {
    position: relative;
}
</style>
