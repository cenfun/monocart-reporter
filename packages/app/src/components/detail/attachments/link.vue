<script setup>
import { computed } from 'vue';
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
  <div
    v-if="props.data.path"
    class="mcr-attachment-link"
  >
    <IconLabel
      :icon="download?'download':'link'"
      :button="false"
    />
    <a
      :href="props.data.path"
      :download="download"
      target="_blank"
    >{{ download ? "Download" : "Open" }}</a>
  </div>
</template>

<style lang="scss">
.mcr-attachment-link {
    position: relative;
    display: flex;
    flex: auto;
    gap: 5px;
    align-items: center;
    padding: 0 10px;
}
</style>
