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
        
    }

};


export default formatters;