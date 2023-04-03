const fs = require('fs');
const path = require('path');
const Util = require('./utils/util.js');
const { getTickInfo } = require('./utils/system.js');
const Visitor = require('./visitor.js');
const { calculateSummary } = require('./common.js');

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
    data.suiteTypes = ['project', 'file', 'describe', 'shard'];
    data.caseTypes = ['passed', 'flaky', 'skipped', 'failed'];

    const tagOptions = options.tags || {};
    calculateSummary(data, tagOptions);

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