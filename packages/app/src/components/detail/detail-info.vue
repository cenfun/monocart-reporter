<script setup>
import {
    computed, shallowReactive, onMounted
} from 'vue';
import { components } from 'vine-ui';

import { showTooltip, hideTooltip } from '../../modules/tooltip.js';
import Util from '../../utils/util.js';
import { titleTagsFormatter } from '../../modules/formatters.js';
import state from '../../modules/state.js';

import IconLabel from '../icon-label.vue';
import DurationLocation from './duration-location.vue';
import DetailSimpleList from './detail-simple-list.vue';
import DetailColumn from './detail-column.vue';

const { VuiFlex, VuiSwitch } = components;

const props = defineProps({
    rowItem: {
        type: Object,
        default: () => {}
    },
    columnItem: {
        type: Object,
        default: () => {}
    }
});

const data = shallowReactive({
    iconType: '',
    showCollapse: false
});

const classMap = computed(() => {
    const ls = ['mcr-detail-info'];
    ls.push(`mcr-detail-${props.rowItem.type}`);
    return ls;
});

onMounted(() => {
    const rowItem = props.rowItem;

    data.html = rowItem.title;
    data.iconType = rowItem.icon || Util.getTypeIcon(rowItem.suiteType, rowItem.type);

    // if (rowItem.type === 'suite') {
    //     // suite
    //     return;
    // }

    if (rowItem.type === 'case') {
        data.caseType = rowItem.caseType;
        data.classStatus = ['mcr-detail-status', `mcr-status-${rowItem.caseType}`];
        const titleColumn = state.columns.find((it) => it.id === 'title');
        data.html = titleTagsFormatter(rowItem, titleColumn);
        return;
    }

    if (rowItem.type === 'step') {
        // step
        if (rowItem.stepType === 'retry') {
            data.html = `<b>${rowItem.title}</b>`;
        }
        return;
    }

    if (rowItem.type === 'step-info') {
        // step-info
        data.showCollapse = false;
        if (rowItem.subs) {
            const groupStep = rowItem.subs.find((it) => it.subs);
            if (groupStep) {
                data.showCollapse = true;
            }
        }
    }

});

const onMouseenter = (e) => {
    const node = e.target;
    if (node.clientWidth < node.scrollWidth) {
        const html = false;
        const text = node.innerText;
        showTooltip(node, text, html);
    }
};

const onMouseleave = (e) => {
    hideTooltip();
};

</script>

<template>
  <VuiFlex
    :class="classMap"
    direction="column"
    gap="5px"
  >
    <DetailColumn
      v-if="rowItem.type==='details'"
      :column="rowItem"
    />

    <VuiFlex
      v-else
      gap="10px"
      class="mcr-detail-head"
    >
      <VuiFlex
        gap="5px"
        class="vui-flex-auto"
      >
        <IconLabel
          v-if="data.iconType"
          :icon="data.iconType"
          :button="false"
          :title="data.iconType"
        />

        <div
          v-if="rowItem.index"
          class="mcr-step-index"
        >
          {{ rowItem.index }}
        </div>

        <div
          v-if="data.caseType"
          :class="data.classStatus"
        >
          {{ data.caseType }}
        </div>

        <div
          :class="['mcr-detail-title', data.showCollapse?'':'vui-flex-auto']"
          @mouseenter="onMouseenter"
          @mouseleave="onMouseleave"
          v-html="data.html"
        />

        <VuiSwitch
          v-if="data.showCollapse"
          v-model="state.collapseSteps"
          :disabled="rowItem.collapsed"
          :label-clickable="true"
          label-position="right"
          class="mcr-detail-collapse"
        >
          Collapse
        </VuiSwitch>

        <DetailSimpleList
          v-if="rowItem.tg_simpleList"
          :list="rowItem.tg_simpleList"
        />
      </VuiFlex>

      <DurationLocation :row-item="rowItem" />
    </VuiFlex>
  </VuiFlex>
</template>

<style lang="scss">
.mcr-detail-info {
    position: relative;
    font-weight: normal;
    overflow: hidden;
}

.mcr-detail-head {
    min-height: 26px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}

.mcr-detail-title {
    text-overflow: ellipsis;
}

.mcr-detail-step-info .mcr-detail-title {
    font-weight: bold;
}

.mcr-detail-collapse {
    margin-left: 10px;
}

.mcr-detail-status {
    padding: 8px 12px;
    color: #fff;
    font-weight: bold;
    text-transform: capitalize;
    border-radius: 10px;
}

.mcr-status-failed {
    background-color: var(--color-failed);
}

.mcr-status-passed {
    background-color: var(--color-passed);
}

.mcr-status-flaky {
    background-color: var(--color-flaky);
}

.mcr-status-skipped {
    background-color: var(--color-skipped);
}

.mcr-title-failed {
    color: var(--color-failed);
}

.mcr-step-index {
    min-width: 15px;
    padding: 1px 3px;
    color: #fff;
    font-size: 12px;
    line-height: normal;
    text-align: center;
    border-radius: 5px;
    background-color: gray;
}

.mcr-step-error {
    .mcr-step-index {
        background-color: var(--color-failed);
    }
}

</style>
