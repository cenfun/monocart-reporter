const fs = require('fs');
const path = require('path');
const Util = require('./utils/util.js');
const { getTickInfo } = require('./utils/system.js');
const Visitor = require('./visitor.js');
const { calculateSummary } = require('./common.js');
const { generateGlobalCoverageReport } = require('./plugins/coverage/coverage.js');
const version = require('../package.json').version;

const getReportName = (options, config, metadata) => {
    const reportName = options.name || config.name || metadata.name;
    if (reportName) {
        return reportName;
    }
    return 'Test Report';
};

const artifactsHandler = async (visitor, reporterOptions) => {
    const artifacts = [].concat(visitor.artifacts);

    // global artifacts
    const globalCoverageReport = await generateGlobalCoverageReport(reporterOptions);
    if (globalCoverageReport) {
        artifacts.push(globalCoverageReport);
    }

    return artifacts;
};

const getReportDate = (timestampStart, timezoneOffset = 0) => {
    // in minutes
    const offset = Util.toNum(timezoneOffset);
    return timestampStart + offset * 60 * 1000;
};

const generateMermaid = (options) => {
    const mermaidOptions = options.mermaid;
    if (mermaidOptions) {
        const scriptSrc = mermaidOptions.scriptSrc;
        if (!scriptSrc) {
            // try to copy and load from local
            let mp;
            try {
                mp = require.resolve('mermaid');
            } catch (e) {
                // ignore error
            }
            // console.log(mp);
            if (mp) {
                const filename = 'mermaid.min.js';
                const filePath = path.resolve(path.dirname(mp), filename);
                if (fs.existsSync(filePath)) {
                    const assetPath = path.resolve(options.outputDir, 'assets', filename);
                    fs.cpSync(filePath, assetPath, {
                        recursive: true,
                        force: true
                    });
                    mermaidOptions.scriptSrc = `assets/${filename}`;
                }
            }
        }
    }
    // console.log(mermaidOptions);
    return mermaidOptions;
};

const generateData = async (results) => {

    Util.logInfo('generating report data ...');

    const {
        config,
        root,
        options,
        system,
        trends
    } = results;

    const {
        cwd, outputFile, outputDir
    } = options;

    // console.log(config);
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
    data.mermaid = generateMermaid(options);
    data.groupOptions = options.groupOptions;

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
    const date = getReportDate(system.timestampStart, options.timezoneOffset);
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
