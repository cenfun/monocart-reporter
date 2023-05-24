const path = require('path');
const EC = require('eight-colors');
const CG = require('console-grid');
const { nodemailer } = require('./runtime/monocart-vendor.js');
const Util = require('./utils/util.js');
const emailPlugin = require('./plugins/email.js');

// ===========================================================================

const generateJson = (outputDir, htmlFile, reportData) => {
    const filename = path.basename(htmlFile, '.html');
    let jsonPath = path.resolve(outputDir, `${filename}.json`);
    Util.writeJSONSync(jsonPath, reportData);
    jsonPath = Util.relativePath(jsonPath);
    console.log(`[MCR] json report: ${EC.cyan(jsonPath)}`);
    return jsonPath;
};

const generateHtml = async (outputDir, htmlFile, reportData, inline) => {

    const options = {
        inline,
        reportData,
        jsFiles: ['monocart-common.js', 'monocart-reporter.js'],
        htmlDir: outputDir,
        htmlFile,

        outputDir,
        reportDataFile: 'report-data.js',
        assetsName: 'assets',
        assetsRelative: ''
    };

    const htmlPath = await Util.saveHtmlReport(options);
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


const generateReport = async (reportData, options) => {

    console.log('[MCR] generating test report ...');
    showTestResults(reportData);

    const {
        outputFile, outputDir, artifacts
    } = reportData;

    if (artifacts) {
        artifacts.forEach((report) => {
            const g = report.global ? `${EC.magenta('(global)')}` : '';
            console.log(`[MCR] ${report.name}: ${EC.cyan(report.path)} ${report.title} ${g}`);
            // convert path to relative reporter
            report.path = Util.relativePath(report.path, outputDir);
        });
    }

    // console.log(reportData);
    const htmlFile = path.basename(outputFile);

    // generate json
    const jsonPath = await generateJson(outputDir, htmlFile, reportData);

    // generate html
    let inline = true;
    if (typeof options.inline === 'boolean') {
        inline = options.inline;
    }
    const htmlPath = await generateHtml(outputDir, htmlFile, reportData, inline);

    // onEnd callback
    const onEnd = options.onEnd;
    if (typeof onEnd !== 'function') {
        return;
    }

    // for onEnd after saved
    Object.assign(reportData, {
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
