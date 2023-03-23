import fuzzy from 'fuzzy';
import Util from '../utils/util.js';
import state from '../modules/state.js';

// level 1 { k: v }
const objectToStrSet = (obj) => {
    const st = new Set();
    Object.keys(obj).forEach((k) => {
        st.add(k);

        const v = obj[k];
        if (Util.isNull(v)) {
            return;
        }

        st.add(v);
    });
    return st;
};

// level 2 [ { k: v } ]
const arrayToStrSet = (list) => {
    const st = new Set();
    list.forEach((item) => {
        if (Util.isNull(item)) {
            return;
        }
        if (Array.isArray(item)) {
            arrayToStrSet(item).forEach((it) => {
                st.add(it);
            });
            return;
        }
        if (item && typeof item === 'object') {
            objectToStrSet(item).forEach((it) => {
                st.add(it);
            });
            return;
        }
        if (typeof item !== 'string') {
            st.add(String(item));
            return;
        }
        st.add(item);
    });
    return st;
};

const strSetToStr = (list) => {
    const st = new Set(list);
    return Array.from(st).join(' ');
};

const getSearchableValues = (rowItem, searchableKeys) => {

    if (rowItem.searchable_values) {
        return rowItem.searchable_values;
    }

    const searchableValues = {};

    searchableKeys.forEach((k) => {
        let v = rowItem[k];
        if (Util.isNull(v)) {
            return;
        }

        // array
        if (Array.isArray(v)) {
            v = strSetToStr(arrayToStrSet(v));
        } else if (v && typeof v === 'object') {
            v = strSetToStr(objectToStrSet(v));
        }

        // boolean number ...
        if (typeof v !== 'string') {
            v = String(v);
        }

        searchableValues[k] = v;

    });

    // console.log(searchableValues);

    rowItem.searchable_values = searchableValues;

    return searchableValues;
};

export default () => {

    const searchableKeys = state.searchableKeys;
    // console.log(searchableKeys);

    return (rowItem) => {

        const keywords = state.keywords;

        if (!keywords) {
            searchableKeys.forEach((k) => {
                rowItem[`${k}_matched`] = null;
            });
            return true;
        }

        const searchableValues = getSearchableValues(rowItem, searchableKeys);

        let hasMatched = false;
        Object.keys(searchableValues).forEach((k) => {
            let matched = null;
            const v = searchableValues[k];
            const res = fuzzy.match(keywords, v, {
                pre: '<b>',
                post: '</b>'
            });
            if (res) {
                // console.log(res);
                hasMatched = true;
                matched = res.rendered;
            }
            rowItem[`${k}_matched`] = matched;
        });

        if (hasMatched) {
            let row = rowItem;
            while (row.tg_parent) {
                row = row.tg_parent;
                row.collapsed = false;
            }
        }

        return hasMatched;
    };

};
