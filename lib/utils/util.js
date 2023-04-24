const fs = require('fs');
const { writeFile, readFile } = require('fs/promises');
const path = require('path');
const os = require('os');
const EC = require('eight-colors');
const Share = require('./share.js');

const Util = {

    root: process.cwd(),

    ... Share,

    relativePath: function(p, root) {
        p = `${p}`;
        root = `${root || Util.root}`;
        let rp = path.relative(root, p);
        rp = Util.formatPath(rp);
        return rp;
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

    parseComments: (input) => {
        const str = `${input}`;
        // starts with @ , ends without @  encodeURIComponent("@") %40
        const reg = /@(\w+)\s+([^@]+)/g;
        const matches = str.matchAll(reg);
        const parsed = {};
        for (const match of matches) {
            // 0 is whole matched, and remove ends * or */
            parsed[match[1]] = match[2].trim().replace(/(\*+|\*+\/)$/g, '').trim();
        }
        // console.log(parsed);
        return parsed;
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

    getAttachmentPathExtras: function(d) {
        return {
            name: d.name,
            cwd: d.cwd,
            outputDir: d.outputDir
        };
    },

    readJSONSync: function(filePath) {
        // do NOT use require, it has cache
        const content = Util.readFileSync(filePath);
        if (content) {
            return JSON.parse(content);
        }
    },

    writeJSONSync: function(filePath, json) {
        let content = Util.jsonString(json);
        if (!content) {
            EC.logRed('[MCR] invalid JSON object');
            return false;
        }
        // end of line
        const EOL = Util.getEOL();
        content = content.replace(/\r|\n/g, EOL);
        content += EOL;
        Util.writeFileSync(filePath, content);
        return true;
    },

    jsonString: function(obj, spaces) {

        if (typeof obj === 'string') {
            return obj;
        }

        if (!spaces) {
            spaces = 4;
        }

        let str = '';
        try {
            str = JSON.stringify(obj, null, spaces);
        } catch (e) {
            console.log(e);
        }

        return str;
    },

    readFileSync: function(filePath) {
        if (fs.existsSync(filePath)) {
            return fs.readFileSync(filePath).toString('utf8');
        }
    },

    readFile: async (filePath) => {
        if (fs.existsSync(filePath)) {
            const buf = await readFile(filePath).catch((e) => {
                console.log(e);
            });
            if (buf) {
                return buf.toString('utf8');
            }
        }
    },

    writeFileSync: function(filePath, content) {
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

    writeFile: async (filePath, content) => {

        if (!fs.existsSync(filePath)) {
            const p = path.dirname(filePath);
            if (!fs.existsSync(p)) {
                fs.mkdirSync(p, {
                    recursive: true
                });
            }
        }

        await writeFile(filePath, content).catch((e) => {
            console.log(e);
        });

    },

    getTemplate: function(templatePath) {
        if (!Util.templateCache) {
            Util.templateCache = {};
        }
        let template = Util.templateCache[templatePath];
        if (!template) {
            template = Util.readFileSync(templatePath);
            if (template) {
                Util.templateCache[templatePath] = template;
            } else {
                EC.logRed(`[MCR] not found template: ${templatePath}`);
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
    }

};

module.exports = Util;
