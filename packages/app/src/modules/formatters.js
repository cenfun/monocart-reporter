import Util from '../util/util.js';

const matchedFormatter = function(value, rowItem, columnItem) {
    const id = columnItem.id;
    const matched = rowItem[`${id}_matched`];
    if (matched) {
        return matched;
    }
    return value;
};

export default {

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

    annotations: function(value, rowItem) {
        if (Util.isList(value)) {
            // only show type in grid
            value = value.map((item) => item.type).filter((item) => item).join(' ');
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
