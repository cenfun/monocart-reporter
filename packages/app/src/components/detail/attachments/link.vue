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
    {{ props.data.path }}
  </div>
</template>

<style lang="scss">
.mcr-attachment-link {
    .mcr-attachment-body {
        padding: 10px;
    }
}
</style>
