<script setup>
import { components } from 'vine-ui';
import IconLabel from '../icon-label.vue';

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
      <div
        :class="columnContentClass(column)"
        v-html="column.content"
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

.mcr-detail-logs {
    position: relative;
}

.mcr-detail-errors {
    .mcr-column-head {
        color: var(--color-failed);
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

.mcr-detail-attachments {
    .mcr-detail-attachment:not(:last-child) {
        margin-bottom: 5px;
    }

    .mcr-attachment-head {
        padding: 5px 0;
    }

    .mcr-attachment-body {
        padding: 10px;
        border: 1px solid #eee;

        img {
            display: block;
            max-width: 100%;
        }
    }

    .mcr-attachment-group {
        display: flex;
        flex-flow: row wrap;
        gap: 10px;
    }

    .mcr-attachment-group:not(:last-child) {
        margin-bottom: 10px;
    }

    .mcr-low {
        background: #fce1e5;
    }

    .mcr-medium {
        background: #fff4c2;
    }

    .mcr-high {
        background: rgb(230 245 208);
    }

    .mcr-covered {
        color: green;
    }

    .mcr-uncovered {
        color: red;
    }

    table {
        width: 100%;
        border-collapse: collapse;

        tr {
            position: relative;
        }

        tr:not(:last-child) {
            border-bottom: 1px solid #ddd;
        }

        tr.mcr-row-summary {
            border-top: 2px solid #ddd;
        }

        tr:first-child {
            font-weight: bold;
        }

        tr:hover::after {
            position: absolute;
            top: 0;
            left: 0;
            content: "";
            display: block;
            width: 100%;
            height: 100%;
            background-color: rgb(0 0 0 / 2%);
            pointer-events: none;
        }

        td {
            padding: 5px 8px;
            text-align: right;
        }

        .mcr-column-filename {
            min-width: 100px;
            text-align: left;
            word-break: break-all;
        }

        .mcr-column-left {
            min-width: 100px;
            white-space: nowrap;
            text-align: left;
        }

        .mcr-column-sub {
            padding-left: 20px;
        }

        .mcr-column-description {
            color: #666;
            font-size: 12px;
            text-align: left;
        }

        .mcr-head {
            background-color: #f8f8f8;
        }
    }
}

.mcr-attachment-image {
    a {
        display: block;
    }
}

.mcr-attachment-trace {
    .mcr-trace-details {
        display: flex;
        flex-direction: row;

        a {
            white-space: nowrap;
        }

        details {
            summary {
                margin-left: 15px;
                color: #666;
                cursor: pointer;
                user-select: none;
            }

            dl {
                margin-top: 5px;
                margin-left: 15px;
            }

            dd {
                margin: 0;
            }
        }
    }
}

.mcr-attachment-audit {
    .mcr-attachment-body {
        padding: 0;
        border: 1px solid #ddd;
        overflow-x: auto;
    }
}

.mcr-attachment-coverage {
    .mcr-attachment-body {
        border: 1px solid #ddd;
        overflow-x: auto;
    }
}

.mcr-attachment-network {
    .mcr-attachment-body {
        .mcr-network-waterfall {
            width: 100%;
            height: 30px;
        }
    }

    .mcr-waterfall {
        position: relative;
        width: 100%;
        height: 100%;
        background-color: #f8f8f8;
    }

    .mcr-waterfall-line {
        position: absolute;
        top: 0;
        width: 1px;
        height: 100%;
    }

    .mcr-waterfall-rect {
        position: absolute;
        top: 50%;
        height: 50%;
        transform: translateY(-50%);
    }
}
</style>
