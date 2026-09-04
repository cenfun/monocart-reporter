<template>
  <div :class="classMap">
    <DetailColumn
      v-if="rowItem.type==='details'"
      :column="rowItem"
    />

    <div
      v-else
      class="mcr-detail-head"
    >
      <div class="mcr-detail-main mcr-flex-auto">
        <VuiIconLabel
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

        <GridTitleCell
          v-if="useGridTitleCell"
          :row-item="rowItem"
          :column-item="titleColumn"
          :case-clickable="false"
          :class="titleClass"
          tooltip
        />

        <div
          v-else
          :class="titleClass"
          tooltip
          v-html="data.html"
        />

        <VuiSwitch
          v-if="data.showAttachmentsCollapse"
          v-model="state.collapseAttachments"
          :disabled="rowItem.collapsed"
          :label-clickable="true"
          label-position="right"
          width="28px"
          height="16px"
          class="mcr-detail-collapse"
        >
          Collapse
        </VuiSwitch>

        <VuiSwitch
          v-if="data.showStepsCollapse"
          v-model="state.collapseSteps"
          :disabled="rowItem.collapsed"
          :label-clickable="true"
          label-position="right"
          width="28px"
          height="16px"
          class="mcr-detail-collapse"
        >
          Collapse
        </VuiSwitch>

        <DetailSimpleList
          v-if="rowItem.tg_simpleList"
          :list="rowItem.tg_simpleList"
        />
      </div>

      <DurationLocation
        :row-item="rowItem"
        @update="onRowUpdate"
      />
    </div>
  </div>
</template>

<script setup>
import {
    computed, shallowReactive, onMounted
} from 'vue';
import {
    VuiSwitch,
    VuiIconLabel
} from 'vine-ui';

import Util from '../../utils/util.js';
import state from '../../modules/state.js';

import GridTitleCell from '../grid/grid-title-cell.vue';
import DurationLocation from './duration-location.vue';
import DetailSimpleList from './detail-simple-list.vue';
import DetailColumn from './detail-column.vue';


const emit = defineEmits(['update']);

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
    showStepsCollapse: false,
    showAttachmentsCollapse: false
});

const classMap = computed(() => {
    const ls = ['mcr-detail-info'];
    ls.push(`mcr-detail-${props.rowItem.type}`);
    return ls;
});

const useGridTitleCell = computed(() => ['suite', 'case', 'step'].includes(props.rowItem.type));
const titleColumn = computed(() => state.columns.find((it) => it.id === 'title') || props.columnItem);
const titleClass = computed(() => [
    'mcr-detail-title',
    data.showStepsCollapse || data.showAttachmentsCollapse ? '' : 'mcr-flex-auto'
]);

// eslint-disable-next-line complexity
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
        return;
    }

    if (rowItem.type === 'step') {
        return;
    }

    if (rowItem.type === 'step-info') {
        // step-info
        data.showStepsCollapse = false;
        if (rowItem.subs) {
            const groupStep = rowItem.subs.find((it) => it.subs);
            if (groupStep) {
                data.showStepsCollapse = true;
            }
        }
    }

    if (rowItem.type === 'attachment') {
        data.showAttachmentsCollapse = false;
        if (rowItem.subs) {
            const detailItem = rowItem.subs.find((it) => !it.inline);
            if (detailItem) {
                data.showAttachmentsCollapse = true;
            }
        }
    }

});


const onRowUpdate = () => {
    emit('update');
};

</script>

<style lang="scss">
.mcr-detail-info {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 5px;
    align-items: normal;
    font-weight: normal;
    overflow: hidden;

    > * {
        flex-shrink: 0;
    }
}

.mcr-detail-head {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    min-height: 26px;

    > * {
        flex-shrink: 0;
    }

    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}

.mcr-detail-main {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    align-items: center;
    overflow: hidden;

    > * {
        flex-shrink: 0;
    }
}

.mcr-detail-title {
    min-width: 81px;
    line-height: 100%;
    text-overflow: ellipsis;
    word-break: break-all;
    overflow: hidden;

    a {
        color: inherit;
    }
}

.mcr-detail-step-info .mcr-detail-title {
    font-weight: bold;
}

.mcr-detail-collapse {
    margin-left: 10px;
}

.mcr-detail-status {
    padding: 6px 8px;
    color: #fff;
    line-height: 100%;
    text-transform: capitalize;
    border-radius: 6px;
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
