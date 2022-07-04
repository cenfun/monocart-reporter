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
        return '<div class="tg-case-error"></div>';
    },

    attachments: function(v) {
        if (!Util.isList(v)) {
            return '';
        }
        const list = [];
        v.forEach((item) => {
            const href = item.path;
            list.push(`<a href="${href}" class="tg-attachment-${item.name}" target="_blank">${item.name}</a>`);
        });
        return list.join(' ');
    }

};
