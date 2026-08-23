<script setup>
const props = defineProps({
    list: {
        type: Array,
        default: () => []
    }
});

</script>

<template>
  <div
    v-for="column, sk in props.list"
    :key="sk"
    gap="5px"
    class="mcr-simple-column"
    tooltip
  >
    {{ column.title }}
    <span v-html="column.content" />
  </div>
</template>

<style lang="scss">
.mcr-simple-column {
    min-width: 20px;
    max-width: 100%;
    margin-left: auto;
    padding: 2px 6px;
    font-weight: bold;
    font-size: 13px;
    text-overflow: ellipsis;
    border: 1px solid #ddd;
    border-radius: 5px;
    background-color: rgb(175 184 193 / 20%);
    overflow: hidden;

    span {
        font-weight: normal;
    }
}
</style>
