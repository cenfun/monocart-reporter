const fs = require('fs');
const path = require('path');
const Util = require('./utils/util.js');
const generateReport = require('./generate-report.js');
const getDefaultOptions = require('./default/options.js');
const { calculateSummary, getTrends } = require('./common.js');
const { mergeGlobalCoverageReport } = require('./plugins/coverage/coverage.js');
const { StreamZip } = require('./packages/monocart-reporter-vendor.js');

const checkReportData = (item) => {
    if (item && typeof item === 'object') {
        if (item.rows && item.columns && item.summary) {
            return true;
        }
    }
};

const unzipDataFile = async (item, num, options) => {

    if (!options.cacheDir) {
        options.cacheDir = path.resolve(options.outputDir, '.cache');
    }

    const unzipDir = path.resolve(options.cacheDir, `extracted-${num}`);

    fs.mkdirSync(unzipDir, {
        recursive: true
    });

    const zip = new StreamZip({
        file: item
    });

    await zip.extract(null, unzipDir);

    // Do not forget to close the file once you're done
    await zip.close();

    const filename = path.basename(item, '.zip');
    let jsonPath = path.resolve(unzipDir, `${filename}.json`);
    if (fs.existsSync(jsonPath)) {
        return jsonPath;
    }

    // filename for both html and json
    const htmlMap = {};
    const jsonMap = {};
    Util.forEachFile(unzipDir, (name, dir) => {
        if (name.endsWith('.html')) {
            htmlMap[path.basename(name, '.html')] = true;
        } else if (name.endsWith('.json')) {
            jsonMap[path.basename(name, '.json')] = true;
        }
    }, true);

    const keys = Object.keys(htmlMap);
    for (const fn of keys) {
        if (jsonMap[fn]) {
            jsonPath = path.resolve(unzipDir, `${fn}.json`);
            break;
        }
    }

    return jsonPath;
};

const getReportData = async (item, num, options) => {
    if (typeof item === 'string') {

        // json or zip path
        const extname = path.extname(item);
        if (extname === '.zip') {
            item = await unzipDataFile(item, num, options);
            // console.log(item);
        }

        // json path
        const data = Util.readJSONSync(item);
        if (!data) {
            Util.logError(`failed to read report data file: ${item}`);
            return;
        }

        // for finding attachments
        const jsonDir = Util.relativePath(path.dirname(item));

        Util.logInfo(`report data loaded: ${Util.relativePath(item)}`);
        return {
            jsonDir,
            data
        };
    }

    if (!checkReportData(item)) {
        Util.logError(`unmatched report data format: ${item}`);
        return;
    }

    // json
    return {
        jsonDir: item.outputDir,
        data: item
    };
};

const initDataList = async (reportDataList, options) => {
    if (!Util.isList(reportDataList)) {
        Util.logError(`invalid report data list: ${reportDataList}`);
        return;
    }

    let hasError = false;
    const list = [];

    let num = 1;
    for (const item of reportDataList) {

        const data = await getReportData(item, num, options);
        if (!data) {
            hasError = true;
            break;
        }
        num += 1;

        list.push(data);
    }

    if (hasError) {
        return;
    }

    // sort list

    list.sort((a, b) => {
        if (a.jsonDir > b.jsonDir) {
            return 1;
        }
        return -1;
    });

    // console.log(list.map((it) => it.jsonDir));

    return list;
};

const copyTarget = (targetPath, fromDir, toDir) => {
    const oldPath = path.resolve(fromDir, targetPath);
    if (fs.existsSync(oldPath)) {
        const newPath = path.resolve(toDir, targetPath);
        if (oldPath !== newPath) {
            fs.cpSync(oldPath, newPath, {
                force: true,
                recursive: true
            });
            return true;
        }
    }
};

const attachmentsHandler = (data, jsonDir, outputDir, attachmentPathHandler) => {

    const extras = Util.getAttachmentPathExtras(data);
    Util.forEach(data.rows, (row) => {
        if (row.type !== 'case' || !row.attachments) {
            return;
        }
        row.attachments.forEach((attachment) => {
            if (!attachment.path) {
                return;
            }

            // copy attachment
            const done = copyTarget(attachment.path, jsonDir, outputDir);
            if (!done) {
                Util.logError(`failed to copy: ${attachment.path}`);
            }

            if (attachmentPathHandler) {
                const newPath = attachmentPathHandler(attachment.path, extras);
                if (newPath) {
                    attachment.path = newPath;
                }
            }
        });
    });
};

const mergeArtifacts = async (artifactsList, options) => {

    const outputDir = options.outputDir;

    const artifacts = [];
    const coverageList = [];
    const coverageRawList = [];

    const jsonDirMap = {};

    artifactsList.forEach((item) => {
        const jsonDir = item.jsonDir;
        let hasAssets = false;
        item.artifacts.forEach((art) => {

            // merge global coverage
            if (art.global && art.type === 'coverage') {
                coverageList.push({
                    jsonDir,
                    art
                });
                if (art.rawDir) {
                    const rawDir = path.resolve(jsonDir, art.rawDir);
                    if (fs.existsSync(rawDir)) {
                        coverageRawList.push(rawDir);
                    }
                }
                return;
            }

            const targetDirName = path.dirname(art.path);
            // copy all files in art dir, like network, audit
            copyTarget(targetDirName, jsonDir, outputDir);
            hasAssets = true;

            // update path relative to cwd/root
            art.path = Util.relativePath(path.resolve(outputDir, art.path));

            artifacts.push(art);

        });

        // copy assets dir
        if (hasAssets) {
            copyTarget('assets', jsonDir, outputDir);
            jsonDirMap[jsonDir] = true;
        }

    });

    // merge global coverage raws
    if (coverageRawList.length) {
        const coverage = await mergeGlobalCoverageReport(coverageRawList, options);
        if (coverage) {
            artifacts.push(coverage);
        }
    } else {

        // copy single one art
        const item = coverageList.find((it) => it.art.path);
        if (item) {
            const { art, jsonDir } = item;

            const targetDirName = path.dirname(art.path);
            // copy all files in art dir, like network, audit
            copyTarget(targetDirName, jsonDir, outputDir);

            if (!jsonDirMap[jsonDir]) {
                copyTarget('assets', jsonDir, outputDir);
            }

            // update path relative to cwd/root
            art.path = Util.relativePath(path.resolve(outputDir, art.path));

            artifacts.push(art);
        }
    }

    return artifacts;
};

const mergeDataList = async (dataList, options) => {

    const { outputFile, outputDir } = options;

    const trends = await getTrends(options.trend);

    const attachmentPathHandler = typeof options.attachmentPath === 'function' ? options.attachmentPath : null;

    const startDates = [];
    const dateRanges = [];
    const metadata = {};
    const system = [];
    const rows = [];
    const artifactsList = [];

    for (const dataItem of dataList) {

        const { data, jsonDir } = dataItem;

        attachmentsHandler(data, jsonDir, outputDir, attachmentPathHandler);

        startDates.push(data.date);
        dateRanges.push({
            start: data.date,
            end: data.date + data.duration
        });

        // merge metadata (may collect from diff shard)
        Object.assign(metadata, data.metadata);

        // merge system
        system.push(data.system);

        // merge rows
        rows.push({
            // add shard level suite
            title: data.system.hostname,
            type: 'suite',
            suiteType: 'shard',
            caseNum: data.summary.tests.value,
            subs: data.rows
        });

        if (data.artifacts) {
            artifactsList.push({
                jsonDir,
                artifacts: data.artifacts
            });
        }

    }

    const artifacts = await mergeArtifacts(artifactsList, options);

    // base on first one, do not change dataList (need for onData)
    const mergedData = {
        ... dataList[0].data
    };

    // merge new options
    ['traceViewerUrl', 'mermaid', 'timezoneOffset', 'locale'].forEach((k) => {
        if (Util.hasOwn(options, k)) {
            mergedData[k] = options[k];
        }
    });

    const reportName = options.name || mergedData.name;
    const reportLogo = options.logo || mergedData.logo;

    const date = Math.min.apply(null, startDates);

    const timezoneDate = Util.addTimezoneOffset(date, mergedData.timezoneOffset);
    const dateH = Util.dateFormat(timezoneDate, mergedData.locale);

    const duration = Util.getDuration(dateRanges, options.durationStrategy);
    const durationH = Util.TF(duration);

    Object.assign(mergedData, {
        name: reportName,
        logo: reportLogo,

        date,
        dateH,
        duration,
        durationH,

        // for current merge process
        cwd: Util.formatPath(process.cwd()),
        outputFile: Util.relativePath(outputFile),
        outputDir: Util.relativePath(outputDir),

        metadata,
        // system is array in shard mode, because have multiple machines
        system,
        trends,

        rows,

        artifacts
    });

    // tag style can be rewrite with new options tags
    options.tags = options.tags || mergedData.tags;
    calculateSummary(mergedData, options);

    return mergedData;
};

module.exports = async (reportDataList, userOptions = {}) => {

    Util.initLoggingLevel(userOptions.logging, 'merge');

    Util.logInfo('merging report data ...');

    const options = {
        ... getDefaultOptions(),
        ... userOptions
    };

    // init options
    const outputFile = Util.resolveOutputFile(options.outputFile);
    options.outputFile = outputFile;
    // init outputDir
    const outputDir = path.dirname(outputFile);
    // clean
    Util.initDir(outputDir, options.clean);
    // for attachment path handler
    options.outputDir = outputDir;

    const dataList = await initDataList(reportDataList, options);
    if (!dataList) {
        return;
    }

    const reportData = await mergeDataList(dataList, options);
    // console.log(reportData.artifacts);

    const rawData = dataList.map((it) => it.data);
    return generateReport(reportData, options, rawData);

};
