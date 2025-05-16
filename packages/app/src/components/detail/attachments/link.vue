<script setup>
import { computed } from 'vue';
import { components } from 'vine-ui';
const { VuiFlex } = components;
import IconLabel from '../../icon-label.vue';

const props = defineProps({
    data: {
        type: Object,
        default: () => {}
    }
});


const download = computed(() => {
    if (props.data.link) {
        return null;
    }
    return props.data.fileName || props.data.name;
});
</script>

<template>
  <div class="mcr-attachment-link">
    <VuiFlex gap="3px">
      <IconLabel :icon="download?'download':'link'" />
      <a
        :href="props.data.path"
        :download="download"
        target="_blank"
      >{{ download ? "Download" : "Open" }}</a>
    </VuiFlex>
  </div>
</template>

<style lang="scss">
.mcr-attachment-link {
    padding: 10px;
    background-color: #f6f8fa;
}
</style>
