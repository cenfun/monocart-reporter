import { createApp, h } from 'vue';
import {
    VuiFlex,
    VuiIconLabel
} from 'vine-ui';

import { marked } from 'marked';

import Util from '../utils/util.js';
import state from '../modules/state.js';


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
    createApp(VuiIconLabel, props).mount(div);
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
                        h(VuiIconLabel, {
                            icon: 'drop-down',
                            button: true
                        })
                    ];
                }
            });
        }
    }).mount(div);
    return div;
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

const getTag = (key, before, after) => {
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
            list.push(` tooltip="${Util.quoteAttr(description)}"`);
        }
    }

    list.push(`>${key}</span>`);

    return list.join('');
};

const tagsFormatter = (tags) => {
    const list = [];
    if (Util.isList(tags)) {
        const len = tags.length;
        tags.forEach((tag, i) => {
            const key = `${tag}`.slice(1);
            const before = i === 0;
            const after = i !== len - 1;
            list.push(getTag(key, before, after));
        });
    }
    return list.join('');
};

const titleTagsFormatter = (rowItem, columnItem, titleTagsSplit) => {
    const title = Util.quoteAttr(rowItem.title);

    if (!Util.isTagItem(rowItem)) {
        return title;
    }

    const titleTags = [];
    const newTitle = title.replace(Util.tagPattern, function(all, before, key, after) {
        titleTags.push(`@${key}`);
        return getTag(key, before, after);
    });

    // new syntax in playwright v1.42
    let tags = [];
    let newTags = '';
    if (rowItem.tags) {
        // remove tags which is already in title
        tags = rowItem.tags.filter((it) => !titleTags.includes(it));
        const len = tags.length;
        if (len) {
            newTags = tags.map((it, i) => {
                const key = `${it}`.slice(1);
                const before = i === 0;
                const after = i !== len - 1;
                return getTag(key, before, after);
            }).join('');
        }
    }

    const titleStr = Util.quoteAttr([rowItem.title, ... tags].join(' '));
    if (columnItem && columnItem.titleTagsDisabled) {
        return `<span data-title="${titleStr}">${newTitle}</span>`;
    }
    if (titleTagsSplit && newTags) {
        return `<div class="mcr-title-tags-split" data-title="${titleStr}"><div class="mcr-title-tags-split-title">${newTitle}</div><div class="mcr-tag mcr-title-tags-split-tags-box">@</div><div class="mcr-title-tags-split-tags-list">${newTags}</div></div>`;
    }
    return `<span data-title="${titleStr}">${newTitle}${newTags}</span>`;
};

const setTitleTagsSplitCompact = (container, compact) => {
    if (compact) {
        container.classList.add('mcr-title-tags-split-compact');
    } else {
        container.classList.remove('mcr-title-tags-split-compact');
    }
};

const updateTitleTagsSplit = (container) => {
    requestAnimationFrame(() => {
        if (!container.isConnected) {
            return;
        }
        const title = container.querySelector('.mcr-title-tags-split-title');
        const tagsList = container.querySelector('.mcr-title-tags-split-tags-list');
        const tags = Array.from(tagsList.querySelectorAll('.mcr-tag'));
        const tagsBox = container.querySelector('.mcr-title-tags-split-tags-box');

        const tagsListWidth = container.mcrTagsListWidth || tagsList.offsetWidth;
        if (tagsListWidth) {
            container.mcrTagsListWidth = tagsListWidth;
        }
        const compact = title.scrollWidth + tagsListWidth > container.clientWidth;
        setTitleTagsSplitCompact(container, compact);
        if (!compact || tagsBox.style.background) {
            return;
        }

        tagsBox.style.cssText = tags[0].style.cssText;
        const backgrounds = tags.slice(0, 4).map((tag) => getComputedStyle(tag).backgroundColor);
        while (backgrounds.length < 3) {
            backgrounds.splice(0, 0, backgrounds[0]);
        }
        if (backgrounds.length < 4) {
            backgrounds.push(backgrounds.at(-1));
        }
        tagsBox.style.background = `conic-gradient(${backgrounds[1]} 0 25%, ${backgrounds[3]} 0 50%, ${backgrounds[2]} 0 75%, ${backgrounds[0]} 0)`;
    });
};

const observeTitleTagsSplit = (cellNode) => {
    requestAnimationFrame(() => {
        const container = cellNode.querySelector('.mcr-title-tags-split');
        if (!container) {
            return;
        }
        updateTitleTagsSplit(container);

        const resizeObserver = new ResizeObserver(() => updateTitleTagsSplit(container));
        resizeObserver.observe(container);
        const intersectionObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                updateTitleTagsSplit(container);
            }
        });
        intersectionObserver.observe(container);
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
        let formattedValue = titleTagsFormatter(rowItem, columnItem, true);
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
        const formatted = defaultFormatter(formattedValue, rowItem, columnItem, cellNode);
        observeTitleTagsSplit(cellNode);
        return formatted;
    },

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
    titleTagsFormatter,
    markdownFormatter,
    mergeAnnotations
};
