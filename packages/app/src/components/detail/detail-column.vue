<script setup>
import { nextTick } from 'vue';
import IconLabel from '../icon-label.vue';
import Attachments from './attachments/attachments.vue';
import ProjectMetadata from './project-metadata.vue';
import HtmlContent from './html-content.vue';
import { renderMermaid } from '../../modules/mermaid.js';

const columnComponents = {
    attachments: Attachments,
    metadata: ProjectMetadata,
    html: HtmlContent
};

defineProps({
    column: {
        type: Object,
        default: () => {}
    }
});

const itemColumnClass = (item) => {
    return ['mcr-detail-column', `mcr-detail-${item.id}`];
};

const onColumnHeadClick = (column) => {
    column.state.collapsed = !column.state.collapsed;
    if (!column.state.collapsed) {
        nextTick(() => {
            renderMermaid();
        });
    }
};

const getColumnComponent = (id) => {
    return columnComponents[id] || columnComponents.html;
};

</script>

<template>
  <div :class="itemColumnClass(column.data)">
    <IconLabel
      :icon="column.state.collapsed?'collapsed':'expanded'"
      class="mcr-column-head"
      :position-id="column.positionId"
      :position-type="column.positionType"
      @click="onColumnHeadClick(column)"
    >
      <IconLabel :icon="column.icon">
        {{ column.data.name }}
      </IconLabel>
    </IconLabel>

    <component
      :is="getColumnComponent(column.id)"
      v-if="!column.state.collapsed"
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
    padding: 5px;
    font-weight: bold;
    user-select: none;
}

.mcr-column-content {
    position: relative;
    margin-top: 5px;
    margin-bottom: 5px;
    margin-left: 25px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #f6f8fa;
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

.mcr-detail-annotations {
    .mcr-annotation-list {
        display: flex;
        flex-direction: column;
        gap: 5px;
        border-radius: 5px;

        .mcr-annotation-item {
            display: flex;
            flex-flow: row wrap;
            gap: 10px;
        }
    }
}

</style>
