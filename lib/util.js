const fs = require('fs');
const path = require('path');
const os = require('os');

const Util = {

    root: process.cwd(),

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

    writeJSONSync: function(filePath, json, force) {
        let content = Util.jsonString(json, 4);
        if (!content) {
            Util.logRed('Invalid JSON object');
            return false;
        }
        // end of line
        const EOL = Util.getEOL();
        content = content.replace(/\r|\n/g, EOL);
        content += EOL;
        return Util.writeFileContentSync(filePath, content, force);
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
        let content = null;
        const isExists = fs.existsSync(filePath);
        if (isExists) {
            content = fs.readFileSync(filePath);
            if (Buffer.isBuffer(content)) {
                content = content.toString('utf8');
            }
        }
        return content;
    },

    writeFileContentSync: function(filePath, content, force) {
        const isExists = fs.existsSync(filePath);
        if (force || isExists) {
            const p = path.dirname(filePath);
            if (!fs.existsSync(p)) {
                fs.mkdirSync(p, {
                    recursive: true
                });
            }
            fs.writeFileSync(filePath, content);
            return true;
        }
        return false;
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
    }
};

module.exports = Util;
