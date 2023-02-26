import Util from '../util/util.js';

const matchedFormatter = function(value, rowItem, columnItem) {
    const id = columnItem.id;
    const matched = rowItem[`${id}_matched`];
    if (matched) {
        value = matched;
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

    replace: function(value, rowItem) {
        // replace in turbo grid Util
        return Util.replace(value, rowItem);
    },

    iconOk: function(value, rowItem, columnItem, cellNode) {
        if (typeof value !== 'boolean') {
            return '';
        }
        return Util.getIconOk(rowItem);
    },

    iconType: function(value, rowItem, columnItem, cellNode) {
        const types = {
            suite: 'suite',
            case: 'case',
            step: 'step'
        };
        const type = types[value];
        if (!type) {
            return '';
        }
        const list = ['mcr-icon', 'mcr-icon-type', `mcr-icon-${type}`];
        const cls = list.join(' ');
        return `<div class="${cls}"></div>`;
    },

    string: matchedFormatter,

    tree: function(value, rowItem, columnItem, cellNode) {
        value = matchedFormatter(value, rowItem, columnItem);

        const defaultFormatter = this.getDefaultFormatter('tree');
        if (rowItem.type === 'suite') {
            value = `${value} (${rowItem.tests})`;
        } else if (rowItem.type === 'case') {
            value = `${value} <div class="tg-cell-hover-icon tg-flyover-icon" title="Show case detail">
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
        const annotations = rowItem.annotations;
        if (!Util.isList(annotations)) {
            return '';
        }
        return annotations.map((item) => item.type).filter((item) => item).map((item) => `<span class="mcr-annotation">${item}</span>`).join(' ');
    },

    errors: function(value, rowItem) {
        const errors = rowItem.errors;
        if (!errors) {
            return '';
        }
        return '<div class="mcr-icon mcr-icon-error" />';
    },

    logs: function(value, rowItem) {
        const logs = rowItem.logs;
        if (!logs) {
            return '';
        }
        return '<div class="mcr-icon mcr-icon-log" />';
    },

    attachments: function(value, rowItem) {
        const attachments = rowItem.attachments;
        if (!attachments) {
            return '';
        }
        return '<div class="mcr-icon mcr-icon-attachment" />';
    }

};
