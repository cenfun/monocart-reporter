<script setup>
import { watchEffect, shallowReactive } from 'vue';

import Util from '../../../utils/util.js';

import AttachmentHead from './attachment-head.vue';

const props = defineProps({
    data: {
        type: Object,
        default: () => {}
    }
});

const d = shallowReactive({
    list: []
});

watchEffect(() => {
    const report = props.data.report;
    if (report && report.categories) {
        const list = [];
        report.categories.forEach((item) => {
            list.push(item);
            if (item.metrics) {
                item.metrics.forEach((sub) => {
                    sub.sub = true;
                    list.push(sub);
                });
            }
        });
        d.list = list;
    }
});
</script>

<template>
  <details
    class="mcr-attachment-audit"
    open
  >
    <AttachmentHead :retry="props.data.retry">
      <a
        :href="props.data.path"
        target="_blank"
      >{{ props.data.name }}</a>
    </AttachmentHead>
    <div class="mcr-attachment-body">
      <table>
        <tr class="mcr-head">
          <td class="mcr-column-left">
            Name
          </td>
          <td />
          <td>
            Score
          </td>
        </tr>

        <tr
          v-for="(item, i) of d.list"
          :key="i"
          :class="item.sub?'mcr-row-sub':''"
        >
          <td class="mcr-column-left mcr-column-name">
            {{ item.name }}
          </td>
          <td>{{ item.value }}</td>
          <td :class="'mcr-'+item.status">
            {{ Util.PNF(item.score) }}
          </td>
        </tr>
      </table>
    </div>
  </details>
</template>

<style lang="scss">
.mcr-attachment-audit {
    .mcr-column-name {
        font-weight: bold;
    }

    .mcr-row-sub {
        .mcr-column-name {
            padding-left: 20px;
            font-weight: normal;
        }
    }
}
</style>
