<template>
  <div
    ref="el"
    class="mcr-detail"
  >
    <div class="mcr-tree" />
  </div>
</template>
<script setup>
import 'github-markdown-css/github-markdown-light.css';
import Convert from 'ansi-to-html';
import Util from '../util/util.js';
import formatters from '../modules/formatters.js';
import state from '../modules/state.js';
import {
    onMounted, ref, watch
} from 'vue';

const convert = new Convert({
    fg: '#333',
    bg: '#F6F8FA',
    newline: true,
    escapeXML: true
});

const renderTree = () => {

    if (!state.$detail) {
        return;
    }

    const list = [];

    // suites
    let suite = state.caseItem.parent;
    while (suite) {
        list.push(suite);
        suite = suite.parent;
    }
    list.reverse();

    // case
    list.push(state.caseItem);

    // steps
    generateSteps(list, state.caseItem.steps);

    let left = 0;
    const ls = list.map((item) => {
        left = item.level * 10;
        const head = renderItemHead(item);
        const body = renderItemBody(item);

        const cls = ['mcr-item'];
        if (!item.level) {
            cls.push('mcr-item-root');
        }

        return `<div class="${cls.join(' ')}" style="margin-left:${left}px;">
                  ${head}
                  ${body}
                </div>`;
    });

    const $tree = state.$detail.querySelector('.mcr-tree');
    if ($tree) {
        $tree.innerHTML = ls.join('');
    }
};

const renderItemHead = (item) => {

    const cls = ['mcr-item-head', `mcr-item-${item.type}`, item.classMap];
    const className = cls.filter((it) => it).join(' ');

    const list = [];

    if (item.type === 'case') {
        list.push(Util.getIconOk(item));
    } else {
        list.push(Util.getIconType(item.type));
    }

    list.push(`<div class="mcr-item-title">${item.title}</div>`);

    if (item.location) {
        list.push(`<div class="mcr-item-location">${item.location}</div>`);
    }

    if (item.duration) {
        list.push(`<div class="mcr-item-duration">${Util.DTF(item.duration)}</div>`);
    }

    const head = list.join('');

    return `<div class="${className}">
              ${head}
            </div>`;
};

const renderItemBody = (item) => {

    const list = [];
    // columns maybe a tree
    generateItemColumns(list, item, state.columns);

    if (!list.length) {
        return '';
    }

    return `<div class="mcr-item-body">
                ${list.join('')}
            </div>`;
};

const generateItemColumns = (list, item, columns) => {

    columns.forEach((column) => {

        const result = renderItemColumn(item, column);
        if (result) {
            list.push(result);
        }

        if (Util.isList(column.subs)) {
            generateItemColumns(list, item, column.subs);
        }

    });

};

const renderItemColumn = (item, column) => {

    if (!column.name) {
        return;
    }

    const defaultHandler = {
        errors: renderItemErrors,
        logs: renderItemLogs,
        annotations: renderItemAnnotations,
        attachments: renderItemAttachments
    };

    const handler = defaultHandler[column.id];
    if (handler) {
        return handler(item, column);
    }

    // custom visitor column
    return renderItemCustom(item, column);

};

const renderItemCustom = (item, column) => {
    if (!column.visitor) {
        return;
    }

    let value = item[column.id];

    // do not show null value
    if (value === null || typeof value === 'undefined') {
        return;
    }

    // using grid formatter
    const formatter = formatters[column.formatter];
    if (formatter) {
        value = formatter(value, item, column);
    }

    return `<div class="mcr-item-column mcr-item-${column.id}">
                <div class="mcr-column-custom vui-flex-row">
                    <div class="mcr-column-head">${column.name}</div>
                    <div>${value}</div>
                </div> 
            </div>`;
};

const renderItemErrors = (item, column) => {
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

    return `<div class="mcr-item-column mcr-item-${column.id}">
                <a name="${column.id}"></a>
                <div class="mcr-column-head vui-flex-row">
                    <div class="mcr-icon mcr-icon-error"></div>
                    <div>${column.name}</div>
                </div>
                <p>${content}</p>
            </div>`;
};

const renderItemLogs = (item, column) => {
    const logs = item.logs;
    if (!Util.isList(logs)) {
        return;
    }

    const list = logs.map((log) => {
        return convertHtml(log);
    });

    const content = `<p>${list.join('')}</p>`;

    return `<div class="mcr-item-column mcr-item-${column.id}">
                <a name="${column.id}"></a>
                <div class="mcr-column-head vui-flex-row">
                    <div class="mcr-icon mcr-icon-log"></div>
                    <div>${column.name}</div>
                </div>
                ${content}
            </div>`;
};

const renderItemAnnotations = (item, column) => {
    const annotations = item.annotations;
    if (!Util.isList(annotations)) {
        return;
    }

    const list = annotations.map((annotation) => {
        if (!annotation.type) {
            return '';
        }
        // console.log(annotation);
        const ls = ['<div class="mcr-annotation-item">'];

        ls.push('<div class="mcr-annotation-head vui-flex-row">');
        ls.push(`<div class="mcr-icon mcr-icon-annotation" tooltip="${column.name}"></div>`);
        ls.push(`<div>${annotation.type}</div>`);
        ls.push('</div>');

        if (annotation.description) {
            ls.push(`<div class="markdown-body">${annotation.description}</div>`);
        }
        ls.push('</div>');
        return ls.join('');
    });

    const content = list.join('');
    if (!content) {
        return;
    }

    return `<div class="mcr-item-column mcr-item-annotations">
                <a name="${column.id}"></a>
                <div class="mcr-column-annotations">
                    ${content}
                </div>
            </div>`;
};

const renderItemAttachments = (item, column) => {
    const attachments = item.attachments;
    if (!Util.isList(attachments)) {
        return;
    }

    const list = attachments.map((attachment) => {
        console.log(attachment);

        // contentType 'application/json' 'image/png' 'video/webm'
        const contentType = attachment.contentType;
        if (contentType) {
            if (contentType.startsWith('image')) {
                return `<div class="mcr-item-attachment mcr-item-image">
                            <a href="${attachment.path}" target="_blank"><img src="${attachment.path}" alt="${attachment.name}" /></a>
                        </div>`;
            } else if (contentType.startsWith('video')) {
                return `<div class="mcr-item-attachment mcr-item-video">
                            <video controls height="350">
                                <source src="${attachment.path}" type="${contentType}">
                                <p>Here is a <a href="${attachment.path}" target="_blank">link to the ${attachment.name}</a> instead if your browser doesn't support HTML5 video.</p>
                            </video>
                        </div>`;
            }
        }

        return `<div class="mcr-item-attachment mcr-item-link">
                  <a href="${attachment.path}" target="_blank">${attachment.name}</a>
                </div>`;
    });

    const content = list.join('');

    return `<div class="mcr-item-column mcr-item-${column.id}">
                <a name="${column.id}"></a>
                <div class="mcr-column-head vui-flex-row">
                    <div class="mcr-icon mcr-icon-attachment"></div>
                    <div>${column.name}</div>
                </div>
                ${content}
            </div>`;

};

const generateSteps = (list, steps) => {
    if (!Util.isList(steps)) {
        return;
    }
    steps.forEach((item) => {
        list.push(item);
        generateSteps(list, item.subs);
    });
};

const convertHtml = (str) => {

    // link
    // const re = /(http[s]?:\/\/([\w-]+.)+([:\d+])?(\/[\w-./?%&=]*)?)/gi;
    // str = str.replace(re, function(a) {
    //     return `<a href="${a}" target="_blank">${a}</a>`;
    // });

    str = convert.toHtml(str);

    return str;
};

const positionHandler = (position) => {
    // console.log('position', position);

    clearTimeout(state.timeout_position);
    if (!state.$detail) {
        return;
    }

    // wait for rendered like image
    state.timeout_position = setTimeout(() => {
        renderPosition(position);
    }, 100);

};

const renderPosition = (position) => {
    if (position) {
        const elem = state.$detail.querySelector(`[name="${position}"]`);
        if (elem) {
            elem.scrollIntoView({
                behavior: 'smooth'
            });
            return;
        }
    }

    // reset to top
    state.$detail.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

};

const update = (caseItem, position) => {

    // console.log('update', caseItem, position);
    if (!caseItem) {
        return;
    }

    state.caseItem = caseItem;

    renderTree();

    positionHandler(position);

};

const el = ref(null);
onMounted(() => {
    state.$detail = el.value;
});

watch([
    () => state.caseItem,
    () => state.position
], () => {
    update(state.caseItem, state.position);
});

</script>
<style lang="scss">
.mcr-detail {
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
}

.mcr-tree {
    padding: 0 0 10px 10px;
}

.mcr-item {
    position: relative;
    border-bottom: thin solid #ccc;

    &::before {
        position: absolute;
        top: 8px;
        left: -10px;
        content: "";
        display: block;
        width: 10px;
        height: 20px;
        background-image: url("../images/level.svg");
        background-repeat: no-repeat;
        background-position: center center;
        background-size: 10px 20px;
        overflow: hidden;
    }

    &.mcr-item-root::before {
        left: 0;
        background-image: url("../images/root.svg");
    }
}

.mcr-item-head {
    padding: 8px 5px;

    &::after {
        content: "";
        display: block;
        clear: both;
    }

    > * {
        margin-left: 5px;
    }

    > *:first-child {
        margin-left: 0;
    }

    .mcr-icon,
    .mcr-item-title {
        float: left;
    }

    .mcr-item-duration {
        float: right;
    }

    .mcr-item-location {
        float: right;
        font-style: italic;
    }
}

.mcr-item-root .mcr-item-head {
    padding-left: 15px;
}

.tg-case-failed {
    border: none;
    background-color: var(--bg-failed);
}

.tg-case-flaky {
    border: none;
    background-color: var(--bg-flaky);
}

.tg-step-retry {
    color: orange;
}

.tg-step-error {
    color: red;
}

.mcr-item-suite .mcr-item-title {
    font-weight: bold;
}

.mcr-column-annotations {
    &::after {
        content: "";
        display: block;
        clear: both;
    }

    > div {
        float: left;
    }

    .mcr-column-head {
        margin-right: 10px;
    }
}

.mcr-item-body {
    > div:last-child {
        margin-bottom: 0;
        border-bottom: none;
    }

    .mcr-column-head {
        align-items: end;
        font-weight: bold;

        .mcr-icon {
            margin-right: 2px;

            ~ div {
                font-size: 16px;
            }
        }
    }
}

.mcr-item-column {
    padding: 10px;
    color: #333;
    border-bottom: thin solid #d7e0e4;
    background-color: #f6f8fa;
    overflow-x: auto;

    > p {
        font-family: Menlo, Consolas, monospace;
        line-height: initial;
        white-space: pre;
    }
}

.mcr-item-errors {
    background-color: var(--bg-failed);

    > .mcr-column-head {
        color: #d00;
    }
}

.mcr-column-custom .mcr-column-head {
    margin-right: 10px;
}

.mcr-annotation-item {
    margin-right: 10px;
    margin-bottom: 10px;
    font-weight: normal;

    .mcr-annotation-head {
        font-weight: bold;

        .mcr-icon {
            margin-right: 5px;
        }
    }

    .markdown-body {
        margin-top: 5px;
        padding: 5px;
    }
}

.mcr-item-attachment {
    padding: 5px 0;
}

.mcr-item-image {
    a {
        display: block;
    }

    img {
        display: block;
        max-height: 350px;
    }
}

.mcr-detail-head {
    padding: 10px;
    font-weight: bold;
    font-size: 16px;
    border-bottom: thin solid #ccc;
}

.mcr-detail-body {
    padding: 10px;
}

.mcr-error {
    overflow: auto;
}

</style>
