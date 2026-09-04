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
        const keys = Util.getTagKeys(tags);
        const len = keys.length;
        keys.forEach((key, i) => {
            const before = i === 0;
            const after = i !== len - 1;
            list.push(getTag(key, before, after));
        });
    }
    return list.join('');
};

export { tagsFormatter };
