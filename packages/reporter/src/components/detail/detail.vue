<script setup>
import {
    ref, watch, shallowReactive, onMounted, onActivated
} from 'vue';
import { components } from 'vine-ui';
import { debounce, microtask } from 'monocart-common';

import Convert from 'ansi-to-html';

import 'github-markdown-css/github-markdown-light.css';

import Util from '../../utils/util.js';
import state from '../../modules/state.js';
import {
    tagFormatter, markdownFormatter, mergeAnnotations
} from '../../modules/formatters.js';
import {
    groupComparisons, getComparison, getAttachment
} from '../../modules/attachments.js';

import IconLabel from '../icon-label.vue';
import SimpleColumns from './simple-columns.vue';
import DetailColumns from './detail-columns.vue';

const { VuiFlex, VuiSwitch } = components;

const data = shallowReactive({
    list: [],
    stepCollapsedDisabled: false,
    stepFailedOnly: false,
    stepSubs: false
});

const el = ref(null);
let $el;

const itemHeadClass = (item) => {
    return ['mcr-detail-head', `mcr-detail-${item.type}`, item.classMap];
};


// ===========================================================================
// errors logs html

const convert = new Convert({
    fg: '#333',
    bg: '#F6F8FA',
    newline: true,
    escapeXML: true
});

const convertHtml = (str) => {

    // link
    // const re = /(http[s]?:\/\/([\w-]+.)+([:\d+])?(\/[\w-./?%&=]*)?)/gi;
    // str = str.replace(re, function(a) {
    //     return `<a href="${a}" target="_blank">${a}</a>`;
    // });

    str = convert.toHtml(str);

    return str;
};

// ===========================================================================

const getColumns = (list, item, columns) => {

    columns.forEach((column) => {

        const result = getColumn(item, column);
        if (result) {
            list.push(result);
        }

        if (Util.isList(column.subs)) {
            getColumns(list, item, column.subs);
        }

    });

};

const getColumn = (item, column) => {

    if (!column.name) {
        return;
    }

    const defaultHandler = {
        errors: getErrors,
        logs: getLogs,
        annotations: getAnnotations,
        attachments: getAttachments
    };

    const handler = defaultHandler[column.id] || getCustom;

    let res = handler(item, column);
    if (res) {
        res.data = column;
        res.positionId = [item.id, column.id].join('-');
        res.positionType = column.id;
        res = shallowReactive(res);
    }

    return res;
};

// ===========================================================================

const getErrors = (item, column) => {
    const errors = item.errors;
    if (!Util.isList(errors)) {
        return;
    }

    const list = errors.map((err) => {
        return convertHtml(err);
    });

    const content = list.join('');
    if (!content) {
        return;
    }

    return {
        icon: 'error',
        content
    };
};

const getLogs = (item, column) => {
    const logs = item.logs;
    if (!Util.isList(logs)) {
        return;
    }

    const list = logs.map((log) => {
        return convertHtml(log);
    });

    const content = list.join('');
    if (!content) {
        return;
    }

    return {
        icon: 'log',
        content
    };
};

const getAnnotations = (item, column) => {
    const annotations = item.annotations;

    // string
    if (typeof annotations === 'string' && annotations) {
        return {
            icon: 'annotation',
            content: `<div class="mcr-annotation-list">
                        <div class="mcr-annotation-item">${markdownFormatter(annotations, true)}</div>
                    </div>`
        };
    }

    if (!Util.isList(annotations)) {
        return;
    }
    // must be list
    const map = mergeAnnotations(annotations);
    // console.log(map);

    const list = Object.keys(map).map((k) => {
        const res = [`<b>${k}</b>`];
        const v = map[k];
        v.forEach((des) => {
            if (des) {
                res.push(`<span>${markdownFormatter(des, true)}</span>`);
            }
        });
        return `<div class="mcr-annotation-item">${res.join('')}</div>`;
    });
    // console.log(list);

    const content = list.join('');
    if (!content) {
        return;
    }

    return {
        icon: 'annotation',
        content: `<div class="mcr-annotation-list">
            ${content}
        </div>`
    };
};

// ===========================================================================

const getAttachments = (item, column) => {
    const attachments = item.attachments;
    if (!Util.isList(attachments)) {
        return;
    }

    // image/text comparisons
    const attachmentList = groupComparisons(attachments);

    const options = {
        traceViewerUrl: state.reportData.traceViewerUrl
    };

    const list = attachmentList.map((attachment) => {
        if (attachment.comparison) {
            return getComparison(attachment);
        }
        return getAttachment(attachment, options);
    });

    const content = list.join('');
    if (!content) {
        return;
    }

    return {
        icon: 'attachment',
        content
    };
};

// ===========================================================================

const getCustom = (item, column) => {

    // not detailed default columns here
    // must be boolean false not undefined
    if (column.detailed === false) {
        return;
    }

    const value = item[column.id];

    // do not show null value
    if (value === null || typeof value === 'undefined') {
        return;
    }

    const simple = !column.markdown && !column.detailed;

    let content = value;
    if (typeof column.formatter === 'function') {
        content = column.formatter(value, item, column);
    } else if (column.markdown) {
        content = markdownFormatter(value);
    }

    return {
        simple,
        icon: 'custom',
        content
    };
};

const onRowHeadClick = (item) => {
    item.collapsed = !item.collapsed;
    initDataList();
};

const onStepCollapsedClick = (item) => {
    Util.forEach(item.subs, (step) => {
        if (step.subs) {
            step.collapsed = item.stepCollapsed;
        }
    });
    initDataList();
};

const onStepFailedClick = (item) => {
    if (item.stepFailedOnly && item.collapsed) {
        item.collapsed = false;
    }
    initDataList();
};

// ===========================================================================

const showBlink = debounce((elem) => {
    const classList = elem.classList;
    elem.addEventListener('animationend', function() {
        classList.remove('mcr-blink');
    });
    classList.add('mcr-blink');
});

// wait for image loaded
const updatePosition = debounce((position) => {

    // console.log('position', position);

    if (!$el) {
        return;
    }

    // check positionId first
    let found = true;
    const positionId = [position.rowId, position.columnId].join('-');
    let elem = $el.querySelector(`[position-id="${positionId}"]`);
    if (!elem) {
        found = false;
        // not found but try to find related type position
        elem = $el.querySelector(`[position-type="${position.columnId}"]`);
    }

    if (!elem) {
        return;
    }

    elem.scrollIntoView();

    if (found) {
        showBlink(elem);
    }

}, 100);

// ===========================================================================

const initSteps = (list, steps, parent) => {
    if (parent && parent.collapsed) {
        return;
    }
    if (!Util.isList(steps)) {
        return;
    }
    steps.forEach((step) => {

        if (data.stepFailedOnly && !step.errorNum) {
            return;
        }

        list.push(step);

        if (step.subs) {
            data.stepSubs = true;
        }

        initSteps(list, step.subs, step);
    });
};

const initDataColumns = (item) => {
    if (item.tg_detailColumns) {
        return;
    }

    const allColumns = [];
    getColumns(allColumns, item, state.columns);

    const simpleColumns = [];
    const detailColumns = [];
    if (allColumns.length) {
        allColumns.forEach((c) => {
            if (c.simple) {
                simpleColumns.push(c);
            } else {
                detailColumns.push(c);
            }
        });
    }

    item.tg_simpleColumns = simpleColumns;
    item.tg_detailColumns = detailColumns;
};

const initDataList = () => {

    const caseItem = state.detailMap[data.caseId];

    const list = [];

    // suites
    let suite = caseItem.tg_parent;
    while (suite) {
        list.unshift(suite);
        suite = suite.tg_parent;
    }

    // case
    list.push(caseItem);

    // before init steps
    data.stepFailedOnly = caseItem.stepFailedOnly;
    data.stepSubs = false;
    // collect steps with collapsed
    if (!caseItem.collapsed) {
        initSteps(list, caseItem.subs);
    }

    if (data.stepFailedOnly) {
        data.stepCollapsedDisabled = !data.stepSubs;
    } else {
        data.stepCollapsedDisabled = false;
    }

    data.list = list.map((item) => {

        initDataColumns(item);

        const left = item.tg_level * 13;
        let icon = Util.getTypeIcon(item.suiteType, item.type);
        let size = '16px';
        if (item.caseType) {
            icon = item.caseType;
            size = '20px';
        }

        const positionId = [item.id, 'title'].join('-');
        const stepGroup = item.type === 'step' && item.subs;

        return {
            data: item,
            positionId,
            stepGroup,
            style: `margin-left:${left}px;`,
            icon,
            size,
            simpleColumns: item.tg_simpleColumns,
            detailColumns: item.tg_detailColumns
        };
    });

};

const updateCase = microtask(() => {
    const caseItem = state.flyoverData;

    if (!caseItem) {
        return;
    }

    data.caseId = caseItem.id;

    initDataList();

});

// ===========================================================================

watch(() => state.position, (v) => {
    if (v) {
        updatePosition(v);
        state.position = null;
    }
});

watch(() => state.flyoverData, (v) => {
    if (state.flyoverComponent === 'detail') {
        updateCase();
    }
});

onMounted(() => {
    $el = el.value;
});

onActivated(() => {
    updateCase();
});

</script>

<template>
  <div
    ref="el"
    class="mcr-detail"
  >
    <div
      v-for="item, ik in data.list"
      :key="ik"
      class="mcr-detail-item"
      :style="item.style"
    >
      <VuiFlex
        :class="itemHeadClass(item.data)"
        gap="10px"
        padding="5px"
        :position-id="item.positionId"
        wrap
      >
        <IconLabel
          v-if="item.stepGroup"
          :icon="item.data.collapsed?'collapsed':'expanded'"
          @click="onRowHeadClick(item.data)"
        >
          {{ item.data.title }}
        </IconLabel>

        <VuiFlex
          v-else
          gap="5px"
        >
          <IconLabel
            :icon="item.icon"
            :size="item.size"
            :button="false"
          />
          <div
            class="mcr-detail-title"
            v-html="tagFormatter(item.data)"
          />

          <span
            v-if="item.data.count"
            class="mcr-num mcr-count"
          >{{ item.data.count }}</span>
        </VuiFlex>

        <SimpleColumns :list="item.simpleColumns" />

        <div class="vui-flex-auto" />

        <div
          v-if="item.data.location"
          class="mcr-detail-location"
        >
          {{ item.data.location }}
        </div>

        <div
          v-if="Util.isNum(item.data.duration)"
          class="mcr-detail-duration"
        >
          {{ Util.TF(item.data.duration) }}
        </div>
      </VuiFlex>
      <div class="mcr-detail-body">
        <DetailColumns :list="item.detailColumns" />
        <VuiFlex
          v-if="item.data.type==='case'&&item.data.stepNum"
          class="mcr-detail-column"
          gap="10px"
        >
          <IconLabel
            :icon="item.data.collapsed?'collapsed':'expanded'"
            class="mcr-column-head"
            @click="onRowHeadClick(item.data)"
          >
            Steps
          </IconLabel>
          <div class="mcr-num">
            {{ item.data.stepNum }}
          </div>

          <VuiSwitch
            v-if="item.data.stepSubs&&!item.data.collapsed"
            v-model="item.data.stepCollapsed"
            :disabled="data.stepCollapsedDisabled"
            :label-clickable="true"
            label-position="right"
            @change="onStepCollapsedClick(item.data)"
          >
            Collapse All
          </VuiSwitch>

          <VuiSwitch
            v-if="item.data.stepFailed&&!item.data.collapsed"
            v-model="item.data.stepFailedOnly"
            :label-clickable="true"
            label-position="right"
            @change="onStepFailedClick(item.data)"
          >
            Only Failed
          </VuiSwitch>
        </VuiFlex>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.mcr-detail {
    width: 100%;
    height: 100%;
    padding: 0 0 5px 5px;
    overflow-x: hidden;
    overflow-y: auto;
}

.mcr-detail-item {
    position: relative;
    border-bottom: thin solid #ccc;
}

.mcr-detail-head {
    min-height: 35px;
    border-left: thin solid #ccc;

    &:hover::after {
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

    &.mcr-detail-step,
    &.mcr-case-passed {
        border-left-color: var(--color-passed);
    }

    &.mcr-step-error,
    &.mcr-case-failed {
        border-left-color: var(--color-failed);
    }

    &.mcr-step-retry,
    &.mcr-case-flaky {
        border-left-color: var(--color-flaky);
    }
}

.mcr-detail-location {
    font-size: 13px;
    font-style: italic;
    opacity: 0.6;
}

.mcr-detail-suite {
    .mcr-detail-title {
        font-weight: bold;
    }
}

.mcr-detail-column {
    position: relative;
    padding: 5px;
    color: #333;
    border-top: thin dashed #eee;
    border-left: thin solid #ccc;
    overflow-x: auto;
}

.mcr-column-content {
    padding: 5px;

    &.mcr-column-collapsed {
        display: none;
    }

    &.mcr-column-expanded {
        display: block;
    }
}

.mcr-detail-body {
    .mcr-column-head {
        min-height: 20px;
        font-weight: bold;
        user-select: none;
    }
}

.mcr-detail-logs {
    border-left-color: #999;
}

.mcr-detail-errors {
    border-left-color: var(--color-failed);
    background-color: var(--bg-failed);

    .mcr-column-head {
        color: var(--color-failed);
    }
}

.mcr-detail-errors,
.mcr-detail-logs {
    .mcr-column-content {
        margin-top: 5px;
        font-family: var(--font-monospace);
        white-space: pre;
    }
}

.mcr-detail-annotations {
    border-left-color: #aaa;
    background-color: #f6f8fa;

    .mcr-annotation-list {
        display: flex;
        flex-direction: column;
        gap: 5px;
        margin-top: 5px;
        padding: 10px;
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
    border-left-color: #aaa;

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
