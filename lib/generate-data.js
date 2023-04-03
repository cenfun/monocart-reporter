const fs = require('fs');
const path = require('path');
const Util = require('./utils/util.js');
const { getTickInfo } = require('./utils/system.js');
const Visitor = require('./visitor.js');
const defaultSummary = require('./summary.js');
const { calculateSummaryPercent, calculateSummaryPieChart } = require('./utils/common.js');

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
    data.suiteTypes = ['shard', 'project', 'file', 'describe'];
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

    data.tags = tags;

    summary.suites.value = suiteSet.size;
    suiteSet.clear();

    data.summary = summary;

    calculateSummaryPercent(summary, caseTypes);

    data.pieChart = calculateSummaryPieChart(summary, caseTypes);

};

const getReportName = (options, config, metadata) => {
    const reportName = options.name || config.name || metadata.name;
    if (reportName) {
        return reportName;
    }
    return 'Test Report';
};

const generateData = async (results) => {

    console.log('[MCR] generating report data ...');

    const {
        config,
        root,
        options,
        system
    } = results;

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
    config.projects.forEach((p, i) => {
        // merge project metadata to project row
        const pm = p.metadata;
        const row = data.rows[i];
        if (pm && row) {
            Object.assign(row, pm);
        }
    });

    const reportName = getReportName(options, config, metadata);

    // Limit workers
    system.workers = config.workers;

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

        // reporter output
        outputFile: Util.relativePath(outputFile),
        outputDir: Util.relativePath(outputDir),

        // playwright version
        version: config.version,

        metadata,

        system,

        // columns, rows, formatters, jobs
        // suiteTypes, caseTypes, tags, summary, pieChart
        ... data
    };

    return reportData;

};


module.exports = generateData;
