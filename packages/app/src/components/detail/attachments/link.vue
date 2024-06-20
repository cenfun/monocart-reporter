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
    {{ props.data.path }}
  </div>
</template>

<style lang="scss">
.mcr-attachment-link {
    padding: 10px;
    background-color: #f6f8fa;
}
</style>
