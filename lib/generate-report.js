const fs = require('fs');
const path = require('path');
const EC = require('eight-colors');
const CG = require('console-grid');
const nodemailer = require('nodemailer');
const compress = require('lz-utils/lib/compress.js');
const Util = require('./util.js');
const Visitor = require('./visitor.js');
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

const caseHandler = (item, summary) => {
    summary.tests.value += 1;
    summary.retries.value += item.retry;
    const type = summary[item.caseType];
    if (!type) {
        return;
    }
    type.value += 1;
};

const suiteHandler = (item, summary) => {
    summary.suites.value += 1;
    const types = {
        project: 'projects',
        file: 'files',
        describe: 'describes'
    };
    const type = types[item.suiteType];
    if (!type) {
        // root
        return;
    }
    summary[type].value += 1;
};

// ===========================================================================

const tagPattern = /@([^@\s]+)/g;
const tagHandler = (item, tags, tagStyles) => {
    const matches = item.title.matchAll(tagPattern);
    for (const match of matches) {
        const tag = match[1];
        if (!tags[tag]) {
            tags[tag] = {
                value: 0,
                style: tagStyles[tag]
            };
        }
        tags[tag].value += 1;
    }
};

const initData = (data, options) => {
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
        flaky: {
            name: 'Flaky',
            value: 0,
            type: 'flaky'
        },
        skipped: {
            name: 'Skipped',
            value: 0,
            type: 'skipped'
        },
        failed: {
            name: 'Failed',
            value: 0,
            type: 'failed'
        },

        steps: {
            name: 'Steps',
            value: 0
        },
        retries: {
            name: 'Retries',
            value: 0
        },

        suites: {
            name: 'Suites',
            value: 0
        },
        projects: {
            name: 'Projects',
            value: 0
        },
        files: {
            name: 'Files',
            value: 0
        },
        describes: {
            name: 'Describes',
            value: 0
        }
    };
    const tagStyles = options.tags || {};
    const tags = {};

    Util.forEach(data.rows, (item) => {
        tagHandler(item, tags, tagStyles);
        if (item.type === 'case') {
            caseHandler(item, summary);
            return;
        }
        if (item.type === 'step') {
            summary.steps.value += 1;
            return;
        }
        suiteHandler(item, summary);
    });

    // percent
    ['passed', 'flaky', 'skipped', 'failed'].forEach((k) => {
        const item = summary[k];
        item.percent = Util.PF(item.value, summary.tests.value);
    });

    data.summary = summary;
    data.tags = tags;

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

    let rows = [];

    const caseTypes = ['passed', 'flaky', 'skipped', 'failed'];

    Object.values(summary).forEach((item) => {

        if (caseTypes.includes(item.type)) {
            return;
        }

        rows.push({
            ... item
        });


    });

    const tests = rows.find((it) => it.type === 'tests');
    tests.subs = caseTypes.map((k) => {
        const item = summary[k];
        const value = `${item.value}`.padEnd(`${tests.value}`.length, ' ');
        const percent = `(${item.percent})`;
        return {
            name: colorHandler(item, item.name),
            value: colorHandler(item, `${value} ${percent}`)
        };

    });

    rows = rows.concat([{
        name: 'Date',
        value: new Date(reportData.date).toLocaleString()
    }, {
        name: 'Version',
        value: `playwright v${reportData.version}`
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

const generateReport = async (config, root, options) => {

    console.log('[MCR] generating test report ...');

    // console.log(config, root);

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

    // init summary and tags
    initData(data, options);

    const use = getConfigUse(config);
    const projectNames = config.projects.map((item) => item.name).join(', ');
    const reportName = options.name || use.name || projectNames || 'Test Report';

    const date = Date.now();
    const dateH = new Date().toLocaleString();
    const duration = date - testStartTime;
    const durationH = Util.TF(duration);

    const reportData = {

        use,

        // for report title
        name: reportName,

        date,
        dateH,

        duration,
        durationH,

        // playwright version
        version: config.version,
        // Limit workers
        workers: config.workers,

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

    const forEach = (callback) => {
        Util.forEach(data.rows, callback);
    };

    return options.onEnd(reportData, {
        config,
        root,
        sendEmail,
        forEach
    });

};


module.exports = generateReport;
