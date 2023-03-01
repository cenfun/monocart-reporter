import Util from '../util/util.js';

const matchedFormatter = function(value, rowItem, columnItem) {
    const id = columnItem.id;
    const matched = rowItem[`${id}_matched`];
    if (matched) {
        return matched;
    }
    return value;
};

const annotationsFormatter = (list) => {
    return list.map((it) => it.type).filter((it) => it).join(' ');
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
        return Util.getIconOk(rowItem);
    },

    iconType: function(value, rowItem, columnItem, cellNode) {
        return Util.getIconType(value);
    },

    string: matchedFormatter,

    tree: function(value, rowItem, columnItem, cellNode) {
        value = matchedFormatter(value, rowItem, columnItem);

        const defaultFormatter = this.getDefaultFormatter('tree');
        if (rowItem.type === 'suite') {
            value = `${value} (${rowItem.tests})`;
        } else if (rowItem.type === 'case') {
            value = `${value} <div class="tg-cell-hover-icon tg-flyover-icon">
                <div class="mcr-icon mcr-icon-info" />
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

        value = matchedFormatter(value, rowItem, columnItem);

        if (Util.isList(value)) {
            // only show type in grid
            value = annotationsFormatter(value);
        }
        if (value) {
            return `<span class="mcr-clickable">${value}</span>`;
        }
        return '';
    },

    errors: function(value, rowItem) {
        if (!value) {
            return '';
        }
        return '<div class="mcr-icon mcr-icon-error" />';
    },

    logs: function(value, rowItem) {
        if (!value) {
            return '';
        }
        return '<div class="mcr-icon mcr-icon-log" />';
    },

    attachments: function(value, rowItem) {
        if (!value) {
            return '';
        }
        return '<div class="mcr-icon mcr-icon-attachment" />';
    }

};


export {
    formatters,
    matchedFormatter,
    annotationsFormatter
};
