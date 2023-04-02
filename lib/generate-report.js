const fs = require('fs');
const path = require('path');
const EC = require('eight-colors');
const CG = require('console-grid');
const nodemailer = require('nodemailer');
const compress = require('lz-utils/lib/compress.js');
const Util = require('./utils/util.js');
const { getTickInfo } = require('./utils/system.js');
const Visitor = require('./visitor.js');
const generateEmail = require('./generate-email.js');
const defaultSummary = require('./summary.js');
const { generatePieChart } = require('./utils/chart.js');

const caseHandler = (item, summary) => {
    summary.tests.value += 1;
    summary.retries.value += item.retry;

    if (item.errors) {
        summary.errors.value += item.errors.length;
    }

    if (item.logs) {
        summary.logs.value += item.logs.length;
    }

    if (item.attachments) {
        summary.attachments.value += item.attachments.length;
    }

    const type = summary[item.caseType];
    if (!type) {
        return;
    }
    type.value += 1;
};

const stepHandler = (item, summary) => {
    summary.steps.value += 1;

    if (item.errors) {
        summary.errors.value += item.errors.length;
    }
};

const suiteHandler = (item, summary) => {
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
const tagHandler = (item, tags, tagOptions) => {
    const matches = item.title.matchAll(tagPattern);
    for (const match of matches) {
        const tag = match[1];
        let tagItem = tags[tag];
        if (!tagItem) {
            tagItem = {};
            const options = tagOptions[tag];
            if (options) {
                if (options.style) {
                    Object.assign(tagItem, options);
                } else {
                    tagItem.style = options;
                }
            }
            tagItem.value = 0;
            tags[tag] = tagItem;
        }
        tagItem.value += 1;
    }
};

const initData = (data, options) => {
    data.suiteTypes = ['project', 'file', 'describe'];
    const caseTypes = ['passed', 'flaky', 'skipped', 'failed'];
    data.caseTypes = caseTypes;

    const tagOptions = options.tags || {};
    const tags = {};

    // only counting case parent without duplicate
    const suiteSet = new Set();

    const summary = {
        ... defaultSummary
    };
    // init summary data
    Object.keys(summary).forEach((k) => {
        const item = summary[k];
        item.id = k;
        item.value = 0;
    });

    Util.forEach(data.rows, (item, parent) => {
        tagHandler(item, tags, tagOptions);
        if (item.type === 'case') {
            suiteSet.add(parent);
            caseHandler(item, summary);
            return;
        }
        if (item.type === 'step') {
            stepHandler(item, summary);
            return;
        }
        suiteHandler(item, summary);
    });

    summary.suites.value = suiteSet.size;
    suiteSet.clear();

    // percent and pie list
    const pieDataList = [];
    caseTypes.forEach((k) => {
        const item = summary[k];
        item.percent = Util.PF(item.value, summary.tests.value);
        pieDataList.push({
            ... item
        });
    });

    data.summary = summary;
    data.tags = tags;

    // charts
    data.pieChart = generatePieChart(pieDataList);

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
        if (item.id === 'failed') {
            if (item.value > 0) {
                v = EC.red(v);
            }

        } else if (item.id === 'flaky') {
            if (item.value > 0) {
                v = EC.yellow(v);
            }
        } else if (item.id === 'passed') {
            if (summary.failed.value === 0) {
                v = EC.green(v);
            }
        }
        return v;
    };

    let rows = [];

    const caseTypes = reportData.caseTypes;
    const suiteSubs = ['projects', 'files', 'describes'];

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

const getReportName = (options, config, metadata, projects) => {
    const reportName = options.name || config.name || metadata.name;
    if (reportName) {
        return reportName;
    }
    const projectNames = projects.map((item) => item.name).filter((it) => it).join(', ');
    return projectNames || 'Test Report';
};

const generateReport = async (results) => {

    const {
        config,
        root,
        options,
        system
    } = results;

    console.log('[MCR] generating test report ...');

    // console.log(config);

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

    const metadata = config.metadata || {};
    const projects = config.projects.map((p, i) => {

        // merge project metadata to project row
        const pm = p.metadata;
        const row = data.rows[i];
        if (pm && row) {
            Object.assign(row, pm);
        }

        return {
            name: p.name,
            metadata: pm,
            use: p.use,
            testDir: Util.relativePath(p.testDir),
            // The output directory for files created during test execution
            outputDir: Util.relativePath(p.outputDir)
        };
    });

    const reportName = getReportName(options, config, metadata, projects);

    // add one last tick before end time
    const tickInfo = await getTickInfo();
    system.ticks.push(tickInfo);

    // let start timestamp as date
    const date = system.timestampStart;
    const dateH = new Date(date).toLocaleString();

    // end timestamp for duration
    system.timestampEnd = Date.now();
    const duration = system.timestampEnd - system.timestampStart;
    const durationH = Util.TF(duration);

    const reportData = {
        // for report title
        name: reportName,

        date,
        dateH,
        duration,
        durationH,

        // path
        cwd: Util.formatPath(process.cwd()),
        // playwright configFile
        configFile: Util.relativePath(config.configFile),
        // test root dir
        testDir: Util.relativePath(config.rootDir),
        // reporter outputDir
        outputDir: Util.relativePath(outputDir),

        // playwright version
        version: config.version,
        // Limit workers
        workers: config.workers,

        metadata,
        projects,

        system,

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
