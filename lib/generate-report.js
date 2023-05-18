const fs = require('fs');
const path = require('path');
const EC = require('eight-colors');
const CG = require('console-grid');
const { deflateSync } = require('lz-utils');
const { nodemailer } = require('./runtime/monocart-vendor.js');
const Util = require('./utils/util.js');
const emailPlugin = require('./plugins/email.js');

// ===========================================================================

const generateJson = (outputDir, filename, reportData) => {
    let jsonPath = path.resolve(outputDir, `${filename}.json`);
    Util.writeJSONSync(jsonPath, reportData);
    jsonPath = Util.relativePath(jsonPath);
    console.log(`[MCR] json report: ${EC.cyan(jsonPath)}`);
    return jsonPath;
};

const generateHtml = (outputDir, filename, reportData) => {
    const reportDistPath = path.resolve(__dirname, 'runtime/monocart-reporter.js');
    const errMsg = `Not found runtime lib: ${Util.formatPath(reportDistPath)}`;

    let reportJs = `console.error("${errMsg}");`;
    if (fs.existsSync(reportDistPath)) {
        reportJs = Util.readFileSync(reportDistPath);
    } else {
        EC.logRed(errMsg);
    }

    const reportDataStr = deflateSync(JSON.stringify(reportData));
    const content = `<script>\nwindow.reportData = '${reportDataStr}';\n${reportJs}\n</script>`;

    // replace template
    let html = Util.getTemplate(path.resolve(__dirname, 'default/template.html'));
    html = Util.replace(html, {
        title: reportData.name,
        content: content
    });

    let htmlPath = path.resolve(outputDir, `${filename}.html`);
    Util.writeFileSync(htmlPath, html);
    htmlPath = Util.relativePath(htmlPath);
    console.log(`[MCR] html report: ${EC.cyan(htmlPath)}`);

    const cmd = `npx monocart show-report ${htmlPath}`;
    console.log(`[MCR] view report: ${EC.cyan(cmd)}`);

    return htmlPath;
};

const sendEmail = (emailOptions) => {
    if (!emailOptions.transport || !emailOptions.message) {
        EC.logRed('[MCR] invalid email options, transport and message are required (https://nodemailer.com/)');
        return;
    }
    console.log('[MCR] sending email ...');
    const transporter = nodemailer.createTransport(emailOptions.transport);
    return transporter.sendMail(emailOptions.message);
};

const showTestResults = (reportData) => {
    console.log(`[MCR] test results: ${EC.cyan(reportData.name)}`);

    const summary = reportData.summary;

    const colorHandler = (item, v) => {
        if (item.id === 'failed') {
            if (item.value > 0) {
                v = EC.red(v);
            }

        } else if (item.id === 'flaky') {
            if (item.value > 0) {
                v = EC.yellow(v);
            }
        } else if (item.id === 'passed') {
            if (summary.failed.value === 0 && summary.passed.value > 0) {
                v = EC.green(v);
            }
        }
        return v;
    };

    let rows = [];

    const caseTypes = reportData.caseTypes;
    const suiteSubs = reportData.suiteTypes.map((item) => `${item}s`);

    Object.values(summary).forEach((item) => {
        if (caseTypes.includes(item.id) || suiteSubs.includes(item.id)) {
            return;
        }
        rows.push({
            ... item
        });
    });

    const tests = rows.find((it) => it.id === 'tests');
    tests.subs = caseTypes.map((k) => {
        const item = {
            ... summary[k]
        };
        const value = `${item.value}`.padEnd(`${tests.value}`.length, ' ');
        const percent = `(${item.percent})`;
        return {
            name: colorHandler(item, item.name),
            value: colorHandler(item, `${value} ${percent}`)
        };
    });

    const suites = rows.find((it) => it.id === 'suites');
    suites.subs = suiteSubs.map((k) => {
        return {
            ... summary[k]
        };
    });

    rows = rows.concat([{
        name: 'Playwright',
        value: `v${reportData.system.playwright}`
    }, {
        name: 'Date',
        value: new Date(reportData.date).toLocaleString()
    }, {
        name: 'Duration',
        value: Util.TF(reportData.duration)
    }]);

    CG({
        options: {
            headerVisible: false
        },
        columns: [{
            id: 'name'
        }, {
            id: 'value'
        }],
        rows
    });
};


const generateReport = (reportData, onEnd) => {

    console.log('[MCR] generating test report ...');
    showTestResults(reportData);

    const {
        outputFile, outputDir, artifacts
    } = reportData;

    if (artifacts) {
        artifacts.forEach((report) => {
            console.log(`[MCR] ${report.type} report: ${EC.cyan(report.htmlPath)}`);

            // convert htmlPath to relative reporter
            report.htmlPath = Util.relativePath(report.htmlPath, outputDir);

        });
    }

    // console.log(reportData);
    const filename = path.basename(outputFile, '.html');
    // generate json
    const jsonPath = generateJson(outputDir, filename, reportData);
    // generate html
    const htmlPath = generateHtml(outputDir, filename, reportData);

    // onEnd callback
    if (typeof onEnd !== 'function') {
        return;
    }

    // for onEnd after saved
    Object.assign(reportData, {
        filename,
        htmlPath,
        jsonPath
    });

    // generate email data
    emailPlugin(reportData);

    // forEach rows API
    const forEach = (callback) => {
        Util.forEach(reportData.rows, callback);
    };

    return onEnd(reportData, {
        sendEmail,
        forEach
    });

};

module.exports = generateReport;
