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
    v-for="column, sk in props.list"
    :key="sk"
    gap="5px"
    class="mcr-simple-column"
  >
    <div>
      {{ column.title }}
    </div>
    <div v-html="column.content" />
  </VuiFlex>
</template>

<style lang="scss">
.mcr-simple-column {
    align-items: flex-start;
    min-width: 20px;
    max-width: 100%;
    margin-left: auto;
    padding: 2px 6px;
    font-size: 13px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background-color: rgb(175 184 193 / 20%);

    > div:first-child {
        font-weight: bold;
    }

    > div:last-child {
        flex-shrink: 1;
        white-space: normal;
        overflow-wrap: anywhere;
    }
}
</style>
