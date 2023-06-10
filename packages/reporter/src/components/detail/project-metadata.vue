<script setup>

const props = defineProps({
    column: {
        type: Object,
        default: () => {}
    }
});

</script>

<template>
  <div class="mcr-project-metadata">
    metadata {{ props.column.list }}
  </div>
</template>

<style>
.mcr-project-metadata {
    padding: 10px;
}
</style>
