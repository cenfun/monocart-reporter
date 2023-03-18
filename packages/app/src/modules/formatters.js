import { createApp } from 'vue';
import { marked } from 'marked';

import IconLabel from '../components/icon-label.vue';
import Util from '../utils/util.js';


const matchedFormatter = function(value, rowItem, columnItem) {
    const id = columnItem.id;
    const matched = rowItem[`${id}_matched`];
    if (matched) {
        return matched;
    }
    return value;
};

// for row filter, must be list
const annotationSearchFormatter = (list) => {
    return list.map((it) => Object.values(it).join(' ')).filter((it) => it).join(' ');
};

const annotationTypeFormatter = (list) => {
    return list.map((it) => it.type).filter((it) => it).join(' ');
};

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

const formatters = {

    null: function(value) {
        if (value === null || typeof value === 'undefined') {
            return '';
        }
        return value;
    },

    iconOk: function(value, rowItem, columnItem, cellNode) {
        if (typeof value !== 'boolean') {
            return '';
        }
        return iconFormatter(rowItem.okIcon, '20px');
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
        value = matchedFormatter(value, rowItem, columnItem);

        const defaultFormatter = this.getDefaultFormatter('tree');
        if (rowItem.type === 'suite') {
            value = `${value} (${rowItem.tests})`;
        } else if (rowItem.type === 'case') {
            value = `${value} <div class="tg-cell-hover-icon tg-flyover-icon">
                <div class="mcr-icon mcr-icon-open" />
            </div>`;
        }
        return defaultFormatter(value, rowItem, columnItem, cellNode);
    },

    duration: function(value) {
        if (typeof value !== 'number') {
            return '';
        }
        return Util.DTF(value);
    },

    annotations: function(value, rowItem, columnItem) {

        let formattedValue = matchedFormatter(value, rowItem, columnItem);
        if (formattedValue === value) {
            if (Util.isList(value)) {
                // only show type in grid
                formattedValue = annotationTypeFormatter(value);
            } else if (columnItem.markdown) {
                formattedValue = markdownFormatter(value, true);
            }
        }
        if (formattedValue) {
            return `<span class="mcr-clickable">${formattedValue}</span>`;
        }
        return '';
    },

    errors: function(value, rowItem) {
        if (!value) {
            return '';
        }
        return iconFormatter('error', '20px', true);
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
    matchedFormatter,
    markdownFormatter,
    annotationSearchFormatter
};
