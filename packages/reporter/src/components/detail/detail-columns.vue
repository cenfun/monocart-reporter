<script setup>
import { components } from 'vine-ui';
import IconLabel from '../icon-label.vue';
import Attachments from './attachments/attachments.vue';

const { VuiFlex } = components;

const props = defineProps({
    list: {
        type: Array,
        default: () => []
    }
});

const itemColumnClass = (item) => {
    return ['mcr-detail-column', `mcr-detail-${item.id}`];
};

const columnContentClass = (column) => {
    const cls = ['mcr-column-content'];
    if (column.collapsed) {
        cls.push('mcr-column-collapsed');
    } else {
        cls.push('mcr-column-expanded');
    }
    return cls;
};

const onColumnHeadClick = (column) => {
    column.collapsed = !column.collapsed;
};

const onCopyClick = (e, column) => {
    const container = e.currentTarget && e.currentTarget.parentNode;
    if (!container) {
        return;
    }
    const elem = container.querySelector('.mcr-column-html');
    if (!elem) {
        return;
    }
    const text = elem.innerText;
    try {
        navigator.clipboard.writeText(text).then(() => {
            column.copied = 'copied';
            setTimeout(() => {
                column.copied = '';
            }, 1000);
        });
    } catch (err) {
        //
    }
};

</script>

<template>
  <VuiFlex
    v-if="props.list.length"
    direction="column"
    gap="10px"
    padding="10px"
  >
    <div
      v-for="column, dk in props.list"
      :key="dk"
      :class="itemColumnClass(column.data)"
      :position-id="column.positionId"
      :position-type="column.positionType"
    >
      <IconLabel
        :icon="column.collapsed?'collapsed':'expanded'"
        class="mcr-column-head"
        @click="onColumnHeadClick(column)"
      >
        <IconLabel
          :icon="column.icon"
          size="20px"
        >
          {{ column.data.name }}
        </IconLabel>
      </IconLabel>
      <div :class="columnContentClass(column)">
        <Attachments
          v-if="column.id==='attachments'"
          :list="column.list"
        />
        <template v-else>
          <div
            class="mcr-column-html"
            v-html="column.content"
          />
          <div
            class="mcr-column-copy"
            @click="onCopyClick($event, column)"
          >
            <IconLabel icon="copy">
              {{ column.copied }}
            </IconLabel>
          </div>
        </template>
      </div>
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
    padding: 10px;
    border-top: 1px solid #ddd;
    overflow-x: auto;

    &.mcr-column-collapsed {
        display: none;
    }

    &.mcr-column-expanded {
        display: block;
    }
}

.mcr-column-copy {
    position: absolute;
    top: 10px;
    right: 10px;
    display: none;
}

.mcr-column-content:hover {
    .mcr-column-copy {
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
