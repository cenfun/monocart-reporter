import { shallowReactive } from 'vue';
import Convert from 'ansi-to-html';

import {
    markdownFormatter, mergeAnnotations, formatters
} from './formatters.js';

import { groupAttachments } from './attachments.js';

import Util from '../utils/util.js';
import state from './state.js';

// ===========================================================================
// errors logs html

const convert = new Convert({
    fg: '#333',
    bg: '#F6F8FA',
    newline: true,
    escapeXML: true
});

const convertHtml = (str) => {

    const reg = /\s$/;
    const endsWithN = reg.test(str) ? '' : '<br/>';

    // link
    // const re = /(http[s]?:\/\/([\w-]+.)+([:\d+])?(\/[\w-./?%&=]*)?)/gi;
    // str = str.replace(re, function(a) {
    //     return `<a href="${a}" target="_blank">${a}</a>`;
    // });

    str = convert.toHtml(str) + endsWithN;

    return str;
};


export const getPositionId = (rowId, columnId) => {
    return [rowId, columnId].join('-');
};

// ===========================================================================

const getErrors = (item, column, collection) => {
    const errors = item.errors;
    if (!Util.isList(errors)) {
        return;
    }

    const position = {
        type: item.type,
        rowId: item.id,
        columnId: column.id
    };
    const list = errors.map((error) => {
        collection.errors.push({
            error,
            position
        });
        return convertHtml(error);
    });
    const content = list.join('');

    return {
        id: getPositionId(item.id, column.id),
        type: 'details',
        icon: 'error',
        hasDetails: true,
        hoverable: false,
        data: column,
        // for row filter
        errorNum: 1,
        content
    };
};

const getLogs = (item, column, collection) => {
    const logs = item.logs;
    if (!Util.isList(logs)) {
        return;
    }

    const list = logs.map((log) => {
        return convertHtml(log);
    });
    const content = list.join('');

    return {
        id: getPositionId(item.id, column.id),
        type: 'details',
        icon: 'log',
        hasDetails: true,
        hoverable: false,
        data: column,
        content
    };
};

const getAnnotationList = (item) => {
    const annotations = item.annotations;

    const icon = 'item-arrow';

    // string
    if (typeof annotations === 'string' && annotations) {
        return [{
            icon,
            title: markdownFormatter(annotations, true)
        }];
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
        return {
            icon,
            title: `<div class="mcr-annotation-item">${res.join('')}</div>`
        };
    });
    // console.log(list);

    const content = list.join('');
    if (!content) {
        return;
    }

    return list;
};

const getAnnotations = (item, column, collection) => {

    const list = getAnnotationList(item);

    if (list && list.length) {
        return {
            id: getPositionId(item.id, column.id),
            icon: 'annotation',
            title: column.name,
            subs: list
        };
    }

};

// ===========================================================================

const getAttachments = (item, column, collection) => {
    const attachments = item.attachments;
    if (!Util.isList(attachments)) {
        return;
    }

    const list = groupAttachments(attachments);

    const subs = list.map((it) => {

        if (it.component === 'comparison') {
            collection.comparisons.push(it);
        }

        // it: component, data
        return Object.assign(it, {
            componentType: 'attachment',
            icon: 'attachment',
            type: 'details',
            hasDetails: true,
            hoverable: false
        });
    });

    return {
        id: getPositionId(item.id, column.id),
        icon: 'attachment',
        title: column.name,
        subs
    };
};

// ===========================================================================

const getCustomFormattedContent = (value, item, column) => {

    const formatter = column.formatter;

    if (formatter) {
        if (typeof formatter === 'function') {
            return formatter(value, item, column);
        }

        if (typeof formatter === 'string') {
            const handler = formatters[formatter];
            if (handler) {
                return handler(value, item, column);
            }
        }
    }

    if (column.markdown) {
        return markdownFormatter(value);
    }

    return value;
};

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

    const title = column.name;
    const content = getCustomFormattedContent(value, item, column);

    const simple = !column.markdown && !column.detailed;
    if (simple) {
        // for detail-simple-list.vue
        return {
            simple,
            title,
            content
        };
    }

    return {
        id: getPositionId(item.id, column.id),
        type: 'details',
        icon: 'custom',
        hasDetails: true,
        hoverable: false,
        data: column,
        content
    };
};

// ===========================================================================

const getColumn = (item, column, collection) => {

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

    return handler(item, column, collection);
};

const getProjectMetadata = (item) => {
    const metadata = item.metadata;
    if (!metadata || typeof metadata !== 'object') {
        return;
    }

    const metadataList = Util.getMetadataList(metadata);
    if (!metadataList.length) {
        return;
    }

    metadataList.forEach((it) => {
        let title = `<b>${it.name}</b>: `;
        if (it.isLink) {
            title += `<a href="${it.value}" target="_blank">${it.value}</a>`;
        } else {
            title += it.value;
        }
        it.title = title;
    });

    return {
        id: getPositionId(item.id, 'metadata'),
        title: 'Metadata',
        icon: 'metadata',
        subs: metadataList
    };
};

const forEachColumn = (list, item, columns, collection) => {

    // metadata for project
    if (item.type === 'suite' && item.suiteType === 'project') {
        const result = getProjectMetadata(item);
        if (result) {
            list.push(result);
        }
    }

    columns.forEach((column) => {

        const result = getColumn(item, column, collection);
        if (result) {
            list.push(result);
        }

        if (Util.isList(column.subs)) {
            forEachColumn(list, item, column.subs, collection);
        }

    });

};

export const initDataColumns = (item, collection) => {

    // already done
    if (item.tg_state) {
        return;
    }

    const allColumns = [];
    forEachColumn(allColumns, item, state.columns, collection);

    const simpleColumns = [];
    const detailColumns = [];
    if (allColumns.length) {
        allColumns.forEach((c) => {
            if (c.simple) {
                simpleColumns.push(c);
            } else {
                detailColumns.push(c);
            }
        });
    }

    item.tg_state = shallowReactive({});
    item.selectable = true;

    if (simpleColumns.length) {
        item.tg_simpleList = simpleColumns;
        item.hasDetails = true;
    }

    if (detailColumns.length) {
        // console.log(detailColumns);
        if (item.subs) {
            item.subs = detailColumns.concat(item.subs);
        } else {
            item.subs = detailColumns;
        }
    }

};

export const isClickableColumns = (columnId) => {
    return [
        'title',
        'errors',
        'logs',
        'annotations',
        'attachments'
    ].includes(columnId);
};

export const setPosition = (position) => {
    if (!position) {
        return;
    }

    // wait for image loaded
    setTimeout(() => {
        state.position = position;
        // remove status
        setTimeout(() => {
            state.position = null;
        }, 100);
    }, 100);
};
