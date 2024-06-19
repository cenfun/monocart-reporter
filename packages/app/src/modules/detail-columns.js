import { shallowReactive } from 'vue';
import Convert from 'ansi-to-html';

import {
    markdownFormatter, mergeAnnotations, formatters
} from './formatters.js';

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
        if (collection) {
            collection.errors.push({
                error,
                position
            });
        }
        return convertHtml(error);
    });
    const content = list.join('');

    return {
        icon: 'error',
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
        icon: 'log',
        content
    };
};

const getAnnotations = (item, column, collection) => {
    const annotations = item.annotations;

    // string
    if (typeof annotations === 'string' && annotations) {
        return {
            icon: 'annotation',
            content: `<div class="mcr-annotation-list">
                        <div class="mcr-annotation-item">${markdownFormatter(annotations, true)}</div>
                    </div>`
        };
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
        return `<div class="mcr-annotation-item">${res.join('')}</div>`;
    });
    // console.log(list);

    const content = list.join('');
    if (!content) {
        return;
    }

    return {
        icon: 'annotation',
        content: `<div class="mcr-annotation-list">
            ${content}
        </div>`
    };
};

// ===========================================================================

const getAttachments = (item, column, collection) => {
    const attachments = item.attachments;
    if (!Util.isList(attachments)) {
        return;
    }

    if (collection) {
        attachments.forEach((it) => {
            collection.attachments.push(it);
        });
    }

    return {
        id: column.id,
        icon: 'attachment',
        list: attachments
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

    const simple = !column.markdown && !column.detailed;

    const content = getCustomFormattedContent(value, item, column);

    return {
        simple,
        icon: 'custom',
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

export const getPositionId = (rowId, columnId) => {
    return [rowId, columnId].join('-');
};

const addResult = (list, item, column, result) => {
    result.data = column;
    result.positionId = getPositionId(item.id, column.id);
    result.positionType = column.id;
    result.state = shallowReactive({});
    list.push(result);
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

    return {
        id: 'metadata',
        icon: 'metadata',
        list: metadataList
    };
};

const getColumns = (list, item, columns, collection) => {

    // metadata for project
    if (item.type === 'suite' && item.suiteType === 'project') {
        const result = getProjectMetadata(item);
        if (result) {
            // virtual column for project metadata
            const column = {
                id: 'metadata',
                name: 'Metadata'
            };
            addResult(list, item, column, result);
        }
    }

    columns.forEach((column) => {

        const result = getColumn(item, column, collection);
        if (result) {
            addResult(list, item, column, result);
        }

        if (Util.isList(column.subs)) {
            getColumns(list, item, column.subs, collection);
        }

    });

};

export const initDataColumns = (item, collection) => {
    if (item.tg_detailColumns) {
        return;
    }

    const allColumns = [];
    getColumns(allColumns, item, state.columns, collection);

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

    // titleColumn for tags
    item.tg_titleColumn = state.columns.find((it) => it.id === 'title');
    item.tg_simpleColumns = simpleColumns;
    item.tg_detailColumns = detailColumns;
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
