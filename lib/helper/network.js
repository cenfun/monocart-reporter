const fs = require('fs');
const path = require('path');
const EC = require('eight-colors');
const Util = require('../utils/util.js');

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

    const entries = log.entries;
    const summary = {
        requests: entries.length,
        size: 0,
        status: {},
        methods: {}
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
            bodySize, headersSize, content, status
        } = res;
        countField('status', status);

        const contentSize = Math.max(content.size, 0) || (Math.max(headersSize, 0) + Math.max(bodySize, 0));

        summary.size += contentSize;
    };

    entries.forEach((item) => {

        countRequest(item.request);
        countResponse(item.response);

    });

    return summary;
};

const saveNetworkHtmlReport = async (reportData, options) => {

    const reportDataFile = 'network-data.js';
    const jsFiles = ['monocart-code-viewer.js', 'monocart-formatter.js', 'monocart-network.js'];

    await Util.saveAttachmentHtmlReport(reportData, options, reportDataFile, jsFiles);

};

const attachNetworkReport = async (har, testInfo, options = {}) => {

    const harData = getHarData(har);
    if (!harData || !harData.log) {
        EC.logRed(`[MCR] failed to load HAR: ${har}`);
        return;
    }

    options = {
        outputDir: Util.getOutputDir(testInfo),
        outputName: `network-${Util.shortTestId(testInfo.testId)}`,
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
        title: `Network Report - ${testInfo.title}`,
        summary,
        ... harData
    };
    await saveNetworkHtmlReport(reportData, options);

    const report = {
        ... harData.log,
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

};


module.exports = {
    attachNetworkReport
};
