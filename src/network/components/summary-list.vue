<script setup>
const props = defineProps({
    title: {
        type: String,
        default: ''
    },
    list: {
        type: Array,
        default: () => {
            return [];
        }
    }
});


</script>

<template>
  <div
    v-if="props.list.length"
    class="mcr-summary-list"
  >
    <details open>
      <summary>
        <b>{{ props.title }}</b>
      </summary>
      <div class="mcr-summary-body">
        <div
          v-for="(item, i) in props.list"
          :key="i"
          class="mcr-summary-item"
          :style="'padding-left:'+item.padding||0"
        >
          <span class="mcr-summary-name">
            {{ item.name }}:
          </span>
          <span
            class="mcr-summary-value"
            v-html="item.value"
          />
        </div>
        <slot />
      </div>
    </details>
  </div>
</template>

<style lang="scss">
.mcr-summary-list {
    position: relative;

    > details {
        > summary {
            padding: 5px 0;
            cursor: pointer;
            user-select: none;
        }
    }

    .mcr-summary-body {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 5px;
        align-items: normal;
        margin-left: 15px;
        text-overflow: ellipsis;
        overflow: hidden;

        > * {
            flex-shrink: 0;
        }
    }

    .mcr-summary-item {
        position: relative;
        font-family: var(--font-monospace);
    }

    .mcr-summary-name {
        color: #333;
        font-weight: bold;
    }

    .mcr-summary-value {
        color: #666;
        font-size: 13px;
        word-break: break-all;
    }
}
</style>

