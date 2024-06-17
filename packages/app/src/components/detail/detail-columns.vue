<script setup>
import { components } from 'vine-ui';
import IconLabel from '../icon-label.vue';
import Attachments from './attachments/attachments.vue';
import ProjectMetadata from './project-metadata.vue';
import HtmlContent from './html-content.vue';

const columnComponents = {
    attachments: Attachments,
    metadata: ProjectMetadata,
    html: HtmlContent
};

const { VuiFlex } = components;

const props = defineProps({
    list: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['resize']);

const itemColumnClass = (item) => {
    return ['mcr-detail-column', `mcr-detail-${item.id}`];
};

const columnContentClass = (column) => {
    const cls = ['mcr-column-content'];
    if (column.state.collapsed) {
        cls.push('mcr-column-collapsed');
    } else {
        cls.push('mcr-column-expanded');
    }
    return cls;
};

const onColumnHeadClick = (column) => {
    column.state.collapsed = !column.state.collapsed;
    emit('resize');
};

const getColumnComponent = (id) => {
    return columnComponents[id] || columnComponents.html;
};

</script>

<template>
  <VuiFlex
    v-if="props.list.length"
    direction="column"
    gap="10px"
  >
    <div
      v-for="column, dk in props.list"
      :key="dk"
      :class="itemColumnClass(column.data)"
      :position-id="column.positionId"
      :position-type="column.positionType"
    >
      <IconLabel
        :icon="column.state.collapsed?'collapsed':'expanded'"
        class="mcr-column-head"
        @click="onColumnHeadClick(column)"
      >
        <IconLabel :icon="column.icon">
          {{ column.data.name }}
        </IconLabel>
      </IconLabel>

      <component
        :is="getColumnComponent(column.id)"
        :class="columnContentClass(column)"
        :column="column"
      />
    </div>
  </VuiFlex>
</template>

<style lang="scss">
.mcr-detail-column {
    position: relative;
    color: #333;
    border: 1px solid #ddd;
    border-radius: 5px;
    overflow: hidden;
}

.mcr-column-head {
    min-height: 20px;
    padding: 5px;
    font-weight: bold;
    background-color: #f6f8fa;
    user-select: none;
}

.mcr-column-content {
    position: relative;
    border-top: 1px solid #ddd;

    &.mcr-column-collapsed {
        display: none;
    }

    &.mcr-column-expanded {
        display: block;
    }
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
        background-color: #fff;

        .mcr-annotation-item {
            display: flex;
            flex-flow: row wrap;
            gap: 10px;
        }
    }
}

</style>
