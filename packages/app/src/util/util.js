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

    isList: function(data) {
        if (data && data instanceof Array && data.length > 0) {
            return true;
        }
        return false;
    },

    zero: function(s, l = 2) {
        s = `${s}`;
        return s.padStart(l, '0');
    },

    // =============================================================================

    // ok is outcome === 'expected' || 'flaky' || 'skipped'
    isSkipped: function(item) {
        return item.status === 'skipped' || item.outcome === 'skipped';
    },

    getCaseIcon: function(item) {
        const list = ['mcr-icon'];
        if (item.ok) {
            if (Util.isSkipped(item)) {
                list.push('mcr-icon-skipped');
            } else {
                list.push('mcr-icon-passed');
            }
        } else {
            list.push('mcr-icon-failed');
        }

        const cls = list.join(' ');

        return `<div class="${cls}"></div>`;
    },

    // =============================================================================
    // hash
    getHash(key) {
        let hash = {};
        const h = location.hash.slice(1);
        if (h) {
            const usp = new URLSearchParams(h);
            hash = Object.fromEntries(usp);
        }
        if (key) {
            return hash[key];
        }
        return hash;
    },

    setHash(key, value) {
        if (!key) {
            return;
        }
        let obj = key;
        if (arguments.length === 2) {
            obj = {};
            obj[key] = value;
        }
        const hash = Util.getHash();
        Object.keys(obj).forEach((k) => {
            hash[k] = obj[k];
        });
        const usp = new URLSearchParams(hash);
        location.hash = usp.toString();
    },

    delHash(key) {
        if (!key) {
            location.hash = '';
            return;
        }
        let list = key;
        if (!Array.isArray(key)) {
            list = [key];
        }
        const hash = Util.getHash();
        list.forEach((k) => {
            delete hash[k];
        });
        const usp = new URLSearchParams(hash);
        location.hash = usp.toString();
    },

    // =============================================================================
    // formatter

    // number
    NF: function(v) {
        v = Util.toNum(v);
        return v.toLocaleString();
    },

    // percent
    PF: function(v, t = 1, digits = 1) {
        v = Util.toNum(v);
        t = Util.toNum(t);
        let per = 0;
        if (t) {
            per = v / t;
        }
        return `${(per * 100).toFixed(digits)}%`;
    },

    // time
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

    // duration time
    DTF: function(v, maxV) {
        maxV = maxV || v;
        if (maxV > 60 * 1000) {
            return Util.TF(v);
        }
        return Util.TF(v, 'ms');
    }
};


export default Util;
