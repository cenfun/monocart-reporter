<template>
  <div
    ref="el"
    class="mcr-detail"
  >
    <div class="mcr-tree">
      <div
        v-for="item in data.list"
        :key="item.key"
        :class="itemClass(item.data)"
        :style="item.style"
      >
        <VuiFlex
          :class="itemHeadClass(item.data)"
          gap="10px"
          padding="8px 5px"
          wrap
        >
          <VuiFlex :gap="item.gap">
            <IconLabel
              :icon="item.icon"
              :size="item.size"
              :button="false"
            />
            <div class="mcr-item-title">
              {{ item.data.title }}
            </div>
          </VuiFlex>

          <div class="vui-flex-auto" />
          <div
            v-if="item.data.location"
            class="mcr-item-location"
          >
            {{ item.data.location }}
          </div>
          <div
            v-if="Util.isNum(item.data.duration)"
            class="mcr-item-duration"
          >
            {{ Util.DTF(item.data.duration) }}
          </div>
        </VuiFlex>
        <div
          v-if="item.columns"
          class="mcr-item-body"
        >
          <div
            v-for="column in item.columns"
            :key="column.key"
            :class="itemColumnClass(column.data)"
          >
            <a :name="column.data.id" />

            <template v-if="column.custom">
              <VuiFlex
                gap="5px"
                wrap
              >
                <div class="mcr-column-head">
                  {{ column.data.name }}
                </div>
                <div v-html="column.content" />
              </VuiFlex>
            </template>
            <template v-else>
              <IconLabel
                :icon="column.icon"
                size="20px"
                :button="false"
                class="mcr-column-head"
              >
                {{ column.data.name }}
              </IconLabel>
              <div
                class="mcr-column-content"
                v-html="column.content"
              />
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import {
    ref, watch, shallowReactive
} from 'vue';
import { components } from 'vine-ui';

import 'github-markdown-css/github-markdown-light.css';

import Convert from 'ansi-to-html';
import { marked } from 'marked';

import Util from '../utils/util.js';
import state from '../modules/state.js';

import IconLabel from './icon-label.vue';

const { VuiFlex } = components;

const data = shallowReactive({
    list: []
});

const el = ref(null);

const itemClass = (item) => {
    const cls = ['mcr-item'];
    if (!item.level) {
        cls.push('mcr-item-root');
    }
    return cls;
};

const itemHeadClass = (item) => {
    return ['mcr-item-head', `mcr-item-${item.type}`, item.classMap];
};

const itemColumnClass = (item) => {
    return ['mcr-item-column', `mcr-item-${item.id}`];
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
// annotations markdown html

// add target="_blank" for link
const renderer = new marked.Renderer();
renderer.link = function(href, title, text) {
    const link = marked.Renderer.prototype.link.apply(this, arguments);
    return link.replace('<a', '<a target="_blank"');
};
marked.setOptions({
    renderer: renderer
});

const markdownParse = (str) => {
    const html = marked.parse(str);
    if (html) {
        return `<div class="markdown-body">${html}</div>`;
    }
    return str;
};

// ===========================================================================

const generateItemColumns = (list, item, columns) => {

    columns.forEach((column) => {

        const result = generateItemColumn(item, column);
        if (result) {
            list.push(result);
        }

        if (Util.isList(column.subs)) {
            generateItemColumns(list, item, column.subs);
        }

    });

};

const generateItemColumn = (item, column) => {

    if (!column.name) {
        return;
    }

    const defaultHandler = {
        errors: renderItemErrors,
        logs: renderItemLogs,
        annotations: renderItemAnnotations,
        attachments: renderItemAttachments
    };

    const handler = defaultHandler[column.id] || renderItemCustom;

    const res = handler(item, column);
    if (res) {
        res.data = column;
    }

    return res;
};

// ===========================================================================

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

    return {
        icon: 'error',
        content
    };
};

const renderItemLogs = (item, column) => {
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

const renderItemAnnotations = (item, column) => {
    let annotations = item.annotations;
    if (!annotations) {
        return;
    }

    // string
    if (!Util.isList(annotations)) {
        annotations = [{
            description: annotations
        }];
    }

    const list = annotations.map((annotation) => {

        if (column.markdown) {
            const ls = Object.keys(annotation).filter((k) => annotation[k]).map((k) => {
                if (k === 'type') {
                    return `> ${annotation[k]}`;
                }
                return annotation[k];
            });
            if (ls.length) {
                return markdownParse(ls.join('\r\n'));
            }
            return '';
        }

        const ls = Object.values(annotation).filter((v) => v);
        if (ls.length) {
            return `<p>${ls.join('</p><p>')}</p>`;
        }

        return '';
    });

    const content = list.join('');
    if (!content) {
        return;
    }

    return {
        icon: 'annotation',
        content
    };
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
    if (!content) {
        return;
    }

    return {
        icon: 'attachment',
        content
    };
};

// ===========================================================================

const renderItemCustom = (item, column) => {

    // not detailed default columns here
    // must be boolean false not undefined
    if (column.detailed === false) {
        return;
    }

    let value = item[column.id];

    // do not show null value
    if (value === null || typeof value === 'undefined') {
        return;
    }

    if (typeof column.formatter === 'function') {
        value = column.formatter(value, item, column);
    }

    // if markdown is true
    const content = column.markdown ? markdownParse(value) : `<div>${value}</div>`;

    return {
        custom: true,
        content
    };
};

// ===========================================================================

const generateSteps = (list, steps) => {
    if (!Util.isList(steps)) {
        return;
    }
    steps.forEach((item) => {
        list.push(item);
        generateSteps(list, item.subs);
    });
};

const positionHandler = (position) => {
    // console.log('position', position);

    clearTimeout(state.timeout_position);

    // wait for rendered like image
    state.timeout_position = setTimeout(() => {
        renderPosition(position);
    }, 100);

};

const renderPosition = (position) => {

    const $el = el.value;
    if (!$el) {
        return;
    }

    if (position) {
        const elem = $el.querySelector(`[name="${position}"]`);
        if (elem) {
            elem.scrollIntoView({
                behavior: 'smooth'
            });
            return;
        }
    }

    // reset to top
    $el.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

};

const initDataList = (caseItem) => {

    const list = [];

    // suites
    let suite = caseItem.parent;
    while (suite) {
        list.push(suite);
        suite = suite.parent;
    }
    list.reverse();

    // case
    list.push(caseItem);

    // steps
    generateSteps(list, caseItem.steps);

    data.list = list.map((item) => {

        let columns = [];
        generateItemColumns(columns, item, state.columns);

        if (columns.length) {
            columns.forEach((c) => {
                c.key = Math.random().toString().slice(2);
            });
        } else {
            columns = null;
        }

        const left = item.level * 15;

        return {
            data: item,
            key: Math.random().toString().slice(2),
            style: `margin-left:${left}px;`,
            icon: item.okIcon || item.type,
            size: item.okIcon ? '20px' : '16px',
            gap: item.type === 'step' ? '0' : '5px',
            columns
        };
    });

};

const update = (caseItem, position) => {

    // console.log('update', caseItem, position);
    if (!caseItem) {
        return;
    }

    state.caseItem = caseItem;

    initDataList(caseItem);

    positionHandler(position);

};

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
    border-left: thin solid #ccc;
}

.mcr-item-head {
    .mcr-item-location {
        font-style: italic;
        opacity: 0.6;
    }
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

.mcr-item-suite {
    .mcr-item-title {
        font-weight: bold;
    }
}

.mcr-item-column {
    padding: 8px 5px;
    color: #333;
    border-top: thin dashed #d7e0e4;
    overflow-x: auto;
}

.mcr-item-body {
    .mcr-column-head {
        font-weight: bold;
    }
}

.mcr-item-logs {
    background-color: #fcfcfc;
}

.mcr-item-errors {
    background-color: var(--bg-failed);

    .mcr-column-head {
        color: #d00;
    }
}

.mcr-item-errors,
.mcr-item-logs {
    .mcr-column-content {
        padding: 5px;
        font-family: Menlo, Consolas, monospace;
        line-height: initial;
        white-space: pre;
    }
}

.markdown-body {
    padding: 5px;
    border-radius: 5px;
}

.mcr-item-annotations {
    background-color: #f6f8fa;

    .markdown-body {
        margin-top: 5px;
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

</style>
