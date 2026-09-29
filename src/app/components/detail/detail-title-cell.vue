<template>
  <div
    :class="classMap"
    :data-type="rowItem.type"
  >
    <DetailColumn
      v-if="rowItem.type==='details'"
      :column="rowItem"
    />

    <div
      v-else
      class="mcr-detail-head"
    >
      <div
        ref="mainRef"
        class="mcr-detail-main mcr-flex-auto"
      >
        <VuiIconLabel
          v-if="data.iconType && !useGridTitleCell"
          :icon="data.iconType"
          :button="false"
          :title="data.iconType"
        />

        <GridTitleCell
          v-if="useGridTitleCell"
          ref="titleRef"
          :row-item="rowItem"
          :column-item="titleColumn"
          :case-clickable="false"
          :hide-duplicate-subtitle="true"
          :class="titleClass"
          wrap
        >
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
        </GridTitleCell>

        <div
          v-else
          :class="titleClass"
          tooltip
          v-html="data.html"
        />

        <div
          v-if="stepParams.length"
          ref="paramsRef"
          class="mcr-step-params"
          :class="{ 'mcr-step-params-measure': data.paramsMore }"
          :aria-hidden="data.paramsMore"
        >
          <div
            v-for="param of stepParams"
            :key="param.name"
            class="mcr-simple-column"
          >
            {{ param.name }} <span>{{ param.value }}</span>
          </div>
        </div>
        <VuiIconLabel
          v-if="stepParams.length && data.paramsMore"
          class="mcr-step-params-more"
          icon="more"
          button
          @mouseenter="onMetadataClick($event, rowItem.params)"
          @mouseleave="onMetadataLeave($event)"
          @click="onMetadataClick($event, rowItem.params)"
        />

        <VuiSwitch
          v-if="data.showAttachmentsCollapse"
          v-model="state.collapseAttachments"
          :disabled="rowItem.collapsed"
          :label-clickable="true"
          label-position="right"
          width="28px"
          height="18px"
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
          height="18px"
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
    computed, shallowReactive, ref, onMounted, onBeforeUnmount, nextTick
} from 'vue';
import {
    VuiSwitch,
    VuiIconLabel
} from 'vine-ui';

import Util from '../../utils/util.js';
import state from '../../modules/state.js';
import {
    closeMetadata, onMetadataClick, onMetadataLeave
} from '../../modules/metadata.js';

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
    showAttachmentsCollapse: false,
    paramsMore: true
});

const mainRef = ref();
const titleRef = ref();
const paramsRef = ref();
let paramsObserver;

const formatParam = (value) => {
    if (typeof value === 'string') {
        return value;
    }
    try {
        return JSON.stringify(value) || String(value);
    } catch (e) {
        return String(value);
    }
};

const stepParams = computed(() => {
    const params = props.rowItem.type === 'step' && props.rowItem.params;
    if (!params || typeof params !== 'object') {
        return [];
    }
    return Object.entries(params).map(([name, value]) => ({
        name,
        value: formatParam(value)
    }));
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
    data.showStepsCollapse || data.showAttachmentsCollapse || stepParams.value.length ? '' : 'mcr-flex-auto'
]);

const measureTitleWidth = () => {
    const title = titleRef.value?.$el;
    const main = mainRef.value;
    if (!title || !main) {
        return 0;
    }
    const clone = title.cloneNode(true);
    Object.assign(clone.style, {
        position: 'absolute',
        visibility: 'hidden',
        width: 'max-content',
        maxWidth: 'none',
        whiteSpace: 'nowrap',
        overflow: 'visible',
        flex: 'none'
    });
    clone.querySelectorAll('.grid-title-tags, .grid-title-text').forEach((node) => {
        node.style.flexWrap = 'nowrap';
        node.style.whiteSpace = 'nowrap';
        node.style.overflow = 'visible';
    });
    main.appendChild(clone);
    const width = clone.getBoundingClientRect().width;
    clone.remove();
    return width;
};

const updateParamsDisplay = () => {
    if (!stepParams.value.length || !mainRef.value || !paramsRef.value) {
        return;
    }
    const main = mainRef.value;
    const gap = parseFloat(getComputedStyle(main).columnGap) || 0;
    const showMore = measureTitleWidth() + gap + paramsRef.value.getBoundingClientRect().width > main.clientWidth;
    const target = state.metadata.popoverTarget;
    if (!showMore && target && main.contains(target)) {
        closeMetadata(target);
    }
    data.paramsMore = showMore;
};

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
        if (stepParams.value.length) {
            nextTick(updateParamsDisplay);
            paramsObserver = new ResizeObserver(updateParamsDisplay);
            paramsObserver.observe(mainRef.value);
        }
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

onBeforeUnmount(() => {
    paramsObserver?.disconnect();
    const target = state.metadata.popoverTarget;
    if (target && mainRef.value?.contains(target)) {
        closeMetadata(target);
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

    .mcr-tags {
        flex-wrap: wrap;
    }
}

.mcr-detail-step-info .mcr-detail-title {
    font-weight: bold;
}

.mcr-detail-step .mcr-detail-main {
    flex-shrink: 1;
    min-width: 0;
    flex-wrap: nowrap;
}

.mcr-detail-step .mcr-detail-title:has(+ .mcr-step-params) {
    min-width: 0;
    flex: 0 1 auto;
}

.mcr-step-params {
    display: flex;
    flex: 0 0 auto;
    gap: 5px;
    align-items: center;
    white-space: nowrap;

    .mcr-simple-column {
        max-width: none;
        margin-left: 0;
    }
}

.mcr-step-params-measure {
    position: absolute;
    visibility: hidden;
    pointer-events: none;
}

.mcr-step-params-more {
    flex-shrink: 0;
}

.mcr-detail-collapse {
    margin-left: 10px;
}

.mcr-detail-status {
    padding: 5px 8px;
    color: #fff;
    text-transform: capitalize;
    border-radius: 8px;
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
