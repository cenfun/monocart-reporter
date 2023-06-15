const fs = require('fs');
const path = require('path');
const Util = require('./utils/util.js');
const { getTickInfo } = require('./utils/system.js');
const Visitor = require('./visitor.js');
const { calculateSummary } = require('./common.js');
const { generateGlobalCoverageReport } = require('./plugins/coverage/coverage.js');
const { generateGlobalNetworkReport } = require('./plugins/network/network.js');
const version = require('../package.json').version;

const getReportName = (options, config, metadata) => {
    const reportName = options.name || config.name || metadata.name;
    if (reportName) {
        return reportName;
    }
    return 'Test Report';
};

const artifactsHandler = async (visitor, options) => {
    const artifacts = [].concat(visitor.artifacts);
    // global artifacts
    const { coverage, network } = visitor.artifactDataMap;
    if (coverage) {
        const report = await generateGlobalCoverageReport(coverage, options);
        artifacts.unshift(report);
    }
    if (network) {
        const report = await generateGlobalNetworkReport(coverage, options);
        artifacts.unshift(report);
    }
    return artifacts;
};

const generateData = async (results) => {

    console.log('[MCR] generating report data ...');

    const {
        config,
        root,
        options,
        system,
        trends
    } = results;

    // console.log(config);
    const cwd = Util.formatPath(process.cwd());

    const outputFile = await Util.resolveOutputFile(options.outputFile);
    // init outputDir
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, {
            recursive: true
        });
    }
    // for visitor relative path of attachments
    options.cwd = cwd;
    options.outputDir = outputDir;

    const visitor = new Visitor(root, options);
    await visitor.start();

    const data = {
        columns: visitor.columns,
        rows: visitor.rows,
        formatters: visitor.formatters
    };

    // Limit workers
    system.workers = config.workers;
    // put jobs in system
    system.jobs = visitor.jobs;

    // suite and case types
    data.suiteTypes = ['project', 'file', 'describe', 'shard'];
    data.caseTypes = ['passed', 'flaky', 'skipped', 'failed'];
    data.traceViewerUrl = options.traceViewerUrl;

    calculateSummary(data, options);

    // global metadata
    const metadata = config.metadata || {};

    const reportName = getReportName(options, config, metadata);
    options.name = reportName;

    const artifacts = await artifactsHandler(visitor, options);

    system.cwd = cwd;

    // playwright configFile
    system.configFile = Util.relativePath(config.configFile);
    // playwright version
    system.playwright = config.version;
    // monocart version
    system.monocart = version;

    // test root dir
    system.testDir = Util.relativePath(config.rootDir);

    // reporter output, for shard in diff system
    system.outputFile = Util.relativePath(outputFile);
    system.outputDir = Util.relativePath(outputDir);

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

        // for current process, like merge process
        cwd,
        outputFile,
        outputDir,

        metadata,
        system,

        artifacts,
        trends,

        // columns, rows, formatters
        // tags, summary, pieChart
        ... data
    };

    return reportData;

};


module.exports = generateData;
