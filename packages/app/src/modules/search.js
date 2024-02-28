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

const getSearchableValues = (rowItem, searchableAllKeys, searchableKeys) => {

    if (rowItem.searchable_values) {
        return rowItem.searchable_values.filter((item) => searchableKeys.includes(item.id));
    }

    const searchableValues = [];

    searchableAllKeys.forEach((id) => {
        let value = rowItem[id];
        if (Util.isNull(value)) {
            return;
        }

        // array
        if (Array.isArray(value)) {
            value = strSetToStr(arrayToStrSet(value));
        } else if (value && typeof v === 'object') {
            value = strSetToStr(objectToStrSet(value));
        }

        // boolean number ...
        if (typeof value !== 'string') {
            value = String(value);
        }

        // new syntax in playwright v1.42
        if (id === 'title' && rowItem.tags) {
            // remove repeated tag in title
            const list = rowItem.tags.filter((it) => !value.includes(it));
            list.unshift(value);
            value = list.join(' ');
        }

        searchableValues.push({
            id,
            value
        });

    });

    // console.log(searchableValues);

    rowItem.searchable_values = searchableValues;

    return searchableValues.filter((item) => searchableKeys.includes(item.id));
};

// =================================================================================

const getMatchedList = (keywordList, valueList, options) => {
    if (!keywordList.length) {
        return valueList;
    }

    const keyword = keywordList.shift();

    let found = false;

    for (let i = 0, l = valueList.length; i < l; i++) {
        const item = valueList[i];
        const { value, str } = item;
        if (!str) {
            continue;
        }
        const start = str.indexOf(keyword);
        if (start === -1) {
            continue;
        }
        const end = start + keyword.length;

        const startValue = value.slice(0, start);
        const matchedValue = value.slice(start, end);
        const endValue = value.slice(end);

        valueList.splice(i, 1, {
            value: startValue,
            str: startValue.toLowerCase()
        }, {
            value: matchedValue,
            pre: options.pre,
            post: options.post
        }, {
            value: endValue,
            str: endValue.toLowerCase()
        });

        found = true;

        break;

    }

    if (found) {
        return getMatchedList(keywordList, valueList, options);
    }

};

const getMatchedValue = (keywordList, value, options) => {
    const valueList = [{
        value,
        str: value.toLowerCase()
    }];
    const list = getMatchedList(keywordList, valueList, options);

    if (list) {
        // console.log(list, keywordList, value);
        return list.map((item) => {
            return [item.pre, item.value, item.post].filter((it) => it).join('');
        }).join('');
    }
    return null;
};

// =================================================================================

export default (rowItem) => {

    const searchableAllKeys = state.searchableAllKeys;
    searchableAllKeys.forEach((k) => {
        rowItem[`${k}_matched`] = null;
    });

    const keywords = state.keywords.trim().toLowerCase();
    if (!keywords) {
        return true;
    }

    const searchableKeys = state.searchableKeys;
    if (!searchableKeys.length) {
        return true;
    }

    const searchableValues = getSearchableValues(rowItem, searchableAllKeys, searchableKeys);

    // console.log(searchableValues);

    const keywordList = keywords.split(/\s+/g);

    let hasMatched = false;
    searchableValues.forEach((item) => {
        const { id, value } = item;
        // clone for shift
        const cloneList = [].concat(keywordList);
        const matched = getMatchedValue(cloneList, value, {
            pre: '<b>',
            post: '</b>'
        });

        if (!matched) {
            return;
        }

        rowItem[`${id}_matched`] = matched;
        hasMatched = true;

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
