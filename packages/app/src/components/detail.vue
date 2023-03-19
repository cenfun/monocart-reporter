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
          padding="5px"
          wrap
        >
          <VuiFlex gap="5px">
            <IconLabel
              v-if="item.data.okIcon"
              :icon="item.data.okIcon"
              size="20px"
              :button="false"
            />
            <IconLabel
              v-else
              :icon="item.icon"
              :button="false"
            />
            <div
              class="mcr-item-title"
              v-html="tagFormatter(item.data.title)"
            />
          </VuiFlex>

          <template v-if="item.simpleColumns">
            <VuiFlex
              v-for="column in item.simpleColumns"
              :key="column.key"
              gap="5px"
              wrap
              class="mcr-column-simple"
            >
              <div class="mcr-column-head">
                {{ column.data.name }}
              </div>
              <div v-html="column.content" />
            </VuiFlex>
          </template>


          <div class="vui-flex-auto" />

          <div
            v-if="Util.isNum(item.data.duration)"
            class="mcr-item-duration"
          >
            {{ Util.DTF(item.data.duration) }}
          </div>

          <div
            v-if="item.data.location"
            class="mcr-item-location"
          >
            {{ item.data.location }}
          </div>
        </VuiFlex>
        <div
          v-if="item.detailColumns"
          class="mcr-item-body"
        >
          <div
            v-for="column in item.detailColumns"
            :key="column.key"
            :class="itemColumnClass(column.data)"
          >
            <div class="mcr-column-anchor">
              <a :name="column.data.id" />
            </div>
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

import Util from '../utils/util.js';
import state from '../modules/state.js';
import {
    tagFormatter, markdownFormatter, mergeAnnotations
} from '../modules/formatters.js';

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

    const res = handler(item, column);
    if (res) {
        res.data = column;
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
            content: `<div class="mcr-column-annotation">${markdownFormatter(annotations, true)}</div>`
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
        return `<div class="mcr-column-annotation">${res.join('')}</div>`;
    });
    // console.log(list);

    const content = list.join('');
    if (!content) {
        return;
    }

    return {
        icon: 'annotation',
        content
    };
};

const getAttachments = (item, column) => {
    const attachments = item.attachments;
    if (!Util.isList(attachments)) {
        return;
    }

    const list = attachments.map((attachment) => {
        // console.log(attachment);

        // contentType 'application/json' 'image/png' 'video/webm'
        const contentType = attachment.contentType;
        if (contentType) {

            if (contentType.startsWith('image')) {
                return `<div class="mcr-item-attachment mcr-item-image">
                            <a href="${attachment.path}" target="_blank"><img src="${attachment.path}" alt="${attachment.name}" /></a>
                        </div>`;
            }

            if (contentType.startsWith('video')) {
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

// ===========================================================================

const getSteps = (list, steps) => {
    if (!Util.isList(steps)) {
        return;
    }
    steps.forEach((item) => {
        list.push(item);
        getSteps(list, item.subs);
    });
};

const positionHandler = (position) => {
    // console.log('position', position);

    clearTimeout(state.timeout_position);

    // wait for rendered like image
    state.timeout_position = setTimeout(() => {
        updatePosition(position);
    }, 100);

};

const updatePosition = (position) => {

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
    getSteps(list, caseItem.steps);

    data.list = list.map((item) => {

        let simpleColumns;
        let detailColumns;
        const allColumns = [];
        getColumns(allColumns, item, state.columns);

        if (allColumns.length) {
            allColumns.forEach((c) => {
                c.key = Math.random().toString().slice(2);
                if (c.simple) {
                    if (!simpleColumns) {
                        simpleColumns = [];
                    }
                    simpleColumns.push(c);
                } else {
                    if (!detailColumns) {
                        detailColumns = [];
                    }
                    detailColumns.push(c);
                }
            });
        }

        const left = item.level * 13;

        return {
            data: item,
            key: Math.random().toString().slice(2),
            style: `margin-left:${left}px;`,
            icon: item.type,
            simpleColumns,
            detailColumns
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
    padding: 0 0 5px 5px;
}

.mcr-item {
    position: relative;
    border-bottom: thin solid #ccc;
    border-left: thin solid #ccc;
}

.mcr-item-head {
    min-height: 35px;

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

    .mcr-item-location {
        font-size: 13px;
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
    position: relative;
    padding: 5px;
    color: #333;
    border-top: thin dashed #eee;
    overflow-x: auto;
}

.mcr-column-simple {
    padding: 3px 8px;
    font-size: 13px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background-color: #f6f8fa;
}

.mcr-item-body {
    .mcr-column-head {
        font-weight: bold;
    }
}

.mcr-column-anchor {
    position: absolute;
    top: 0;
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

.mcr-column-content {
    padding: 5px;
}

.mcr-item-errors,
.mcr-item-logs {
    .mcr-column-content {
        margin-top: 5px;
        font-family: var(--font-monospace);
        white-space: pre;
    }
}

.mcr-item-annotations {
    background-color: #f6f8fa;

    .mcr-column-content {
        display: flex;
        flex-direction: column;
        gap: 5px;
        margin-top: 5px;
        padding: 10px;
        border-radius: 5px;
        background-color: #fff;

        .mcr-column-annotation {
            display: flex;
            flex-flow: row wrap;
            gap: 10px;
        }
    }
}

.mcr-item-attachment {
    padding: 5px;
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
