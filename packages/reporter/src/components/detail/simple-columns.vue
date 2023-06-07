<script setup>
import { components } from 'vine-ui';

const { VuiFlex } = components;

const props = defineProps({
    list: {
        type: Array,
        default: () => []
    }
});

</script>

<template>
  <VuiFlex
    v-if="props.list.length"
    gap="10px"
  >
    <VuiFlex
      v-for="column, sk in props.list"
      :key="sk"
      gap="5px"
      wrap
      class="mcr-column-simple"
    >
      <div class="mcr-simple-head">
        {{ column.data.name }}
      </div>
      <div
        class="mcr-simple-content"
        v-html="column.content"
      />
    </VuiFlex>
  </VuiFlex>
</template>

<style lang="scss">
.mcr-column-simple {
    min-width: 20px;
    min-height: 20px;
    padding: 0 5px;
    font-size: 13px;
    line-height: 20px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background-color: rgb(175 184 193 / 20%);
}
</style>
