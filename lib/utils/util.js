const fs = require('fs');
const { writeFile, readFile } = require('fs/promises');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const EC = require('eight-colors');
const CG = require('console-grid');
const Share = require('../platform/share.js');

const getDefaultOptions = require('../default/options.js');

const Util = {
    ... Share,

    EC,
    CG,

    root: process.cwd(),

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

    calculateId: (id) => {
        if (id) {
            return Util.calculateSha1(id).slice(0, 20);
        }
        return Util.uid();
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
        const reporterOptions = Util.resolveReporterOptions(testInfo);
        const outputFile = Util.resolveOutputFile(reporterOptions.outputFile);
        const outputDir = path.dirname(outputFile);
        return outputDir;
    },

    resolveOutputFile: (outputFile) => {

        // then check string
        if (!outputFile || typeof outputFile !== 'string') {
            outputFile = getDefaultOptions().outputFile;
        }

        // end with html
        if (!outputFile.endsWith('.html')) {
            outputFile = path.join(outputFile, 'index.html');
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

    // eslint-disable-next-line complexity
    resolveReporterOptions: (testInfo) => {
        if (Util.reporterOptions) {
            return Util.reporterOptions;
        }
        if (!testInfo) {
            return {};
        }
        const configReporters = testInfo.config.reporter;
        if (Array.isArray(configReporters)) {
            for (const item of configReporters) {
                if (Array.isArray(item)) {
                    const [name, options] = item;
                    if (name && name.indexOf('monocart-reporter') !== -1) {
                        Util.reporterOptions = options;
                        return options || {};
                    }
                }
            }
        }
        return {};
    },

    resolveTestIdWithRetry: (testInfo) => {
        const id = Util.calculateId(testInfo.testId);
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
    initDir: (dirPath, clean) => {

        if (clean) {
            if (fs.existsSync(dirPath)) {
                Util.rmSync(dirPath);
            }
        }

        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, {
                recursive: true
            });
        }
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
                force: true,
                maxRetries: 10
            });
        }
    },

    // eslint-disable-next-line complexity
    forEachFile: (dir, callback, shallow) => {
        if (!fs.existsSync(dir)) {
            return;
        }

        const isBreak = (res) => {
            return res === 'break' || res === false;
        };

        const dirs = [];
        const list = fs.readdirSync(dir, {
            withFileTypes: true
        });

        for (const item of list) {

            if (item.isFile()) {
                const res = callback(item.name, dir);
                if (isBreak(res)) {
                    return res;
                }
                continue;
            }

            if (item.isDirectory()) {
                dirs.push(path.resolve(dir, item.name));
            }

        }

        if (shallow) {
            return;
        }

        for (const subDir of dirs) {
            const res = Util.forEachFile(subDir, callback, shallow);
            if (isBreak(res)) {
                return res;
            }
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

    getDuration: (dateRanges, durationStrategy) => {

        if (durationStrategy === 'exclude-idle') {

            dateRanges.sort((a, b) => {
                if (a.start === b.start) {
                    return a.end - b.end;
                }
                return a.start - b.start;
            });

            dateRanges.reduce((prevRange, range) => {
                // same start
                if (range.start === prevRange.start) {
                    range.dedupe = true;
                    // equal prev
                    if (range.end === prevRange.end) {
                        return prevRange;
                    }
                    // great than the prev end, update the end
                    prevRange.end = range.end;
                    return prevRange;
                }

                // already in the range
                if (range.end <= prevRange.end) {
                    range.dedupe = true;
                    return prevRange;
                }

                // collected, update the end
                if (range.start <= prevRange.end) {
                    range.dedupe = true;
                    prevRange.end = range.end;
                    return prevRange;
                }

                return range;

            });

            const ranges = dateRanges.filter((it) => !it.dedupe);
            // console.log(ranges);
            let duration = 0;
            ranges.forEach((item) => {
                duration += item.end - item.start;
            });

            return duration;
        }
        // normal
        const dateStart = Math.min.apply(null, dateRanges.map((it) => it.start));
        const endDate = Math.max.apply(null, dateRanges.map((it) => it.end));
        const duration = endDate - dateStart;
        return duration;
    },

    addTimezoneOffset: (timestamp, offset = 0) => {
        // in minutes
        return Util.toNum(timestamp) + Util.toNum(offset) * 60 * 1000;
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

    cmpVersion: (v1, v2) => {
        const [strMajor1, strMinor1, strPatch1] = `${v1}`.split('.');
        const [strMajor2, strMinor2, strPatch2] = `${v2}`.split('.');
        const strList = [strMajor1, strMinor1, strPatch1, strMajor2, strMinor2, strPatch2];
        const list = strList.map((str) => Util.toNum(parseInt(str)));
        const [major1, minor1, patch1, major2, minor2, patch2] = list;
        if (major1 === major2) {
            if (minor1 === minor2) {
                return patch1 - patch2;
            }
            return minor1 - minor2;
        }
        return major1 - major2;
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
