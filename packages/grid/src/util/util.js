import { Util as util } from 'turbogrid';

const Util = {
    ... util,

    formatPath: function(str) {
        if (str) {
            str = str.replace(/\\/g, '/');
        }
        return str;
    },

    toNum: function(num, toInt) {
        if (typeof (num) !== 'number') {
            num = parseFloat(num);
        }
        if (isNaN(num)) {
            num = 0;
        }
        if (toInt) {
            num = Math.round(num);
        }
        return num;
    },

    zero: function(s, l = 2) {
        s = `${s}`;
        return s.padStart(l, '0');
    },

    //number
    NF: function(v) {
        v = Util.toNum(v);
        return v.toLocaleString();
    },

    //percent
    PF: function(v, t = 1, digits = 1) {
        v = Util.toNum(v);
        t = Util.toNum(t);
        let per = 0;
        if (t) {
            per = v / t;
        }
        return `${(per * 100).toFixed(digits)}%`;
    },

    //time
    TF: function(v, unit, digits = 1) {
        v = Util.toNum(v, true);
        if (unit) {
            if (unit === 's') {
                v = (v / 1000).toFixed(digits);
            } else if (unit === 'm') {
                v = (v / 1000 / 60).toFixed(digits);
            } else if (unit === 'h') {
                v = (v / 1000 / 60 / 60).toFixed(digits);
            }
            return `${Util.NF(v)} ${unit}`;
        }
        const s = v / 1000;
        const hours = Math.floor(s / 60 / 60);
        const minutes = Math.floor((s - (hours * 60 * 60)) / 60);
        const seconds = Math.round(s - (hours * 60 * 60) - (minutes * 60));
        return `${hours}:${Util.zero(minutes)}:${Util.zero(seconds)}`;
    },

    //duration time
    DTF: function(v, maxV) {
        maxV = maxV || v;
        if (maxV > 60 * 1000) {
            return Util.TF(v);
        }
        return Util.TF(v, 'ms');
    }
};


export default Util;
