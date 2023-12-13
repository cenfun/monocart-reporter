const path = require('path');
const EC = require('eight-colors');
const nodemailer = require('nodemailer');
const Util = require('./utils/util.js');
const emailPlugin = require('./plugins/email.js');

// ===========================================================================

const generateJson = (outputDir, htmlFile, reportData) => {
    const filename = path.basename(htmlFile, '.html');
    let jsonPath = path.resolve(outputDir, `${filename}.json`);
    Util.writeJSONSync(jsonPath, reportData);
    jsonPath = Util.relativePath(jsonPath);
    return jsonPath;
};

const generateHtml = async (outputDir, htmlFile, reportData, inline) => {

    // deps
    const jsFiles = ['turbogrid'].map((it) => {
        return Util.resolveNodeModule(`${it}/dist/${it}.js`);
    });

    jsFiles.push(Util.resolvePackage('monocart-common.js'));
    jsFiles.push(Util.resolvePackage('monocart-reporter.js'));

    const options = {
        inline,
        reportData,
        jsFiles,
        assetsPath: './assets',
        outputDir,
        htmlFile,

        reportDataFile: 'report-data.js'
    };

    const htmlPath = await Util.saveHtmlReport(options);

    return htmlPath;
};

const sendEmail = (emailOptions) => {
    if (!emailOptions.transport || !emailOptions.message) {
        Util.logError('invalid email options, transport and message are required (https://nodemailer.com/)');
        return;
    }
    Util.logInfo('sending email ...');
    const transporter = nodemailer.createTransport(emailOptions.transport);
    return transporter.sendMail(emailOptions.message);
};

const showTestResults = (reportData) => {
    Util.logInfo(`test results: ${reportData.name}`);

    const summary = reportData.summary;

    const colorHandler = (item, row) => {

        // do not show 'errors' in red
        if (['failed'].includes(item.id) && item.value > 0) {
            row.name = EC.red(row.name);
            row.value = EC.red(row.value);
            return;
        }

        if (['flaky'].includes(item.id) && item.value > 0) {
            row.name = EC.yellow(row.name);
            row.value = EC.yellow(row.value);
            return;
        }

        if (item.id === 'passed') {
            if (summary.failed.value === 0 && summary.passed.value > 0) {
                row.name = EC.green(row.name);
                row.value = EC.green(row.value);
            }
        }
    };

    let rows = [];

    const caseTypes = reportData.caseTypes;
    const suiteSubs = reportData.suiteTypes.map((item) => `${item}s`);

    Object.values(summary).forEach((item) => {
        if (caseTypes.includes(item.id) || suiteSubs.includes(item.id)) {
            return;
        }

        const row = {
            ... item
        };
        colorHandler(item, row);
        rows.push(row);
    });

    const tests = rows.find((it) => it.id === 'tests');
    tests.subs = caseTypes.map((k) => {
        const item = {
            ... summary[k]
        };
        const value = `${item.value}`.padEnd(`${tests.value}`.length, ' ');
        const percent = `(${item.percent})`;
        const row = {
            name: item.name,
            value: `${value} ${percent}`
        };
        colorHandler(item, row);
        return row;
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

    Util.logGrid({
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

const onEndHandler = async (reportData, options) => {
    // onEnd callback
    const onEnd = options.onEnd;
    if (typeof onEnd !== 'function') {
        return;
    }

    // generate email data
    emailPlugin(reportData);

    // forEach rows API
    const forEach = (callback) => {
        Util.forEach(reportData.rows, callback);
    };

    await onEnd(reportData, {
        sendEmail,
        forEach
    });
};


const generateReport = async (reportData, options) => {

    Util.logInfo('generating test report ...');

    const {
        outputFile, outputDir, artifacts
    } = reportData;

    if (artifacts) {
        artifacts.forEach((report) => {
            const g = report.global ? `${EC.magenta('(global)')}` : '';
            Util.logInfo(`${report.type}: ${EC.cyan(report.path)} ${report.name} ${g}`);
            // convert path to relative reporter
            report.path = Util.relativePath(report.path, outputDir);
        });

        reportData.summary.artifacts = {
            name: 'Artifacts',
            value: artifacts.length
        };

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

    // for onEnd after saved
    Object.assign(reportData, {
        htmlPath,
        jsonPath
    });

    await onEndHandler(reportData, options);

    // after onEnd for summary changes
    showTestResults(reportData);

    Util.logInfo(`html report: ${EC.cyan(htmlPath)} (json: ${jsonPath})`);
    Util.logInfo(`view report: ${EC.cyan(`npx monocart show-report ${htmlPath}`)}`);

};

module.exports = generateReport;
