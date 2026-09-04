import Util from '../utils/util.js';
import state from './state.js';

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

const titleTagsFormatter = (rowItem, columnItem) => {
    const title = Util.quoteAttr(rowItem.title);

    if (columnItem && columnItem.titleTagsDisabled) {
        return title;
    }

    if (!Util.isTagItem(rowItem)) {
        return title;
    }

    const titleTags = [];
    let newTitle = title.replace(Util.tagPattern, function(all, before, key, after) {
        titleTags.push(`@${key}`);
        return getTag(key, before, after);
    });

    // new syntax in playwright v1.42
    if (rowItem.tags) {
        // remove tags which is already in title
        const tags = rowItem.tags.filter((it) => !titleTags.includes(it));
        const len = tags.length;
        if (len) {
            newTitle += tags.map((it, i) => {
                const key = `${it}`.slice(1);
                const before = i === 0;
                const after = i !== len - 1;
                return getTag(key, before, after);
            }).join('');
        }
    }

    return newTitle;
};

export {
    tagsFormatter,
    titleTagsFormatter
};
