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
    newline: true
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
        if (item.classMap) {
            cls.push(item.classMap);
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

    const cls = ['mcr-item-head', `mcr-item-${item.type}`, 'vui-flex-row'];

    const list = [];
    if (item.level) {
        list.push('<div class="mcr-item-next">└</div>');
    }

    if (item.type === 'case') {
        list.push(Util.getCaseIcon(item));
    }

    list.push(`<div class="mcr-item-title">${item.title}</div>`);
    list.push('<div class="vui-flex-auto"></div>');

    if (item.duration) {
        list.push(`<div class="mcr-item-duration">${Util.DTF(item.duration)}</div>`);
    }
    if (item.location) {
        list.push(`<div class="mcr-item-location">${item.location}</div>`);
    }
    const head = list.join('');

    return `<div class="${cls.join(' ')}">
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
        annotations: renderItemAnnotations,
        errors: renderItemErrors,
        logs: renderItemLogs,
        attachments: renderItemAttachments
    };

    let handler = defaultHandler[column.id];
    if (!handler && column.visitor) {
        // custom visitor column
        handler = renderItemCustom;
    }

    if (!handler) {
        return;
    }

    const content = handler(item, column);
    if (!content) {
        return;
    }

    let anchor = '';
    if (item.type === 'case') {
        anchor = `<a name="${column.id}"></a>`;
    }

    return `<div class="mcr-item-column mcr-item-${column.id}">
                ${anchor}
                <h3># ${column.name}</h3> 
                ${content}
            </div>`;
};

const renderItemCustom = (item, column) => {
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

    return value;
};

const renderItemAnnotations = (item) => {
    const annotations = item.annotations;
    if (!Util.isList(annotations)) {
        return;
    }

    const list = annotations.map((annotation) => {
        if (!annotation.type) {
            return '';
        }
        // console.log(annotation);
        const ls = ['<div class="mcr-item-annotation">'];
        ls.push(`<h3>${annotation.type}</h3>`);
        if (annotation.description) {
            ls.push(`<div class="markdown-body">${annotation.description}</div>`);
        }
        ls.push('</div>');
        return ls.join('');
    });

    return list.join('');
};

const renderItemErrors = (item) => {
    const errors = item.errors;
    if (!Util.isList(errors)) {
        return;
    }

    const list = errors.map((err) => {
        return convertHtml(err);
    });

    return `<p>${list.join('')}</p>`;
};

const renderItemLogs = (item) => {
    const logs = item.logs;
    if (!Util.isList(logs)) {
        return;
    }

    const list = logs.map((log) => {
        return convertHtml(log);
    });

    return `<p>${list.join('')}</p>`;
};

const renderItemAttachments = (item) => {
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

    return list.join('');
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
    border-bottom: thin solid #ccc;
}

.mcr-item-head {
    padding: 8px 10px 8px 0;
    overflow-x: auto;
    white-space: nowrap;

    > * {
        margin-left: 5px;
    }

    > *:first-child {
        margin-left: 0;
    }
}

.tg-case-failed {
    background-color: var(--bg-failed);
    border: none;
}

.tg-case-flaky {
    background-color: var(--bg-flaky);
    border: none;
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

.mcr-item-location {
    font-size: 12px;
}

.mcr-item-body {
    padding: 0 10px 10px;

    > *:last-child {
        margin-bottom: 0;
    }

    h3 {
        padding: 5px 0;
        margin: 0;
    }
}

.mcr-item-column {
    background-color: #f6f8fa;
    color: #333;
    padding: 10px;
    border-radius: 5px;
    margin-bottom: 10px;
    overflow-x: auto;

    > p {
        white-space: pre;
        font-family: Menlo, Consolas, monospace;
        line-height: initial;
    }
}

.mcr-item-errors > h3 {
    color: red;
}

.mcr-item-annotation {
    .markdown-body {
        padding: 5px;
        border-radius: 5px;
    }
}

.mcr-item-attachment {
    margin-bottom: 5px;
}

.mcr-item-image {
    a {
        display: block;
    }

    img {
        max-height: 350px;
        display: block;
    }
}

.mcr-detail-head {
    font-size: 16px;
    font-weight: bold;
    border-bottom: thin solid #ccc;
    padding: 10px;
}

.mcr-detail-body {
    padding: 10px;
}

.mcr-error {
    overflow: auto;
}

</style>
