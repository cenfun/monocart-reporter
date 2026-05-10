<script setup>
import MetadataList from '../report/metadata-list.vue';

const props = defineProps({
    column: {
        type: Object,
        default: () => {}
    }
});

</script>

<template>
  <div class="mcr-metadata-content">
    <MetadataList
      v-if="props.column.content"
      :list="props.column.content"
    />
  </div>
</template>

<style lang="scss">
.mcr-metadata-content {
    position: relative;
    padding: 0;
}
</style>
