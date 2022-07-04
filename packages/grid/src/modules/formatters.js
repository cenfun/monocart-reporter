import CaseIcon from '../components/case-icon.vue';
import Util from '../util/util.js';

export default {

    caseIcon: function(v, rowItem, columnItem, cellNode) {
        if (typeof v !== 'boolean') {
            return '';
        }
        const div = document.createElement('div');
        div.className = 'prg-case-icon';
        CaseIcon.createComponent({
            caseItem: rowItem
        }, null, div);
        return div;
    },

    tree: function(v, rowItem, columnItem, cellNode) {
        const defaultFormatter = this.getDefaultFormatter('tree');
        if (rowItem.type === 'suite') {
            v = `${v} (${rowItem.tests})`;
        }
        return defaultFormatter(v, rowItem, columnItem, cellNode);
    },

    duration: function(v) {
        if (typeof v !== 'number') {
            return '';
        }
        return Util.DTF(v);
    },

    errors: function(v, rowItem) {
        const errors = rowItem.errors;
        if (!errors) {
            return '';
        }
        return `<div class="tg-case-num">${errors.length}</div>`;
    },

    logs: function(v, rowItem) {
        const logs = rowItem.logs;
        if (!logs) {
            return '';
        }
        return `<div class="tg-case-num">${logs.length}</div>`;
    },

    attachments: function(v, rowItem) {
        const attachments = rowItem.attachments;
        if (!attachments) {
            return '';
        }
        return `<div class="tg-case-num">${attachments.length}</div>`;
    }

};
