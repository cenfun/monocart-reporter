const fs = require('fs');
const path = require('path');
const EC = require('eight-colors');
const CG = require('console-grid');
const nodemailer = require('nodemailer');
const compress = require('lz-utils/lib/compress.js');
const Util = require('./util.js');
const Visitor = require('./visitor.js');
const defaultOptions = require('./options.js');
const generateEmail = require('./generate-email.js');

const testStartTime = Date.now();

const getConfigUse = (config) => {
    // user use options
    // testConfig.use  Global options for all tests
    // testProject.use  Options for all tests in this project

    // console.log('config', config);

    // but testConfig.use get removed in playwright
    // so just load from original config by path config.configFile (invalid in old version)

    let use;
    const configFile = config.configFile;
    if (configFile && fs.existsSync(configFile)) {
        try {
            const originalConfig = require(config.configFile);
            if (originalConfig) {
                use = originalConfig.use;
            }
        } catch (e) {
            //
        }
    }
    return use || {};
};

const getSummary = (data) => {
    const summary = {
        tests: {
            name: 'Tests',
            value: 0,
            type: 'tests'
        },
        passed: {
            name: 'Passed',
            value: 0,
            type: 'passed'
        },
        failed: {
            name: 'Failed',
            value: 0,
            type: 'failed'
        },
        flaky: {
            name: 'Flaky',
            value: 0,
            type: 'flaky'
        },
        skipped: {
            name: 'Skipped',
            value: 0,
            type: 'skipped'
        }
    };

    const caseHandler = (item) => {
        summary.tests.value += 1;
        if (item.ok) {
            if (item.status === 'skipped' || item.outcome === 'skipped') {
                summary.skipped.value += 1;
            } else if (item.outcome === 'flaky') {
                summary.flaky.value += 1;
            } else {
                summary.passed.value += 1;
            }
        } else {
            summary.failed.value += 1;
        }
    };

    const forEachAll = (list) => {
        if (!Util.isList(list)) {
            return;
        }
        list.forEach((item, i) => {
            if (item.type === 'case') {
                caseHandler(item);
            }
            forEachAll(item.subs);
        });
    };

    forEachAll(data.rows);

    Object.values(summary).forEach((item) => {
        if (item.type === 'tests') {
            item.percent = '';
            return;
        }
        item.percent = Util.PF(item.value, summary.tests.value);
    });

    return summary;
};

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
        reportJs = Util.readFileContentSync(reportDistPath);
    } else {
        EC.logRed(errMsg);
    }

    const reportDataStr = compress(JSON.stringify(reportData));
    const content = `<script>\nwindow.reportData = '${reportDataStr}';\n${reportJs}\n</script>`;

    // replace template
    let html = Util.getTemplate(path.resolve(__dirname, 'template.html'));
    html = Util.replace(html, {
        title: reportData.name,
        content: content
    });

    let htmlPath = path.resolve(outputDir, `${filename}.html`);
    Util.writeFileContentSync(htmlPath, html);
    htmlPath = Util.relativePath(htmlPath);
    console.log(`[MCR] html report: ${EC.cyan(htmlPath)}`);

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
        if (item.type === 'failed') {
            if (item.value > 0) {
                v = EC.red(v);
            }

        } else if (item.type === 'flaky') {
            if (item.value > 0) {
                v = EC.yellow(v);
            }
        } else if (item.type === 'passed') {
            if (summary.failed.value === 0) {
                v = EC.green(v);
            }
        }
        return v;
    };

    const rows = [{
        name: 'Date',
        value: new Date(reportData.date).toLocaleString()
    }, {
        name: 'Version',
        value: `playwright v${reportData.version}`
    }, {
        name: 'Duration',
        value: Util.TF(reportData.duration)
    }];

    const testsRow = {
        subs: []
    };
    rows.push(testsRow);

    Object.values(summary).forEach((item) => {
        if (item.type === 'tests') {
            Object.assign(testsRow, item);
            return;
        }

        const value = `${item.value}`.padEnd(`${testsRow.value}`.length, ' ');
        const percent = `(${item.percent})`;
        testsRow.subs.push({
            name: colorHandler(item, item.name),
            value: colorHandler(item, `${value} ${percent}`)
        });
    });

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

const generateReport = async (config, root, userOptions = {}) => {

    console.log('[MCR] generating test report ...');

    // console.log(config, root);

    const options = {
        ... defaultOptions,
        ... userOptions
    };

    const outputFile = options.outputFile;

    // init outputDir
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, {
            recursive: true
        });
    }
    // console.log(options);

    // for visitor relative path of attachments
    options.outputDir = outputDir;

    const visitor = new Visitor(root, options);
    const data = await visitor.getData();

    const use = getConfigUse(config);

    const projectNames = config.projects.map((item) => item.name).join(', ');
    const reportName = options.name || use.name || projectNames || 'Test Report';

    const summary = getSummary(data);

    const date = Date.now();
    const dateH = new Date().toLocaleString();
    const duration = date - testStartTime;
    const durationH = Util.TF(duration);

    const reportData = {

        use,
        summary,

        // for report title
        name: reportName,

        date,
        dateH,

        duration,
        durationH,

        // playwright version
        version: config.version,

        // data for grid: columns, rows, errors
        ... data
    };

    showTestResults(reportData);

    // console.log(reportData);
    const filename = path.basename(outputFile, '.html');
    // generate html
    const htmlPath = generateHtml(outputDir, filename, reportData);
    // generate json
    const jsonPath = generateJson(outputDir, filename, reportData);

    // onEnd hook
    if (typeof options.onEnd !== 'function') {
        return;
    }
    // for onEnd after saved
    Object.assign(reportData, {
        outputFile,
        outputDir,
        filename,
        htmlPath,
        jsonPath
    });

    // generate email data
    generateEmail(reportData);

    return options.onEnd(reportData, {
        config,
        root,
        sendEmail
    });

};


module.exports = generateReport;
