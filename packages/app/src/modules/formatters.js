import CaseIcon from '../components/case-icon.vue';
import Util from '../util/util.js';

export default {

    caseIcon: function(v, rowItem, columnItem, cellNode) {
        if (typeof v !== 'boolean') {
            return '';
        }
        const div = document.createElement('div');
        div.className = 'mcr-case-icon';
        CaseIcon.createComponent({
            caseItem: rowItem
        }, null, div);
        return div;
    },

    tree: function(v, rowItem, columnItem, cellNode) {
        const defaultFormatter = this.getDefaultFormatter('tree');
        if (rowItem.type === 'suite') {
            v = `${v} (${rowItem.tests})`;
        } else if (rowItem.type === 'case') {
            v = `${v} <div class="tg-cell-hover-icon tg-flyover-icon" title="Show case detail">
                <div class="mcr-icon mcr-icon-info" />
            </div>`;
        }
        return defaultFormatter(v, rowItem, columnItem, cellNode);
    },

    duration: function(v) {
        if (typeof v !== 'number') {
            return '';
        }
        return Util.DTF(v);
    },

    annotations: function(v, rowItem) {
        const annotations = rowItem.annotations;
        if (!Util.isList(annotations)) {
            return '';
        }
        return annotations.map((item) => item.type).filter((item) => item).map((item) => `<span class="mcr-annotation">${item}</span>`).join(' ');
    },

    errors: function(v, rowItem) {
        const errors = rowItem.errors;
        if (!errors) {
            return '';
        }
        return '<div class="mcr-icon mcr-icon-error" />';
    },

    logs: function(v, rowItem) {
        const logs = rowItem.logs;
        if (!logs) {
            return '';
        }
        return '<div class="mcr-icon mcr-icon-log" />';
    },

    attachments: function(v, rowItem) {
        const attachments = rowItem.attachments;
        if (!attachments) {
            return '';
        }
        return '<div class="mcr-icon mcr-icon-attachment" />';
    }

};
