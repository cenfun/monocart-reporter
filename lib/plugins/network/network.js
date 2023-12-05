const fs = require('fs');
const path = require('path');
const Util = require('../../utils/util.js');

const getHarData = (har) => {
    if (typeof har === 'string') {
        if (!fs.existsSync(har)) {
            return;
        }
        return Util.readJSONSync(har);
    }
    if (Buffer.isBuffer(har)) {
        return JSON.parse(har.toString('utf-8'));
    }
};

// http://www.softwareishard.com/blog/har-12-spec/
const getNetworkSummary = (log) => {

    const { entries, pages } = log;

    const waterfalls = {};
    pages.forEach((page) => {
        const pageTimings = page.pageTimings;
        const timestampStart = new Date(page.startedDateTime).getTime();
        const time = Math.max(pageTimings.onContentLoad, pageTimings.onLoad) || 0;
        waterfalls[page.id] = {
            timestampStart,
            start: 0,
            time,
            ... pageTimings,
            entries: []
        };
    });

    const summary = {
        requests: entries.length,
        size: 0,
        status: {},
        methods: {},
        waterfalls
    };

    const countField = (k, v) => {
        if (summary[k][v]) {
            summary[k][v] += 1;
        } else {
            summary[k][v] = 1;
        }
    };

    const countRequest = (req) => {
        const {
            bodySize, headersSize, method
        } = req;
        countField('methods', method);

        summary.size += Math.max(bodySize, 0) + Math.max(headersSize, 0);
    };

    const countResponse = (res) => {
        const {
            bodySize, headersSize, status
        } = res;
        countField('status', status);

        summary.size += (Math.max(headersSize, 0) + Math.max(bodySize, 0));
    };

    const countWaterfall = (entry) => {

        const pageWaterfall = waterfalls[entry.pageref];

        const timestampStart = new Date(entry.startedDateTime).getTime();
        const entryWaterfall = {
            start: timestampStart - pageWaterfall.timestampStart,
            time: Math.max(entry.time, 0),
            ... entry.timings
        };

        pageWaterfall.time = Math.max(pageWaterfall.time, entryWaterfall.start + entryWaterfall.time);
        pageWaterfall.entries.push(entryWaterfall);

    };

    entries.forEach((entry) => {

        countRequest(entry.request);
        countResponse(entry.response);
        countWaterfall(entry);

    });

    return summary;
};

const saveNetworkHtmlReport = async (reportData, _options) => {

    const { htmlDir, inline } = _options;

    // 'turbogrid' is in common
    const jsFiles = ['monocart-code-viewer', 'monocart-formatter'].map((it) => {
        return path.resolve(`node_modules/${it}/dist/${it}.js`);
    });

    jsFiles.push(path.resolve(__dirname, '../../packages/monocart-common.js'));
    jsFiles.push(path.resolve(__dirname, '../../packages/monocart-network.js'));

    const options = {
        inline,
        reportData,
        jsFiles,
        assetsPath: '../assets',
        outputDir: htmlDir,
        htmlFile: 'index.html',

        reportDataFile: 'network-data.js'
    };

    const htmlPath = await Util.saveHtmlReport(options);

    return htmlPath;
};

const attachNetworkReport = async (har, testInfo, options = {}) => {

    const logging = Util.resolveLogging(testInfo, options);
    Util.initLoggingLevel(logging, 'network');

    const harData = getHarData(har);
    if (!harData || !harData.log) {
        Util.logError(`failed to load HAR: ${har}`);
        return;
    }

    options = {
        // default title
        title: `Network Report - ${testInfo.title}`,
        outputDir: Util.resolveOutputDir(testInfo, options),
        outputName: `network-${Util.resolveTestIdWithRetry(testInfo)}`,
        inline: false,
        ... options
    };

    const htmlDir = path.resolve(options.outputDir, options.outputName);
    if (!fs.existsSync(htmlDir)) {
        fs.mkdirSync(htmlDir, {
            recursive: true
        });
    }
    options.htmlDir = htmlDir;

    const summary = getNetworkSummary(harData.log);

    // save har
    const reportData = {
        title: options.title,
        summary,
        ... harData
    };

    const htmlPath = await saveNetworkHtmlReport(reportData, options);

    const report = {
        title: options.title,
        ... harData.log,
        htmlPath,
        summary
    };
    delete report.entries;

    // save report
    const definition = Util.attachments.network;
    const reportPath = path.resolve(htmlDir, definition.reportFile);
    Util.writeJSONSync(reportPath, report);

    testInfo.attachments.push({
        name: definition.name,
        contentType: definition.contentType,
        path: path.resolve(htmlDir, 'index.html')
    });

    return report;
};

module.exports = {
    attachNetworkReport
};
