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
        </VuiFlex>

        <VuiFlex
          v-for="column, sk in item.simpleColumns"
          :key="sk"
          gap="5px"
          wrap
          class="mcr-column-simple"
        >
          <div class="mcr-simple-head">
            {{ column.data.name }}
          </div>
          <div
            class="mcr-simple-content"
            v-html="column.content"
          />
        </VuiFlex>

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
        <div
          v-for="column, dk in item.detailColumns"
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
            v-if="item.data.stepSubs"
            v-model="item.data.stepCollapsed"
            :disabled="data.stepCollapsedDisabled"
            :label-clickable="true"
            label-position="right"
            @click="onStepCollapsedClick(item.data)"
          >
            Collapse All
          </VuiSwitch>

          <VuiSwitch
            v-if="item.data.stepFailed"
            v-model="item.data.stepFailedOnly"
            :label-clickable="true"
            label-position="right"
            @click="onStepFailedClick(item.data)"
          >
            Only Failed
          </VuiSwitch>
        </VuiFlex>
      </div>
    </div>
  </div>
</template>
<script setup>
import {
    ref, watch, shallowReactive, onMounted
} from 'vue';
import { components } from 'vine-ui';
import { debounce } from 'async-tick';
import 'github-markdown-css/github-markdown-light.css';

import Convert from 'ansi-to-html';

import Util from '../utils/util.js';
import state from '../modules/state.js';
import {
    tagFormatter, markdownFormatter, mergeAnnotations
} from '../modules/formatters.js';

import IconLabel from './icon-label.vue';

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
    const cacheKey = `${column.id}_detail`;
    if (Util.hasOwn(item, cacheKey)) {
        return item[cacheKey];
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

    item[cacheKey] = res;

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
    const list = attachments.map((attachment) => {
        if (typeof attachment.path !== 'string') {
            return '';
        }
        return getAttachment(attachment);
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

const getAttachment = (item) => {
    // console.log(attachment);
    // contentType 'application/json' 'image/png' 'video/webm'
    const {
        contentType, name, path
    } = item;
    if (contentType) {
        if (contentType.startsWith('image')) {
            return getImage(path, name);
        }
        if (contentType.startsWith('video')) {
            return getVideo(path, name, contentType);
        }
        if (contentType === 'application/zip' && name === 'trace') {
            return getTrace(path, name);
        }
        if (contentType === 'text/html' && name === 'coverage') {
            return getCoverage(path, name, item.report);
        }
    }
    return getLink(path, name);
};

const getImage = (path, name) => {
    const body = `<img src="${path}" alt="${name}" />`;
    return getLink(path, name, 'image', body);
};

const getVideo = (path, name, contentType) => {
    const body = `<video controls height="350"><source src="${path}" type="${contentType}"></video>`;
    return getLink(path, name, 'video', body);
};

const getTrace = (path, name) => {
    const protocol = window.location.protocol;
    const isOnline = ['http:', 'https:'].includes(protocol);

    const traceFile = `<a href="${path}" target="_blank">${name}</a>`;
    const traceViewer = '<a href="https://trace.playwright.dev/" target="_blank">Trace Viewer</a>';

    const traceUrl = new URL(path, window.location.href);
    const viewerUrl = `https://trace.playwright.dev/?trace=${encodeURIComponent(traceUrl)}`;

    const color = isOnline ? 'green' : 'red';
    const currentProtocol = `current protocol is <code style="color:${color}">${protocol}</code>`;

    const showReport = 'try <code>npx monocart show-report &lt;your-outputFile-path&gt;</code> start a local web server, please keep attachments and reports under the same directory.';
    const readme = `The Trace Viewer requires that the trace file must be loaded over the http:// or https:// protocols (${currentProtocol})  
            without <a href="https://developer.mozilla.org/en-US/docs/Glossary/CORS" target="_blank">CORS</a> issue,
            ${showReport}
        `;

    const ls = [];
    ls.push(`<li><a href="${viewerUrl}" target="_blank">View trace online</a> <span class="mcr-readme">${readme}</span></li>`);
    ls.push(`<li>or download the ${traceFile} file and load it on the page ${traceViewer}</li>`);

    const body = ls.join('');
    return getLink(path, name, 'trace', body);
};

const getCoverageBody = (report) => {
    if (!report) {
        return '';
    }
    const files = report.files;
    if (!files) {
        return '';
    }
    const map = {
        statements: 'Statements',
        branches: 'Branches',
        functions: 'Functions',
        lines: 'Lines'
    };
    const items = [].concat(files);
    if (files.length > 1) {
        report.summary = true;
        report.name = 'Summary';
        items.push(report);
    }

    console.log(items);

    const ls = [];
    ls.push('<table>');

    ls.push('<tr class="mcr-head"><td></td><td class="mcr-file">File</td>');
    Object.keys(map).forEach((k) => {
        ls.push(`<td colspan="2">${map[k]}</td>`);
    });
    ls.push('</tr>');

    items.forEach((item, i) => {
        ls.push('<tr>');

        if (item.summary) {
            ls.push('<td></td>');
        } else {
            ls.push(`<td>${i + 1}</td>`);
        }
        ls.push(`<td class="mcr-file">${item.name}</td>`);

        Object.keys(map).forEach((k) => {
            const d = item[k] || {};
            ls.push(`<td class="mcr-${d.status}">${Util.NF(d.covered)}/${Util.NF(d.total)}</td>`);
            // low, medium, high, unknown
            ls.push(`<td class="mcr-${d.status}">${Util.PF(d.pct, 100, 2)}</td>`);
        });
        ls.push('</tr>');
    });
    ls.push('</table>');
    return ls.join('');
};

const getCoverage = (path, name, report) => {
    const body = getCoverageBody(report);
    return getLink(path, name, 'coverage', body);
};

const getLink = (path, name, type = 'link', body = '') => {
    if (body) {
        body = `<div class="mcr-attachment-body">${body}</div>`;
    }
    return `<div class="mcr-detail-attachment mcr-attachment-${type}">
                <div class="mcr-attachment-head"><a href="${path}" target="_blank">${name}</a></div>
                ${body}
            </div>`;
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

const onColumnHeadClick = (column) => {
    column.collapsed = !column.collapsed;
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
            simpleColumns,
            detailColumns
        };
    });

};

const updateCase = (caseItem) => {
    if (!caseItem) {
        return;
    }

    data.caseId = caseItem.id;

    initDataList();

};

// ===========================================================================

watch(() => state.caseItem, (v) => {
    updateCase(v);
});

watch(() => state.position, (v) => {
    if (v) {
        updatePosition(v);
        state.position = null;
    }
});

onMounted(() => {
    $el = el.value;
});

</script>
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

.mcr-column-simple {
    min-width: 20px;
    min-height: 20px;
    padding: 0 5px;
    font-size: 13px;
    line-height: 20px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background-color: rgb(175 184 193 / 20%);
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
        font-weight: bold;
        user-select: none;
    }
}

.mcr-detail-logs {
    border-left-color: #999;
    background-color: #fcfcfc;
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
        border: 1px solid #eee;

        img,
        video {
            display: block;
        }
    }

    .mcr-attachment-image {
        a {
            display: block;
        }

        img {
            display: block;
            max-height: 350px;
        }
    }

    .mcr-attachment-trace {
        .mcr-attachment-body {
            padding: 5px;

            li {
                line-height: 20px;
            }

            .mcr-readme {
                margin-left: 5px;
            }
        }
    }

    .mcr-attachment-coverage {
        .mcr-attachment-body {
            border: 1px solid #ddd;
            overflow-x: auto;
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

        .mcr-head {
            background-color: #f8f8f8;
        }

        .mcr-file {
            min-width: 100px;
            text-align: left;
            word-break: break-all;
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
        }
    }
}

</style>
