const fs = require('fs');
const path = require('path');
const os = require('os');

const Util = {

    root: process.cwd(),

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

    // \ to /
    formatPath: function(str) {
        if (str) {
            str = str.replace(/\\/g, '/');
        }
        return str;
    },

    relativePath: function(p, root) {
        p = `${p}`;
        root = `${root || Util.root}`;
        let rp = path.relative(root, p);
        rp = Util.formatPath(rp);
        return rp;
    },

    hasOwn: function(obj, key) {
        return Object.prototype.hasOwnProperty.call(obj, key);
    },

    replace: function(str, obj, defaultValue) {
        str = `${str}`;
        if (!obj) {
            return str;
        }
        str = str.replace(/\{([^}{]+)\}/g, function(match, key) {
            if (!Util.hasOwn(obj, key)) {
                if (typeof (defaultValue) !== 'undefined') {
                    return defaultValue;
                }
                return match;
            }
            let val = obj[key];
            if (typeof (val) === 'function') {
                val = val(obj, key);
            }
            if (typeof (val) === 'undefined') {
                val = '';
            }
            return val;
        });
        return str;
    },

    getEOL: function(content) {
        if (!content) {
            return os.EOL;
        }
        const nIndex = content.lastIndexOf('\n');
        if (nIndex === -1) {
            return os.EOL;
        }
        if (content.substr(nIndex - 1, 1) === '\r') {
            return '\r\n';
        }
        return '\n';
    },

    readJSONSync: function(filePath) {
        // do NOT use require, it has cache
        const content = Util.readFileContentSync(filePath);
        let json = null;
        if (content) {
            json = JSON.parse(content);
        }
        return json;
    },

    writeJSONSync: function(filePath, json) {
        let content = Util.jsonString(json, 4);
        if (!content) {
            Util.logRed('Invalid JSON object');
            return false;
        }
        // end of line
        const EOL = Util.getEOL();
        content = content.replace(/\r|\n/g, EOL);
        content += EOL;
        Util.writeFileContentSync(filePath, content);
        return true;
    },

    jsonString: function(obj, spaces) {

        if (typeof (obj) === 'string') {
            return obj;
        }

        if (!spaces) {
            spaces = 2;
        }

        let str = '';
        try {
            str = JSON.stringify(obj, null, spaces);
        } catch (e) {
            console.log(e);
        }

        return str;
    },

    readFileContentSync: function(filePath) {
        if (fs.existsSync(filePath)) {
            return fs.readFileSync(filePath).toString('utf8');
        }
    },

    writeFileContentSync: function(filePath, content) {
        if (!fs.existsSync(filePath)) {
            const p = path.dirname(filePath);
            if (!fs.existsSync(p)) {
                fs.mkdirSync(p, {
                    recursive: true
                });
            }
        }
        fs.writeFileSync(filePath, content);
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

    getTemplate: function(templatePath) {
        if (!Util.templateCache) {
            Util.templateCache = {};
        }
        let template = Util.templateCache[templatePath];
        if (!template) {
            template = Util.readFileContentSync(templatePath);
            if (template) {
                Util.templateCache[templatePath] = template;
            } else {
                Util.logRed(`ERROR: Not found template: ${templatePath}`);
            }
        }
        return template;
    },

    mergeOption: function(... args) {
        const option = {};
        args.forEach((item) => {
            if (!item) {
                return;
            }
            Object.keys(item).forEach((k) => {
                const nv = item[k];
                if (Util.hasOwn(option, k)) {
                    const ov = option[k];
                    if (ov && typeof ov === 'object') {
                        if (nv && typeof nv === 'object' && !Array.isArray(nv)) {
                            option[k] = Util.mergeOption(ov, nv);
                            return;
                        }
                    }
                }
                option[k] = nv;
            });
        });
        return option;
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

module.exports = Util;