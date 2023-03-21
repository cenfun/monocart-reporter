import { createApp } from 'vue';
import { marked } from 'marked';

import IconLabel from '../components/icon-label.vue';
import Util from '../utils/util.js';
import state from '../modules/state.js';

const matchedFormatter = function(value, rowItem, columnItem) {
    const id = columnItem.id;
    const matched = rowItem[`${id}_matched`];
    if (matched) {
        return matched;
    }
    return value;
};

// ===========================================================================

const mergeAnnotations = (list) => {
    const map = {};
    list.forEach((item) => {
        const { type, description } = item;
        if (!type) {
            return;
        }

        if (!map[type]) {
            map[type] = [];
        }

        if (description) {
            if (Array.isArray(description)) {
                map[type] = map[type].concat(description);
            } else {
                map[type].push(description);
            }
        }

    });
    return map;
};

// for row filter, must be list
const annotationSearchFormatter = (list) => {
    const map = mergeAnnotations(list);
    return Object.keys(map).map((k) => [k, map[k].join(' ')].join(' ')).join(' ');
};

const annotationTypeFormatter = (list) => {
    const map = mergeAnnotations(list);
    return Object.keys(map).join(' ');
};

// ===========================================================================

const iconFormatter = (icon, size = '16px', button = false) => {
    const div = document.createElement('div');
    createApp(IconLabel, {
        icon,
        size,
        button
    }).mount(div);
    return div;
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

const markdownFormatter = (str, inline) => {
    if (typeof str !== 'string') {
        return str;
    }
    if (inline) {
        return marked.parseInline(str);
    }
    return `<div class="markdown-body">${marked.parse(str)}</div>`;
};

// ===========================================================================

const tagPattern = /@([^@\s]+)/g;
const tagFormatter = (str) => {
    return str.replace(tagPattern, function(match, key) {
        let style = '';
        const tag = state.tagMap[key];
        if (tag && tag.style) {
            style = Util.styleMap(tag.style);
        }
        return `<span class="mcr-tag" style="${style}">${key}</span>`;
    });
};

// ===========================================================================

const formatters = {

    null: function(value) {
        if (value === null || typeof value === 'undefined') {
            return '';
        }
        return value;
    },

    iconOk: function(value, rowItem, columnItem, cellNode) {
        if (!rowItem.caseType) {
            return '';
        }
        return iconFormatter(rowItem.caseType, '20px');
    },

    iconType: function(value, rowItem, columnItem, cellNode) {
        const types = {
            suite: 'suite',
            case: 'case',
            step: 'step'
        };
        const icon = types[value];
        if (!icon) {
            return '';
        }
        return iconFormatter(icon);
    },

    string: matchedFormatter,

    tree: function(value, rowItem, columnItem, cellNode) {
        let formattedValue = matchedFormatter(value, rowItem, columnItem);
        if (formattedValue === value) {
            formattedValue = tagFormatter(value);
        }
        const defaultFormatter = this.getDefaultFormatter('tree');
        if (rowItem.type === 'suite') {
            formattedValue = `${formattedValue} <span class="mcr-num">${Util.NF(rowItem.tests)}</span>`;
        } else if (rowItem.type === 'case') {
            formattedValue = `${formattedValue} <div class="tg-cell-hover-icon tg-flyover-icon">
                <div class="mcr-icon mcr-icon-open" />
            </div>`;
        }
        return defaultFormatter(formattedValue, rowItem, columnItem, cellNode);
    },

    duration: function(value) {
        if (typeof value !== 'number') {
            return '';
        }
        // using same unit ms
        return `${Util.NF(value)} ms`;
    },

    annotations: function(value, rowItem, columnItem) {

        let formattedValue = matchedFormatter(value, rowItem, columnItem);
        if (formattedValue === value) {
            if (Util.isList(value)) {
                // only show type in grid
                formattedValue = annotationTypeFormatter(value);
            } else {
                formattedValue = markdownFormatter(value, true);
            }
        }
        if (formattedValue) {
            return `<span class="mcr-clickable">${formattedValue}</span>`;
        }
        return '';
    },

    errors: function(value, rowItem) {
        if (rowItem.hasErrors) {
            return iconFormatter('error', '20px', true);
        }
        return '';
    },

    logs: function(value, rowItem) {
        if (!value) {
            return '';
        }
        return iconFormatter('log', '20px', true);
    },

    attachments: function(value, rowItem) {
        if (!value) {
            return '';
        }
        return iconFormatter('attachment', '20px', true);
    }

};


export {
    formatters,
    tagFormatter,
    matchedFormatter,
    markdownFormatter,
    mergeAnnotations,
    annotationSearchFormatter
};
