const fs = require('fs');
const { writeFile, readFile } = require('fs/promises');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const EC = require('eight-colors');
const CG = require('console-grid');
const Share = require('../platform/share.js');
const { deflateSync } = require('lz-utils');

const defaultOptions = require('../default/options.js');

const assetsName = 'assets';

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

    calculateSha1(buffer) {
        const hash = crypto.createHash('sha1');
        hash.update(buffer);
        return hash.digest('hex');
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

    resolveOutputDir: (testInfo, options) => {
        if (options && options.outputDir) {
            return options.outputDir;
        }
        const outputDir = testInfo.project.outputDir || testInfo.config.outputDir;
        if (outputDir) {
            return outputDir;
        }
        return path.resolve(testInfo.outputDir, '../');
    },

    resolveOutputFile: async (outputFile) => {
        // function to string first
        if (typeof outputFile === 'function') {
            outputFile = await outputFile();
        }
        // then check string
        if (!outputFile || typeof outputFile !== 'string') {
            outputFile = defaultOptions.outputFile;
        }
        return path.resolve(outputFile);
    },

    resolveLogging: (testInfo, options) => {
        if (options && options.logging) {
            return options.logging;
        }
        const reporterOptions = Util.resolveReporterOptions(testInfo);
        return reporterOptions.logging;
    },

    resolveReporterOptions: (testInfo) => {
        if (!testInfo) {
            return {};
        }
        const configReporters = testInfo.config.reporter;
        if (Array.isArray(configReporters)) {
            for (const item of configReporters) {
                if (Array.isArray(item)) {
                    const [name, options] = item;
                    if (name && name.indexOf('monocart-reporter') !== -1) {
                        return options || {};
                    }
                }
            }
        }
        return {};
    },

    resolveTestIdWithRetry: (testInfo) => {
        const id = Util.shortTestId(testInfo.testId);
        const retry = testInfo.retry;
        if (retry > 0) {
            return `${id}-retry${retry}`;
        }
        return id;
    },

    resolveArtifactSourcePath: (artifactsDir, id) => {
        const filename = `source-${id}.json`;
        const sourcePath = path.resolve(artifactsDir, filename);
        return sourcePath;
    },

    // empty or create dir
    initDir: (dirPath) => {
        if (fs.existsSync(dirPath)) {
            Util.rmSync(dirPath);
        }
        fs.mkdirSync(dirPath, {
            recursive: true
        });
    },

    initAssetsDir: async (options) => {
        const outputFile = await Util.resolveOutputFile(options.outputFile);
        const outputDir = path.dirname(outputFile);
        const assetsDir = path.resolve(outputDir, assetsName);
        Util.initDir(assetsDir);
    },

    resolveNodeModule: (p) => {

        // root
        const cwd = path.resolve('node_modules', p);
        if (fs.existsSync(cwd)) {
            return cwd;
        }

        // sub node modules
        const sub = path.resolve(__dirname, '../../node_modules', p);
        if (fs.existsSync(sub)) {
            return sub;
        }

        // same level dep
        const dep = path.resolve(__dirname, '../../../', p);
        if (fs.existsSync(dep)) {
            return dep;
        }

        Util.logError(`Not found module: ${p}`);

        return cwd;
    },

    resolvePackage: (p) => {
        return path.resolve(__dirname, '../packages', p);
    },

    saveHtmlReport: async (options) => {

        const {
            inline,
            reportData,
            jsFiles,
            assetsPath,
            outputDir,
            htmlFile,

            reportDataFile
        } = options;

        //  report data
        const reportDataCompressed = deflateSync(JSON.stringify(reportData));
        const reportDataStr = `window.reportData = '${reportDataCompressed}';`;

        // js libs
        const jsList = [];
        for (const jsFile of jsFiles) {
            const jsStr = await Util.readFile(jsFile);
            jsList.push({
                filename: path.basename(jsFile),
                str: jsStr
            });
        }

        // html content
        let htmlStr = '';
        const EOL = Util.getEOL();
        if (inline) {
            htmlStr = [
                '<script>',
                reportDataStr,
                ... jsList.map((it) => it.str),
                '</script>'
            ].join(EOL);
        } else {

            await Util.writeFile(path.resolve(outputDir, reportDataFile), reportDataStr);

            const assetsDir = path.resolve(outputDir, assetsPath);
            const relAssetsDir = Util.relativePath(assetsDir, outputDir);

            for (const item of jsList) {
                const filePath = path.resolve(assetsDir, item.filename);
                if (!fs.existsSync(filePath)) {
                    await Util.writeFile(filePath, item.str);
                }
            }

            htmlStr = [
                `<script src="${reportDataFile}"></script>`,
                ... jsList.map((it) => `<script src="${relAssetsDir}/${it.filename}"></script>`)
            ].join(EOL);
        }

        // html
        const htmlPath = path.resolve(outputDir, htmlFile);
        const template = Util.getTemplate(path.resolve(__dirname, '../default/template.html'));
        const html = Util.replace(template, {
            title: reportData.title,
            content: htmlStr
        });

        await Util.writeFile(htmlPath, html);

        return Util.relativePath(htmlPath);
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
            Util.logError('invalid JSON object');
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
                Util.logError(`read file: ${filePath} ${e.message || e}`);
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
            Util.logError(`write file: ${filePath} ${e.message || e}`);
        });
    },

    rmSync: (p) => {
        if (fs.existsSync(p)) {
            fs.rmSync(p, {
                recursive: true,
                force: true
            });
        }
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
                Util.logError(`not found template: ${templatePath}`);
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

    // ==========================================================================================

    loggingLevels: {
        off: 0,
        error: 10,
        info: 20,
        debug: 30
    },

    initLoggingLevel: (level, from = '') => {
        if (!level && Util.loggingType) {
            return;
        }
        const types = {
            off: 'off',
            error: 'error',
            info: 'info',
            debug: 'debug'
        };
        const type = types[level] || types.info;
        Util.loggingType = type;
        Util.loggingLevel = Util.loggingLevels[type];

        // console.log('=========================================');
        // console.log(from, Util.loggingType, Util.loggingLevel);
    },

    logError: (message) => {
        if (Util.loggingLevel < Util.loggingLevels.error) {
            return;
        }
        EC.logRed(`[MR] ${message}`);
    },

    logInfo: (message) => {
        if (Util.loggingLevel < Util.loggingLevels.info) {
            return;
        }
        console.log(`[MR] ${message}`);
    },

    // grid is info level
    logGrid: (gridData) => {
        if (Util.loggingLevel < Util.loggingLevels.info) {
            return;
        }
        CG(gridData);
    },

    logDebug: (message) => {
        if (Util.loggingLevel < Util.loggingLevels.debug) {
            return;
        }
        console.log(`[MR] ${message}`);
    },

    // time is debug level
    logTime: (message, time_start) => {
        if (Util.loggingLevel < Util.loggingLevels.debug) {
            return;
        }
        const duration = Date.now() - time_start;
        const durationH = Util.TSF(duration);
        const ls = [`[MR] ${message}`, ' ('];
        if (duration <= 100) {
            ls.push(EC.green(durationH));
        } else if (duration < 500) {
            ls.push(EC.yellow(durationH));
        } else {
            ls.push(EC.red(durationH));
        }
        ls.push(')');
        console.log(ls.join(''));
    }

};

module.exports = Util;
