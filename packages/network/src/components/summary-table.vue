<script setup>
import { shallowReactive, watchEffect } from 'vue';

const data = shallowReactive({
    columns: []
});

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

watchEffect(() => {
    const keys = {};
    props.list.forEach((item) => {
        Object.keys(item).forEach((k) => {
            keys[k] = true;
        });
    });
    data.columns = Object.keys(keys);
});

</script>

<template>
  <div
    v-if="props.list.length"
    class="mcr-summary-table"
  >
    <details open>
      <summary>
        <b>{{ props.title }}</b>
      </summary>

      <div class="mcr-summary-table-body">
        <table>
          <tr
            v-if="data.columns.length>2"
            class="mcr-summary-table-head"
          >
            <td
              v-for="(column, c) in data.columns"
              :key="c"
            >
              {{ column }}
            </td>
          </tr>
          <tr
            v-for="(item, i) in props.list"
            :key="i"
            class="mcr-summary-table-item"
          >
            <td
              v-for="(column, c) in data.columns"
              :key="c"
              :class="'mcr-summary-table-'+column"
              v-html="item[column]"
            />
          </tr>
        </table>
      </div>
    </details>
  </div>
</template>

<style lang="scss">
.mcr-summary-table {
    position: relative;

    details {
        summary {
            padding-bottom: 5px;
            cursor: pointer;
            user-select: none;
        }
    }

    .mcr-summary-table-body {
        margin-top: 5px;
        margin-left: 15px;

        .mcr-summary-table-head {
            background-color: #f8f8f8;
        }

        table {
            width: 100%;
            border-collapse: collapse;

            td {
                padding: 5px;
                border: 1px solid #ddd;
            }
        }
    }

    .mcr-summary-table-item {
        position: relative;
        font-family: var(--font-monospace);
    }

    .mcr-summary-table-name {
        color: #333;
        font-weight: bold;
        white-space: nowrap;
    }

    .mcr-summary-table-value {
        color: #666;
        font-size: 13px;
        word-break: break-all;
    }
}
</style>

