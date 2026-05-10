<script setup>
import { nextTick } from 'vue';
import { components } from 'vine-ui';

import IconLabel from '../icon-label.vue';
import ContentAttachment from './detail-content-attachment.vue';
import ContentHtml from './detail-content-html.vue';
import ContentMetadata from './detail-content-metadata.vue';

import { renderMermaid } from '../../modules/mermaid.js';

const { VuiFlex } = components;

const columnComponents = {
    attachment: ContentAttachment,
    metadata: ContentMetadata,
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
    <div
      v-if="column.inline"
      class="mcr-column-inline"
    >
      <IconLabel
        :icon="column.icon"
        :button="false"
        opacity="0.8"
      >
        {{ column.data.name }}
      </IconLabel>

      <component
        :is="getColumnComponent(column.componentType)"
        class="mcr-inline-content"
        :column="column"
      />

      <div
        v-if="column.data.retry"
        class="mcr-attachment-retry"
      >
        Retry #{{ column.data.retry }}
      </div>
    </div>

    <template v-else>
      <VuiFlex
        class="mcr-column-head"
        gap="5px"
        @click="onColumnHeadClick(column)"
      >
        <IconLabel :icon="column.icon">
          <VuiFlex gap="5px">
            {{ column.data.name }}
            <IconLabel
              :icon="column.tg_state.collapsed?'collapsed':'expanded'"
              :button="false"
            />
          </VuiFlex>
        </IconLabel>

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
    </template>
  </div>
</template>

<style lang="scss">
.mcr-detail-column {
    position: relative;
    overflow: hidden;
}

.mcr-column-head {
    padding: 5px 0;
    border-radius: 5px;
    cursor: pointer;
    user-select: none;
}

.mcr-column-inline {
    display: flex;
    gap: 5px;
    align-items: center;
}

.mcr-column-content {
    position: relative;
    margin-bottom: 5px;
    border: 1px solid var(--border-primary);
    border-radius: 5px;
    background-color: var(--bg-secondary);
    overflow: auto hidden;
}

.mcr-detail-logs {
    position: relative;
}

.mcr-detail-errors {
    .mcr-column-head {
        color: var(--color-failed);
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
    white-space: nowrap;
    cursor: default;
    user-select: none;
}

</style>
