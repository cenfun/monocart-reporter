const Util = {

    // definition
    tagPattern: /@([^@\s]+)/g,
    lineBreakPattern: /\r\n|[\r\n\u2028\u2029]/gu,

    attachments: {
        audit: {
            name: 'audit',
            contentType: 'text/html',
            reportFile: 'audit-report.json'
        },
        coverage: {
            name: 'coverage',
            contentType: 'text/html',
            reportFile: 'coverage-report.json'
        },
        network: {
            name: 'network',
            contentType: 'text/html',
            reportFile: 'network-report.json'
        },
        // artifact will be removed finally
        artifact: {
            name: 'artifact',
            contentType: 'application/json'
        }
    },

    pageTimings: [{
        key: 'onContentLoad',
        name: 'Content Loaded',
        color: '#1a1aa6'
    }, {
        key: 'onLoad',
        name: 'Page Loaded',
        color: '#c80000'
    }],

    timings: [{
        key: 'blocked',
        name: 'Blocking',
        color: '#858585'
    }, {
        key: 'dns',
        name: 'DNS Lookup',
        color: '#009688'
    }, {
        key: 'connect',
        name: 'Connecting',
        color: '#b52dcd'
    }, {
        key: 'send',
        name: 'Sending',
        color: '#74979a'
    }, {
        key: 'wait',
        name: 'Waiting',
        color: '#00a846'
    }, {
        key: 'receive',
        name: 'Receiving',
        color: '#0299de'
    }],

    hasOwn: function(obj, key) {
        return Object.prototype.hasOwnProperty.call(obj, key);
    },

    isNull: function(input) {
        if (input === null || typeof input === 'undefined') {
            return true;
        }
        return false;
    },

    uid: function(len = 20, prefix = '') {
        const dict = '0123456789abcdefghijklmnopqrstuvwxyz';
        const dictLen = dict.length;
        let str = prefix;
        while (len--) {
            str += dict[Math.random() * dictLen | 0];
        }
        return str;
    },

    zero: function(s, l = 2) {
        s = `${s}`;
        return s.padStart(l, '0');
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
        const isBreak = (res) => {
            return res === 'break' || res === false;
        };
        const forList = (list, parent) => {
            if (!Util.isList(list)) {
                return;
            }
            for (const item of list) {
                const result = callback(item, parent);
                if (isBreak(result)) {
                    return result;
                }
                const subResult = forList(item.subs, item);
                if (isBreak(subResult)) {
                    return subResult;
                }
            }
        };
        forList(rootList);
    },

    // \ to /
    formatPath: function(str) {
        if (str) {
            str = str.replace(/\\/g, '/');
        }
        return str;
    },

    getCurrentTrendInfo: (data) => {

        const {
            date, duration, summary
        } = data;

        const info = {
            date,
            duration
        };

        Object.keys(summary).forEach((k) => {
            const item = summary[k];
            info[k] = item.value;
        });

        return info;
    },

    getFlatRanges: (functions) => {
        const flatRanges = [];
        if (functions && functions.length) {
            functions.forEach((fun) => {
                const ranges = fun.ranges;
                if (ranges && ranges.length) {
                    ranges.forEach((range) => {
                        flatRanges.push(range);
                    });
                }
            });
            flatRanges.sort((a, b) => {
                if (a.startOffset === b.startOffset) {
                    if (a.endOffset === b.endOffset) {
                        return a.count - b.count;
                    }
                    return a.endOffset - b.endOffset;
                }
                return a.startOffset - b.startOffset;
            });
        }
        return flatRanges;
    },

    isTagItem: (item) => {
        if (item.type === 'case' || (item.type === 'suite' && item.suiteType === 'describe')) {
            return true;
        }
        return false;
    },

    delay: function(ms) {
        return new Promise((resolve) => {
            if (ms) {
                setTimeout(resolve, ms);
            } else {
                setImmediate(resolve);
            }
        });
    },

    // =============================================================================

    generatePercentChart: function(percent) {
        return `<div style="--mcr-percent:${percent}%;" class="mcr-percent-chart"></div>`;
    },

    // =============================================================================
    // svg

    dFixed: (num, fixed = 1) => {
        if (Number.isInteger(num)) {
            return num;
        }
        return Util.toNum(Util.toNum(num).toFixed(fixed));
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
    PF: function(v, t = 1, digits = 1, unit = '%', space = '') {
        v = Util.toNum(v);
        t = Util.toNum(t);
        let per = 0;
        if (t) {
            per = v / t;
        }
        const perStr = (per * 100).toFixed(digits);
        if (unit) {
            return perStr + space + unit;
        }
        return parseFloat(perStr);
    },

    PSF: function(v, t = 1, digits = 1) {
        return Util.PF(v, t, digits, '%', ' ');
    },

    PNF: function(v, t = 1, digits = 1) {
        return Util.PF(v, t, digits, '');
    },

    // byte
    BF: function(v, places = 1, space = '') {
        v = Util.toNum(v, true);
        if (v === 0) {
            return `0${space}B`;
        }
        let prefix = '';
        if (v < 0) {
            v = Math.abs(v);
            prefix = '-';
        }

        const base = 1024;
        const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        for (let i = 0, l = units.length; i < l; i++) {
            const min = Math.pow(base, i);
            const max = Math.pow(base, i + 1);
            if (v > min && v < max) {
                const unit = units[i];
                v = prefix + (v / min).toFixed(places) + space + unit;
                break;
            }
        }
        return v;
    },

    BSF: function(v, places = 1) {
        return Util.BF(v, places, ' ');
    },

    // time
    TF: function(v, space = '') {
        const ms = Util.toNum(v, true);

        if (ms < 1000) {
            return `${ms}${space}ms`;
        }

        if (ms < 60 * 1000) {
            const ss = Math.floor(ms / 1000);
            const sms = Math.round((ms - ss * 1000) / 100);
            if (sms) {
                return `${ss}.${sms}${space}s`;
            }
            return `${ss}${space}s`;
        }

        const s = Math.round(ms / 1000);

        const m = 60;
        const h = m * 60;
        const d = h * 24;

        if (s < h) {
            const minutes = Math.floor(s / m);
            const seconds = s - minutes * m;
            return `${minutes}${space}m ${seconds}${space}s`;
        }

        if (s < d) {
            const hours = Math.floor(s / h);
            const minutes = Math.floor((s - hours * h) / m);
            const seconds = s - hours * h - minutes * m;
            return `${hours}${space}h ${minutes}${space}m ${seconds}${space}s`;
        }

        const days = Math.floor(s / d);
        const hours = Math.floor((s - days * d) / h);
        const minutes = Math.floor((s - days * d - hours * h) / m);
        const seconds = s - days * d - hours * h - minutes * m;
        return `${days}${space}d ${hours}${space}h ${minutes}${space}m ${seconds}${space}s`;
    },

    TSF: function(v) {
        return Util.TF(v, ' ');
    }
};


module.exports = Util;
