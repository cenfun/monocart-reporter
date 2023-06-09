import { createApp, h } from 'vue';
import { components } from 'vine-ui';

import { marked } from 'marked';

import IconLabel from '../components/icon-label.vue';
import Util from '../utils/util.js';
import state from '../modules/state.js';

const { VuiFlex } = components;

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

const annotationTypeFormatter = (list) => {
    const map = mergeAnnotations(list);
    return Object.keys(map).join(' ');
};

// ===========================================================================

const iconFormatter = (icon, size = '16px', button = false) => {
    const div = document.createElement('div');
    const props = {
        icon,
        size,
        button
    };
    createApp(IconLabel, props).mount(div);
    return div;
};

const titleFormatter = (value) => {
    const div = document.createElement('div');
    createApp({
        render() {
            return h(VuiFlex, {
                gap: '5px'
            }, {
                default: () => {
                    return [
                        h('div', null, value),
                        h(IconLabel, {
                            icon: 'arrow-down'
                        })
                    ];
                }
            });
        }
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

const markedOptions = {
    mangle: false,
    headerIds: false
};

const markdownFormatter = (str, inline) => {
    if (typeof str !== 'string') {
        return str;
    }
    if (inline) {
        return marked.parseInline(str, markedOptions);
    }
    return `<div class="markdown-body">${marked.parse(str, markedOptions)}</div>`;
};

// ===========================================================================

const tagFormatter = (item) => {
    const str = item.title;

    if (!Util.isTagItem(item)) {
        return str;
    }

    return str.replace(Util.tagPattern, function(all, before, key, after) {

        const cls = ['mcr-tag'];
        if (before) {
            cls.push('mcr-tag-before');
        }
        if (after) {
            cls.push('mcr-tag-after');
        }

        const list = [];
        list.push(`<span class="${cls.join(' ')}"`);

        // tag style
        const tag = state.tagMap[key];
        if (tag) {
            const { style, description } = tag;
            if (style) {
                list.push(` style="${Util.quoteAttr(Util.styleMap(style))}"`);
            }
            if (description) {
                list.push(` title="${Util.quoteAttr(description)}"`);
            }
        }

        list.push(`>${key}</span>`);

        return list.join('');
    });
};

// ===========================================================================

const formatters = {

    string: matchedFormatter,

    null: function(value) {
        if (value === null || typeof value === 'undefined') {
            return '';
        }
        return value;
    },

    header: function(value, rowItem, columnItem, cellNode) {
        if (columnItem.id === 'title') {
            return titleFormatter(value);
        }
        return value;
    },

    iconCaseType: function(value, rowItem, columnItem, cellNode) {
        if (!value) {
            return '';
        }
        return iconFormatter(value, '20px');
    },

    iconType: function(value, rowItem, columnItem, cellNode) {
        const icon = Util.getTypeIcon(rowItem.suiteType, value);
        if (!icon) {
            return '';
        }
        return iconFormatter(icon);
    },

    tree: function(value, rowItem, columnItem, cellNode) {
        let formattedValue = matchedFormatter(value, rowItem, columnItem);
        if (formattedValue === value) {
            formattedValue = tagFormatter(rowItem);
        }
        const defaultFormatter = this.getDefaultFormatter('tree');

        if (rowItem.type === 'suite' && rowItem.caseNum) {
            // add case number for suite
            formattedValue = `${formattedValue} <span class="mcr-num">${Util.NF(rowItem.caseNum)}</span>`;
        } else if (rowItem.type === 'case') {
            // add open icon for case
            formattedValue = `<div class="tg-cell-open">${formattedValue}</div>`;
        } else if (rowItem.type === 'step' && rowItem.count) {
            // add count number for step
            formattedValue = `${formattedValue} <span class="mcr-num mcr-count">${Util.NF(rowItem.count)}</span>`;
        }
        return defaultFormatter(formattedValue, rowItem, columnItem, cellNode);
    },

    duration: function(value) {
        if (typeof value !== 'number') {
            return '';
        }
        // using same unit ms
        return Util.TF(value);
    },

    // array or string
    annotations: function(value, rowItem, columnItem) {
        if (!value) {
            return '';
        }
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
        if (rowItem.errorNum) {
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
    mergeAnnotations
};
