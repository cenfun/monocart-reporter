import StatusIcon from './status-icon.vue';
import Util from '../util/util.js';

const formatters = {

    ok: function(v, rowData) {
        if (typeof v !== 'boolean') {
            return '';
        }
        const vm = StatusIcon.create({
            props: {
                row: rowData
            }
        });
        return vm.$el;
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
        v.forEach(item => {
            const href = item.path;
            list.push(`<a href="${href}" target="_blank">${item.name}</a>`);
        });
        return list.join(' ');
    }

};


export default formatters;