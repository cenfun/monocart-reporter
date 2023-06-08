<script setup>
const props = defineProps({
    data: {
        type: Object,
        default: () => {}
    }
});
</script>

<template>
  <details class="mcr-attachment-link">
    <summary class="mcr-attachment-head">
      <a
        :href="props.data.path"
        target="_blank"
      >{{ props.data.name }}</a>
    </summary>
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
