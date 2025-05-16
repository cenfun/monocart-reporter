<script setup>
import { components } from 'vine-ui';
const { VuiFlex } = components;
import IconLabel from '../../icon-label.vue';

const props = defineProps({
    data: {
        type: Object,
        default: () => {}
    }
});

</script>

<template>
  <VuiFlex
    gap="10px"
    direction="column"
    class="mcr-attachment-image"
  >
    <img
      :src="props.data.path"
      :alt="props.data.name"
    >
    <VuiFlex gap="3px">
      <IconLabel icon="download" />
      <a
        :href="props.data.path"
        :download="props.data.fileName || props.data.name"
        target="_blank"
      >Download image</a>
    </VuiFlex>
  </VuiFlex>
</template>

<style lang="scss">
.mcr-attachment-image {
    padding: 10px;

    img {
        display: block;
        max-width: 100%;
        min-height: 30px;
        box-shadow: var(--image-shadow);
    }
}
</style>
