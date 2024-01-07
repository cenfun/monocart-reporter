<script setup>
import MetadataList from '../metadata-list.vue';

const props = defineProps({
    column: {
        type: Object,
        default: () => {}
    }
});

</script>

<template>
  <div class="mcr-project-metadata">
    <MetadataList :list="props.column.list" />
  </div>
</template>

<style>
.mcr-project-metadata {
    position: relative;
}
</style>
