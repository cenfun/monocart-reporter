const fs = require('fs');
const path = require('path');
const EC = require('eight-colors');
const Util = require('./utils/util.js');
const generateReport = require('./generate-report.js');
const defaultOptions = require('./default/options.js');
const { calculateSummary, getTrends } = require('./common.js');

const checkReportData = (item) => {
    if (item && typeof item === 'object') {
        if (Util.isList(item.rows) && Util.isList(item.columns) && item.summary) {
            return true;
        }
    }
};

const initDataList = (reportDataList) => {
    if (!Util.isList(reportDataList)) {
        EC.logRed(`[MCR] invalid report data list: ${reportDataList}`);
        return;
    }

    let hasError = false;
    const list = [];

    for (const item of reportDataList) {
        if (typeof item === 'string') {
            const data = Util.readJSONSync(item);
            if (!data) {
                hasError = true;
                EC.logRed(`[MCR] failed to read report data file: ${item}`);
                continue;
            }
            list.push(data);
            EC.logGreen(`[MCR] report data loaded: ${item}`);
            continue;
        }

        if (!checkReportData(item)) {
            EC.logRed(`[MCR] unmatched report data format: ${item}`);
            return;
        }
        list.push(item);
    }

    if (hasError) {
        return;
    }

    return list;
};

const attachmentsHandler = (data, attachmentPathHandler) => {
    if (!attachmentPathHandler) {
        return;
    }
    const extras = Util.getAttachmentPathExtras(data);
    Util.forEach(data.rows, (item) => {
        if (item.type !== 'case' || !item.attachments) {
            return;
        }
        item.attachments.forEach((attachment) => {
            if (!attachment.path) {
                return;
            }
            const newPath = attachmentPathHandler(attachment.path, extras);
            if (!newPath) {
                return;
            }
            attachment.path = newPath;
        });
    });
};

const mergeDataList = async (dataList, options) => {

    const trends = await getTrends(options.trend);

    const outputFile = options.outputFile;
    // init outputDir
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, {
            recursive: true
        });
    }
    // for attachment path handler
    options.outputDir = outputDir;

    const attachmentPathHandler = typeof options.attachmentPath === 'function' ? options.attachmentPath : null;

    const dates = [];
    const endDates = [];
    const metadata = {};
    const system = [];
    const rows = [];

    dataList.forEach((item, i) => {

        attachmentsHandler(item, attachmentPathHandler);

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

    });

    // base on first one
    const mergedData = {
        ... dataList.shift()
    };

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

        rows
    });

    // tag style can be rewrite with new options tags
    options.tags = options.tags || mergedData.tags;
    calculateSummary(mergedData, options);

    return mergedData;
};

module.exports = async (reportDataList, userOptions = {}) => {

    console.log('[MCR] merging report data ...');

    const dataList = await initDataList(reportDataList);
    if (!dataList) {
        return;
    }

    const options = {
        ... defaultOptions,
        ... userOptions
    };

    const reportData = await mergeDataList(dataList, options);

    return generateReport(reportData, options.onEnd);

};
