const fs = require('fs');
const path = require('path');
const EC = require('eight-colors');
const Util = require('./utils/util.js');
const generateReport = require('./generate-report.js');
const defaultOptions = require('./default/options.js');
const { calculateSummary } = require('./common.js');

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

    const list = [];

    for (const item of reportDataList) {
        if (typeof item === 'string') {
            const data = Util.readJSONSync(item);
            if (!data) {
                EC.logRed(`[MCR] failed to read report data file: ${item}`);
                return;
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

    return list;
};

const mergeDataList = (dataList, options) => {

    const outputFile = options.outputFile;

    // init outputDir
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, {
            recursive: true
        });
    }
    // console.log(options);

    const dates = [];
    const endDates = [];
    const metadata = {};
    let systemTicks = [];

    const rows = [];
    const formatters = {};
    let jobs = [];

    dataList.forEach((item, i) => {

        dates.push(item.date);
        endDates.push(item.date + item.duration);

        // merge metadata (may collect from diff shard)
        Object.assign(metadata, item.metadata);

        // merge system ticks
        systemTicks = systemTicks.concat(item.system.ticks);

        // merge rows
        rows.push({
            // add shard level
            title: `Sharding ${i + 1}`,
            type: 'suite',
            suiteType: 'shard',
            tests: item.summary.tests.value,
            subs: item.rows
        });

        Object.assign(formatters, item.formatters);
        jobs = jobs.concat(item.jobs);

    });

    // base on first one
    const mergedData = {
        ... dataList.shift()
    };

    mergedData.system.ticks = systemTicks;

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

        outputFile: Util.relativePath(outputFile),
        outputDir: Util.relativePath(outputDir),

        metadata,

        rows,
        formatters,
        jobs

    });

    calculateSummary(mergedData, options);

    return mergedData;
};

module.exports = async (reportDataList, userOptions = {}) => {

    console.log('[MCR] merging report data ...');

    const dataList = await initDataList(reportDataList);
    if (!dataList) {
        return 1;
    }

    const options = {
        ... defaultOptions,
        ... userOptions
    };

    const reportData = await mergeDataList(dataList, options);

    return generateReport(reportData, options.onEnd);

};
