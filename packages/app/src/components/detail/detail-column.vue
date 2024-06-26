<script setup>
import { nextTick } from 'vue';
import { components } from 'vine-ui';

import IconLabel from '../icon-label.vue';
import ContentAttachment from './detail-content-attachment.vue';
import ContentHtml from './detail-content-html.vue';

import { renderMermaid } from '../../modules/mermaid.js';

const { VuiFlex } = components;

const columnComponents = {
    attachment: ContentAttachment,
    html: ContentHtml
};

defineProps({
    column: {
        type: Object,
        default: () => {}
    }
});

const itemColumnClass = (item) => {
    const ls = ['mcr-detail-column'];
    if (item.id) {
        ls.push(`mcr-detail-${item.id}`);
    }
    return ls;
};

const onColumnHeadClick = (column) => {
    column.tg_state.collapsed = !column.tg_state.collapsed;
    if (!column.tg_state.collapsed) {
        nextTick(() => {
            renderMermaid();
        });
    }
};

const getColumnComponent = (componentType) => {
    return columnComponents[componentType] || columnComponents.html;
};

</script>

<template>
  <div :class="itemColumnClass(column.data)">
    <VuiFlex
      class="mcr-column-head"
      gap="5px"
      @click="onColumnHeadClick(column)"
    >
      <IconLabel
        :icon="column.icon"
        :button="false"
      />

      <div>{{ column.data.name }}</div>

      <IconLabel
        :icon="column.tg_state.collapsed?'collapsed':'expanded'"
        :button="false"
      />

      <div class="vui-flex-auto" />
      <div
        v-if="column.data.retry"
        class="mcr-attachment-retry"
      >
        Retry #{{ column.data.retry }}
      </div>
    </VuiFlex>

    <component
      :is="getColumnComponent(column.componentType)"
      v-if="!column.tg_state.collapsed"
      class="mcr-column-content"
      :column="column"
    />
  </div>
</template>

<style lang="scss">
.mcr-detail-column {
    position: relative;
    color: #333;
    overflow: hidden;
}

.mcr-column-head {
    padding: 5px 0;
    border-radius: 5px;
    cursor: pointer;
    user-select: none;
}

.mcr-column-head:hover {
    color: #000;
}

.mcr-column-content {
    position: relative;
    margin-bottom: 5px;
    border: 1px solid #ccc;
    border-radius: 5px;
    overflow: auto hidden;
}

.mcr-detail-logs {
    position: relative;
}

.mcr-detail-errors {
    .mcr-column-head {
        color: var(--color-failed);
    }

    .mcr-column-content {
        border-color: var(--border-failed);
        background-color: var(--bg-failed);
    }
}

.mcr-detail-errors,
.mcr-detail-logs {
    .mcr-column-content {
        font-family: var(--font-monospace);
        white-space: pre;
    }
}

.mcr-annotation-item {
    display: flex;
    flex-direction: row;
    gap: 10px;
}

.mcr-attachment-retry {
    margin-right: 10px;
    color: var(--color-flaky);
    font-size: small;
    cursor: default;
    user-select: none;
}

</style>
