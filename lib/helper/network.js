const fs = require('fs');
const path = require('path');
const EC = require('eight-colors');
const Util = require('../utils/util.js');
const compress = require('lz-utils/lib/compress.js');

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

const saveNetworkHtmlReport = async (reportData, networkDir, inline) => {

    //  network data
    const networkDataFile = 'network-data.js';
    const reportDataStr = compress(JSON.stringify(reportData));
    const networkData = `window.reportData = '${reportDataStr}';`;

    // js lib
    const networkLibFile = 'monocart-network.js';
    const networkLibPath = path.resolve(__dirname, `../runtime/${networkLibFile}`);
    const networkLib = await Util.readFile(networkLibPath);
    if (!networkLib) {
        EC.logRed(`[MCR] not found runtime lib: ${Util.formatPath(networkLibPath)}`);
    }

    // html content
    let htmlStr = '';
    if (inline) {
        htmlStr = ['<script>', networkData, networkLib, '</script>'].join('\n');
    } else {
        await Util.writeFile(path.resolve(networkDir, networkDataFile), networkData);
        await Util.writeFile(path.resolve(networkDir, networkLibFile), networkLib);
        htmlStr = [
            `<script src="${networkDataFile}"></script>`,
            `<script src="${networkLibFile}"></script>`
        ].join('\n');
    }

    // html
    const htmlPath = path.resolve(networkDir, 'index.html');
    const template = Util.getTemplate(path.resolve(__dirname, '../default/template.html'));
    const html = Util.replace(template, {
        title: reportData.title,
        content: htmlStr
    });

    await Util.writeFile(htmlPath, html);

};


const attachNetworkReport = async (har, testInfo, options = {}) => {

    options = {
        inline: true,
        ... options
    };

    const harData = getHarData(har);
    if (!harData || !harData.log) {
        EC.logRed(`[MCR] failed to load HAR: ${har}`);
        return;
    }

    const outputDir = testInfo.outputDir;
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, {
            recursive: true
        });
    }

    const networkDir = path.resolve(outputDir, 'network');
    if (!fs.existsSync(networkDir)) {
        fs.mkdirSync(networkDir);
    }

    const summary = getNetworkSummary(harData.log);

    // save har
    const reportData = {
        title: `Network Report - ${testInfo.title}`,
        summary,
        ... harData
    };
    await saveNetworkHtmlReport(reportData, networkDir, options.inline);

    const report = {
        ... harData.log,
        summary
    };
    delete report.entries;

    // save report
    const definition = Util.attachments.network;
    const reportPath = path.resolve(networkDir, definition.reportFile);
    Util.writeJSONSync(reportPath, report);

    testInfo.attachments.push({
        name: definition.name,
        contentType: definition.contentType,
        path: path.resolve(networkDir, 'index.html')
    });

};


module.exports = {
    attachNetworkReport
};
