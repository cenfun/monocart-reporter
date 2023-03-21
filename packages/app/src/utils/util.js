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

    isTouchDevice: function() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
    },

    dFixed: (num, fixed = 1) => {
        if (Number.isInteger(num)) {
            return num;
        }
        return Util.toNum(num.toFixed(fixed));
    },

    point: (px, py) => {
        return `${Util.dFixed(px)},${Util.dFixed(py)}`;
    },

    quoteAttr: (s) => {
        return `${s}`
            // This MUST be the 1st replacement.
            .replace(/&/g, '&amp;')
            // The 4 other predefined entities, required.
            .replace(/'/g, '&apos;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
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
        if (typeof v === 'number' && v) {
            return v.toLocaleString();
        }
        return v;
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
    TF: function(v) {
        v = Util.toNum(v, true);
        if (v < 1000) {
            return `${v} ms`;
        }
        if (v < 60 * 1000) {
            return `${v / 1000} s`;
        }
        const s = v / 1000;
        const hours = Math.floor(s / 60 / 60);
        const minutes = Math.floor((s - (hours * 60 * 60)) / 60);
        const seconds = Math.round(s - (hours * 60 * 60) - (minutes * 60));
        return `${hours}:${Util.zero(minutes)}:${Util.zero(seconds)}`;
    }
};


export default Util;
