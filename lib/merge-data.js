const fs = require('fs');
const path = require('path');
const Util = require('./utils/util.js');
const generateReport = require('./generate-report.js');
const getDefaultOptions = require('./default/options.js');
const { calculateSummary, getTrends } = require('./common.js');
const { mergeGlobalCoverageReport } = require('./plugins/coverage/coverage.js');

const checkReportData = (item) => {
    if (item && typeof item === 'object') {
        if (item.rows && item.columns && item.summary) {
            return true;
        }
    }
};

const initDataList = (reportDataList) => {
    if (!Util.isList(reportDataList)) {
        Util.logError(`invalid report data list: ${reportDataList}`);
        return;
    }

    let hasError = false;
    const list = [];

    for (const item of reportDataList) {
        if (typeof item === 'string') {
            const data = Util.readJSONSync(item);
            if (!data) {
                hasError = true;
                Util.logError(`failed to read report data file: ${item}`);
                continue;
            }

            // for finding attachments
            data.jsonDir = path.dirname(item);

            list.push(data);
            Util.logInfo(`report data loaded: ${item}`);
            continue;
        }

        if (!checkReportData(item)) {
            Util.logError(`unmatched report data format: ${item}`);
            return;
        }

        item.jsonDir = item.outputDir;

        list.push(item);
    }

    if (hasError) {
        return;
    }

    return list;
};

const copyTarget = (targetPath, fromDir, toDir) => {
    const oldPath = path.resolve(fromDir, targetPath);
    if (fs.existsSync(oldPath)) {
        const newPath = path.resolve(toDir, targetPath);
        fs.cpSync(oldPath, newPath, {
            force: true,
            recursive: true
        });
    }
};

const attachmentsHandler = (item, outputDir, attachmentPathHandler) => {

    const jsonDir = item.jsonDir;

    const extras = Util.getAttachmentPathExtras(item);
    Util.forEach(item.rows, (row) => {
        if (row.type !== 'case' || !row.attachments) {
            return;
        }
        row.attachments.forEach((attachment) => {
            if (!attachment.path) {
                return;
            }

            // copy attachment
            copyTarget(attachment.path, jsonDir, outputDir);

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
    const coverageRawList = [];
    artifactsList.forEach((item) => {
        const jsonDir = item.jsonDir;

        item.artifacts.forEach((art) => {

            const targetDirName = path.dirname(art.path);
            // console.log(targetDir);

            // merge global coverage
            if (art.global && art.type === 'coverage') {

                const rawDir = path.resolve(jsonDir, targetDirName, 'raw');
                if (fs.existsSync(rawDir)) {
                    coverageRawList.push(rawDir);
                    return;
                }

            }

            // copy all files in art dir, like network, audit
            copyTarget(targetDirName, jsonDir, outputDir);

            artifacts.push(art);

        });

        // copy assets dir
        if (artifacts.length) {
            copyTarget('assets', jsonDir, outputDir);
        }

    });

    if (coverageRawList.length) {
        const coverage = await mergeGlobalCoverageReport(coverageRawList, options);
        if (coverage) {
            artifacts.push(coverage);
        }
    }

    return artifacts;
};

const mergeDataList = async (dataList, options) => {

    const trends = await getTrends(options.trend);

    const outputFile = await Util.resolveOutputFile(options.outputFile);
    // init outputDir
    const outputDir = path.dirname(outputFile);
    // clean
    if (fs.existsSync(outputDir)) {
        fs.rmSync(outputDir, {
            recursive: true,
            force: true,
            maxRetries: 10
        });
    }

    fs.mkdirSync(outputDir, {
        recursive: true
    });
    // for attachment path handler
    options.outputDir = outputDir;

    const attachmentPathHandler = typeof options.attachmentPath === 'function' ? options.attachmentPath : null;

    const dates = [];
    const endDates = [];
    const metadata = {};
    const system = [];
    const rows = [];
    const artifactsList = [];

    for (const item of dataList) {

        attachmentsHandler(item, outputDir, attachmentPathHandler);

        dates.push(item.date);
        endDates.push(item.date + item.duration);

        // merge metadata (may collect from diff shard)
        Object.assign(metadata, item.metadata);

        // merge system
        system.push(item.system);

        // merge rows
        rows.push({
            // add shard level suite
            title: item.system.hostname,
            type: 'suite',
            suiteType: 'shard',
            caseNum: item.summary.tests.value,
            subs: item.rows
        });

        if (item.artifacts) {
            artifactsList.push({
                jsonDir: item.jsonDir,
                artifacts: item.artifacts
            });
        }

    }

    const artifacts = await mergeArtifacts(artifactsList, options);

    // base on first one
    const mergedData = {
        ... dataList.shift()
    };

    // merge new options
    ['traceViewerUrl', 'mermaid'].forEach((k) => {
        if (Util.hasOwn(options, k)) {
            mergedData[k] = options[k];
        }
    });

    const reportName = options.name || mergedData.name;

    const date = Math.min.apply(null, dates);
    const dateH = new Date(date).toLocaleString();

    const endDate = Math.max.apply(null, endDates);
    const duration = endDate - date;
    const durationH = Util.TF(duration);

    Object.assign(mergedData, {
        name: reportName,

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

    const dataList = await initDataList(reportDataList);
    if (!dataList) {
        return;
    }

    const options = {
        ... getDefaultOptions(),
        ... userOptions
    };

    const reportData = await mergeDataList(dataList, options);
    // console.log(reportData.artifacts);

    return generateReport(reportData, options);

};
