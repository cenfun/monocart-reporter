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
  <div class="mcr-attachment-link">
    <VuiFlex>
      <IconLabel icon="item-arrow" />
      <a
        :href="props.data.path"
        :download="props.data.name"
        target="_blank"
      >Download</a>
    </VuiFlex>
  </div>
</template>

<style lang="scss">
.mcr-attachment-link {
    padding: 10px;
    background-color: #f6f8fa;
}
</style>
