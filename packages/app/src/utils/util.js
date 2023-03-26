import { Util as util } from 'turbogrid';

const Util = {
    ... util,

    formatPath: function(str) {
        if (str) {
            str = str.replace(/\\/g, '/');
        }
        return str;
    },

    isNull: function(input) {
        if (input === null || typeof input === 'undefined') {
            return true;
        }
        return false;
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

    forEach: function(rootList, callback) {
        const forList = (list, parent) => {
            if (!Util.isList(list)) {
                return;
            }
            for (const item of list) {
                const result = callback(item, parent);
                if (result === false) {
                    return false;
                }
                const subResult = forList(item.subs, item);
                if (subResult === false) {
                    return false;
                }
            }
        };
        forList(rootList);
    },

    findBetween: function(list, callback) {
        const end = list.length - 1;
        if (end < 1) {
            return;
        }
        for (let i = 0; i < end; i++) {
            const res = callback(list[i], list[i + 1]);
            if (res) {
                return res;
            }
        }
    },

    zero: function(s, len = 2) {
        s = `${s}`;
        return s.padStart(len, '0');
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

    pxFixed: (num) => {
        const floor = Math.floor(num);
        if (num < floor + 0.5) {
            return floor + 0.5;
        }
        return floor + 1.5;
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

    getTypeIcon: (subType, type) => {
        const icons = {
            suite: 'suite',
            project: 'project',
            file: 'file',
            case: 'case',
            step: 'step'
        };
        return icons[subType] || icons[type];
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

    // byte
    BF: function(v, places = 1, base = 1024) {
        v = Util.toNum(v, true);
        if (v === 0) {
            return '0B';
        }
        let prefix = '';
        if (v < 0) {
            v = Math.abs(v);
            prefix = '-';
        }
        const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        for (let i = 0, l = units.length; i < l; i++) {
            const min = Math.pow(base, i);
            const max = Math.pow(base, i + 1);
            if (v > min && v < max) {
                const unit = units[i];
                v = prefix + (v / min).toFixed(places) + unit;
                break;
            }
        }
        return v;
    },

    // time
    TF: function(v) {
        const ms = Util.toNum(v, true);
        if (ms < 1000) {
            return `${ms}ms`;
        }

        if (v < 60 * 1000) {
            return `${ms / 1000}s`;
        }

        const s = Math.round(ms / 1000);
        const m = Math.floor(ms / 1000 / 60);
        if (ms < 60 * 60 * 1000) {
            return `${m}m ${s}s`;
        }

        const h = Math.floor(ms / 1000 / 60 / 60);
        if (ms < 24 * 60 * 60 * 1000) {
            return `${h}h ${m}m ${s}s`;
        }

        const d = Math.floor(ms / 1000 / 60 / 60 / 24);
        return `${d}d ${h}h ${m}m ${s}s`;
    }
};


export default Util;
