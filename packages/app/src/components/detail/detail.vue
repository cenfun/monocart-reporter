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
import { markdownFormatter, mergeAnnotations } from '../../modules/formatters.js';

import IconLabel from '../icon-label.vue';
import SimpleColumns from './simple-columns.vue';
import DetailColumns from './detail-columns.vue';

import RowTitle from './row-title.vue';

const { VuiFlex, VuiSwitch } = components;

const data = shallowReactive({
    list: [],
    stepCollapsedDisabled: false,
    stepFailedOnly: false,
    stepSubs: false,
    errors: [],
    attachments: []
});

const el = ref(null);
let $el;

const itemClass = (d) => {
    const ls = ['mcr-detail-item'];
    if (d.classLevel) {
        ls.push(d.classLevel);
    }
    return ls;
};

const itemHeadClass = (d) => {
    return ['mcr-detail-head', `mcr-detail-${d.type}`, d.classMap];
};

const onLocationClick = (item) => {
    if (item.state.locationLabel) {

        Util.copyText(item.data.location).then((res) => {
            if (res) {
                item.state.locationLabel = 'copied';
                setTimeout(() => {
                    item.state.locationLabel = '';
                }, 1000);
            } else {
                item.state.locationLabel = '';
            }
        });

    } else {
        item.state.locationLabel = item.data.location;
    }
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

    const reg = /\s$/;
    const endsWithN = reg.test(str) ? '' : '<br/>';

    // link
    // const re = /(http[s]?:\/\/([\w-]+.)+([:\d+])?(\/[\w-./?%&=]*)?)/gi;
    // str = str.replace(re, function(a) {
    //     return `<a href="${a}" target="_blank">${a}</a>`;
    // });

    str = convert.toHtml(str) + endsWithN;

    return str;
};

// ===========================================================================

const getColumns = (list, item, columns) => {

    // metadata for project
    if (item.type === 'suite' && item.suiteType === 'project') {
        const result = getProjectMetadata(item);
        if (result) {
            // virtual column for project metadata
            const column = {
                id: 'metadata',
                name: 'Metadata'
            };
            addResult(list, item, column, result);
        }
    }

    columns.forEach((column) => {

        const result = getColumn(item, column);
        if (result) {
            addResult(list, item, column, result);
        }

        if (Util.isList(column.subs)) {
            getColumns(list, item, column.subs);
        }

    });

};

const getPositionId = (rowId, columnId) => {
    return [rowId, columnId].join('-');
};

const addResult = (list, item, column, result) => {
    result.data = column;
    result.positionId = getPositionId(item.id, column.id);
    result.positionType = column.id;
    result = shallowReactive(result);

    list.push(result);
};

const getProjectMetadata = (item) => {
    const metadata = item.metadata;
    if (!metadata || typeof metadata !== 'object') {
        return;
    }

    const metadataList = Util.getMetadataList(metadata);
    if (!metadataList.length) {
        return;
    }

    return {
        id: 'metadata',
        icon: 'metadata',
        list: metadataList
    };
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

    return handler(item, column);
};

// ===========================================================================

const getErrors = (item, column) => {
    const errors = item.errors;
    if (!Util.isList(errors)) {
        return;
    }

    const position = {
        rowId: item.id,
        columnId: column.id
    };
    const list = errors.map((error) => {
        data.errors.push({
            error,
            position
        });
        return convertHtml(error);
    });
    const content = list.join('');

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

    attachments.forEach((it) => {
        data.attachments.push(it);
    });

    return {
        id: column.id,
        icon: 'attachment',
        list: attachments
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

const onStepsClick = (item) => {
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

// wait for image loaded
const updatePosition = debounce(() => {

    if (!$el) {
        return;
    }

    const position = state.position;
    if (!position) {
        return;
    }
    state.position = null;

    // console.log('position', position);

    // check positionId first
    let found = true;
    const positionId = getPositionId(position.rowId, position.columnId);
    let elem = $el.querySelector(`[position-id="${positionId}"]`);
    if (!elem) {
        found = false;
        // not found but try to find related type position
        elem = $el.querySelector(`[position-type="${position.columnId}"]`);
    }

    if (!elem) {
        Util.setFocus();
        return;
    }

    if (typeof elem.scrollIntoViewIfNeeded === 'function') {
        elem.scrollIntoViewIfNeeded();
    } else {
        elem.scrollIntoView();
    }
    if (found) {
        Util.setFocus(elem);
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

const collectErrorForAttachment = () => {
    const { errors, attachments } = data;
    data.errors = [];
    data.attachments = [];

    if (!attachments.length || !errors.length) {
        return;
    }

    const list = attachments.filter((attachment) => {
        if (attachment.name) {
            // first one is expected
            const match = attachment.name.match(/^(.*)-expected(\.[^.]+)?$/);
            if (match) {
                return true;
            }
        }
    });

    if (!list.length) {
        return;
    }

    let index = 0;
    errors.forEach((item) => {
        const { error, position } = item;
        const match = error.match(/\d+ pixels \(ratio \d+\.\d+ of all image pixels\) are different/);
        if (match) {
            const attachment = list[index];
            if (attachment) {
                attachment.message = match[0];
                attachment.position = position;
                index += 1;
            }
        }
    });

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

    // temp list for errors match to attachments
    data.errors = [];
    data.attachments = [];

    let lastItem;
    data.list = list.map((item) => {

        initDataColumns(item);

        const left = item.tg_level * 13;
        let icon = Util.getTypeIcon(item.suiteType, item.type);
        if (item.caseType) {
            icon = item.caseType;
        }

        const positionId = getPositionId(item.id, 'title');
        const stepGroup = item.type === 'step' && item.subs;
        if (stepGroup) {
            icon = '';
        }

        if (lastItem && lastItem.tg_level > item.tg_level) {
            item.classLevel = 'mcr-detail-out';
        }

        lastItem = item;

        return {
            data: item,
            state: shallowReactive({}),
            positionId,
            stepGroup,
            style: `margin-left:${left}px;`,
            icon,
            simpleColumns: item.tg_simpleColumns,
            detailColumns: item.tg_detailColumns
        };
    });

    collectErrorForAttachment();

};

const renderMermaid = async () => {
    // console.log('renderMermaid');
    await window.mermaid.run();
};

const loadMermaid = microtask(() => {
    // console.log('loadMermaid');

    const mermaidScript = document.querySelector("script[id='mermaid']");
    if (mermaidScript) {
        renderMermaid();
        return;
    }

    const mermaidOptions = state.mermaid;
    if (!mermaidOptions) {
        return;
    }

    const scriptSrc = mermaidOptions.scriptSrc;
    if (!scriptSrc) {
        return;
    }

    const config = {
        ... mermaidOptions.config
    };
    // console.log(config);

    const script = document.createElement('script');
    script.src = scriptSrc;
    script.onload = () => {
        script.setAttribute('id', 'mermaid');
        window.mermaid.initialize(config);
        renderMermaid();
    };
    document.body.appendChild(script);
});

const updateCase = microtask(() => {
    const caseItem = state.flyoverData;

    if (!caseItem) {
        return;
    }

    data.caseId = caseItem.id;

    initDataList();

    if (state.mermaidEnabled) {
        loadMermaid();
    }

});

// ===========================================================================

watch(() => state.position, (v) => {
    if (v) {
        updatePosition();
    }
});

watch(() => state.flyoverData, (v) => {
    if (state.flyoverComponent === 'detail') {
        updateCase();
    }
});

onMounted(() => {
    $el = el.value;
    if (state.position) {
        updatePosition();
    }
});

onActivated(() => {
    updateCase();
});

const onFocus = (e) => {
    Util.setFocus();
};

</script>

<template>
  <div
    ref="el"
    class="mcr-detail"
    tabindex="0"
    @focus="onFocus"
    @click="onFocus"
  >
    <div
      v-for="item, ik in data.list"
      :key="ik"
      :class="itemClass(item.data)"
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
          <RowTitle :item="item" />
        </IconLabel>
        <RowTitle
          v-else
          :item="item"
        />

        <SimpleColumns :list="item.simpleColumns" />

        <div class="vui-flex-auto" />

        <div
          v-if="Util.isNum(item.data.duration)"
          class="mcr-detail-duration"
        >
          {{ Util.TF(item.data.duration) }}
        </div>

        <IconLabel
          v-if="item.data.location"
          icon="location"
          :tooltip="item.data.location"
          @click="onLocationClick(item)"
        >
          {{ item.state.locationLabel }}
        </IconLabel>
      </VuiFlex>
      <DetailColumns
        class="mcr-detail-body"
        :list="item.detailColumns"
      />
      <VuiFlex
        v-if="item.data.type==='case'&&item.data.stepNum"
        class="mcr-detail-steps"
        gap="10px"
      >
        <IconLabel
          :icon="item.data.collapsed?'collapsed':'expanded'"
          @click="onStepsClick(item.data)"
        >
          <b>Steps</b>
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
</template>

<style lang="scss">
.mcr-detail {
    width: 100%;
    height: 100%;
    padding: 0 0 5px 5px;
    overflow: hidden auto;
}

.mcr-detail-item {
    position: relative;
    border-bottom: 1px solid #ccc;

    &.mcr-detail-out {
        margin-top: -1px;
        border-top: 1px solid #ccc;
    }
}

.mcr-detail-body {
    border-top: 1px solid #eee;
    border-left: 1px solid #ccc;
}

.mcr-detail-steps {
    min-height: 35px;
    padding: 5px;
    border-top: thin solid #eee;
    border-left: thin solid #ccc;
    user-select: none;
}

.mcr-detail-head {
    position: relative;
    z-index: 1;
    min-height: 35px;
    border-left: 1px solid #ccc;

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
    &.mcr-detail-step + .mcr-detail-body,
    &.mcr-case-passed,
    &.mcr-case-passed + .mcr-detail-body {
        border-left-color: var(--color-passed);
    }

    &.mcr-step-error,
    &.mcr-step-error + .mcr-detail-body,
    &.mcr-case-failed,
    &.mcr-case-failed + .mcr-detail-body {
        border-left-color: var(--color-failed);
    }

    &.mcr-step-retry,
    &.mcr-case-flaky,
    &.mcr-case-flaky + .mcr-detail-body {
        border-left-color: var(--color-flaky);
    }

    &.mcr-case-failed + .mcr-detail-body,
    &.mcr-case-flaky + .mcr-detail-body {
        border-top: none;
    }
}

.mcr-detail-suite {
    .mcr-detail-title {
        font-weight: bold;
    }
}

.markdown-body {
    margin: 0;

    .mermaid {
        margin: 0;
    }
}
</style>
