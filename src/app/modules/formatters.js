import {
    createApp, h, nextTick
} from 'vue';
import { VuiIconLabel } from 'vine-ui';

import { marked } from 'marked';

import Util from '../utils/util.js';
import state from '../modules/state.js';
import { tagsFormatter } from './title-tags.js';

import GridTitleCell from '../components/grid/grid-title-cell.vue';


// ===========================================================================

const createGridTitleCell = (rowItem, columnItem, cellNode) => {
    const container = cellNode.querySelector('.tg-tree-name');

    if (container) {
        createApp({
            render() {
                return h(GridTitleCell, {
                    rowItem,
                    columnItem
                });
            }
        }).mount(container);
    }
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

const iconFormatter = (options) => {
    const div = document.createElement('div');
    const props = {
        icon: '',
        size: '16px',
        button: false,
        ... options
    };
    const vm = createApp(VuiIconLabel, props).mount(div);
    return vm.$el;
};

// ===========================================================================
// markdown html

// add target="_blank" for link
const renderer = new marked.Renderer();
renderer.link = function(token) {
    return `<a href="${token.href}" target="_blank">${token.text}</a>`;
};

renderer.code = function(token) {
    // console.log(state.mermaid, token);
    if (state.mermaid && token.lang === 'mermaid') {
        state.mermaidEnabled = true;
        return `<pre class="mermaid">${token.text}</pre>`;
    }
    const html = marked.Renderer.prototype.code.apply(this, arguments);
    return html;
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

const formatters = {

    null: function(value) {
        if (value === null || typeof value === 'undefined') {
            return '';
        }
        return value;
    },

    iconCaseType: function(value, rowItem, columnItem, cellNode) {
        if (!value) {
            return '';
        }
        return iconFormatter({
            icon: value,
            size: '20px'
        });
    },

    iconType: function(value, rowItem, columnItem, cellNode) {
        const icon = Util.getTypeIcon(rowItem.suiteType, value);
        if (!icon) {
            return '';
        }
        return iconFormatter({
            icon,
            tooltip: icon
        });
    },

    tree: function(value, rowItem, columnItem, cellNode) {

        nextTick(() => {
            createGridTitleCell(rowItem, columnItem, cellNode);
        });

        const defaultFormatter = this.getDefaultFormatter('tree');
        // async create vue component
        // tg-tree-name
        return defaultFormatter('', rowItem, columnItem, cellNode);
    },

    // Formats tags for a standalone custom column configured with formatter: 'tags'.
    tags: function(value, rowItem, columnItem, cellNode) {
        return tagsFormatter(value);
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
        let formattedValue;
        if (Util.isList(value)) {
            // only show type in grid
            formattedValue = annotationTypeFormatter(value);
        } else {
            formattedValue = markdownFormatter(value, true);
        }
        if (formattedValue) {
            return `<span class="mcr-clickable">${formattedValue}</span>`;
        }
        return '';
    },

    errors: function(value, rowItem) {
        if (rowItem.errorNum) {
            return iconFormatter({
                icon: 'error',
                color: 'var(--color-failed)',
                button: true
            });
        }
        return '';
    },

    logs: function(value, rowItem) {
        if (!value) {
            return '';
        }
        return iconFormatter({
            icon: 'log',
            button: true
        });
    },

    attachments: function(value, rowItem) {
        if (!value) {
            return '';
        }
        return iconFormatter({
            icon: 'attachment',
            button: true
        });
    }

};


export {
    formatters,
    markdownFormatter,
    mergeAnnotations
};
