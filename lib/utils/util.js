const fs = require('fs');
const { writeFile, readFile } = require('fs/promises');
const path = require('path');
const os = require('os');
const EC = require('eight-colors');
const Share = require('../platform/share.js');
const { deflateSync } = require('lz-utils');

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

    // anonymous scripts will have __playwright_evaluation_script__ as their URL.
    getUrl: (input) => {
        const defaultUrl = new URL('http://anonymous/anonymous.js');
        if (!input) {
            return defaultUrl;
        }
        let url;
        try {
            url = new URL(input);
        } catch (e) {
            return defaultUrl;
        }
        return url;
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

    resolveOutputDir: (testInfo) => {
        const outputDir = testInfo.project.outputDir || testInfo.config.outputDir;
        if (outputDir) {
            return outputDir;
        }
        return path.resolve(testInfo.outputDir, '../');
    },

    resolveOutputFile: async (outputFile, args) => {
        if (typeof outputFile === 'string') {
            return outputFile;
        }
        if (typeof outputFile === 'function') {
            await outputFile(args);
        }
        return './test-results/report.html';
    },

    resolveGlobalCoverageOptions: (testInfo) => {
        const coverage = {};
        const configReporters = testInfo.config.reporter;
        if (Array.isArray(configReporters)) {
            for (const item of configReporters) {
                if (Array.isArray(item)) {
                    const [name, options] = item;
                    if (name && name.indexOf('monocart-reporter') !== -1) {
                        if (options.coverage) {
                            Object.assign(coverage, options.coverage);
                        }
                    }

                }
            }
        }
        return coverage;
    },

    saveAttachmentHtmlReport: async (reportData, options, reportDataFile, jsFiles) => {

        //  report data
        const reportDataCompressed = deflateSync(JSON.stringify(reportData));
        const reportDataStr = `window.reportData = '${reportDataCompressed}';`;

        // js libs
        const jsList = [];
        for (const jsFile of jsFiles) {
            const jsPath = path.resolve(__dirname, `../runtime/${jsFile}`);
            const jsStr = await Util.readFile(jsPath);
            jsList.push({
                file: jsFile,
                str: jsStr
            });
        }

        // html content
        let htmlStr = '';
        const EOL = Util.getEOL();
        if (options.inline) {
            htmlStr = [
                '<script>',
                reportDataStr,
                ... jsList.map((it) => it.str),
                '</script>'
            ].join(EOL);
        } else {

            await Util.writeFile(path.resolve(options.htmlDir, reportDataFile), reportDataStr);

            const assetsName = 'assets';
            for (const item of jsList) {
                const filePath = path.resolve(options.outputDir, assetsName, item.file);
                if (!fs.existsSync(filePath)) {
                    await Util.writeFile(filePath, item.str);
                }
            }

            htmlStr = [
                `<script src="${reportDataFile}"></script>`,
                ... jsList.map((it) => `<script src="../${assetsName}/${it.file}"></script>`)
            ].join(EOL);
        }

        // html
        const htmlPath = path.resolve(options.htmlDir, 'index.html');
        const template = Util.getTemplate(path.resolve(__dirname, '../default/template.html'));
        const html = Util.replace(template, {
            title: reportData.title,
            content: htmlStr
        });

        await Util.writeFile(htmlPath, html);
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

    shortTestId: (id) => {
        if (id) {
            return id.split('-').pop();
        }
        return Util.uid();
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
            // Returns: <string> | <Buffer>
            const buf = fs.readFileSync(filePath);
            if (Buffer.isBuffer(buf)) {
                return buf.toString('utf8');
            }
            return buf;
        }
    },

    readFile: async (filePath) => {
        if (fs.existsSync(filePath)) {
            const buf = await readFile(filePath).catch((e) => {
                console.log(e);
            });
            if (Buffer.isBuffer(buf)) {
                return buf.toString('utf8');
            }
            return buf;
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
