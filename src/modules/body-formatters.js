import OkIcon from '../components/ok-icon.vue';
import Util from '../util/util.js';

export default {

    ok: function(v, rowItem, columnItem, cellNode) {
        if (typeof v !== 'boolean') {
            return '';
        }
        const div = document.createElement('div');
        div.className = 'prg-ok-icon';
        OkIcon.createComponent({
            row: rowItem
        }, null, div);
        return div;
    },

    duration: function(v) {
        if (typeof v !== 'number') {
            return '';
        }
        return Util.DTF(v);
    },

    location: function(v) {
        if (typeof v !== 'object') {
            return '';
        }
        //console.log(v);
        const file = Util.formatPath(`${v.file}`).split('/').pop();
        return `${file}:${v.line},${v.column}`;
    },

    error: function(v) {
        if (typeof v !== 'object') {
            return '';
        }
        //console.log(v);
        return v.message;

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
