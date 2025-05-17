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
    data.caseTypes = ['failed', 'flaky', 'skipped', 'passed'];
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

    const timezone = new Date().getTimezoneOffset() / 60;
    const timezoneOffset = options.timezoneOffset;
    const locale = options.locale;

    // add one last tick before end time
    const timestamp = Util.addTimezoneOffset(Date.now(), timezoneOffset);
    const tickInfo = await getTickInfo(timestamp);
    system.ticks.push(tickInfo);

    // let start timestamp as date
    const date = system.timestampStart;
    const dateH = Util.dateFormat(date, locale);

    // end timestamp for duration
    system.timestampEnd = timestamp;
    const duration = system.timestampEnd - system.timestampStart;
    const durationH = Util.TF(duration);

    const reportData = {
        // for report title
        name: reportName,
        logo: options.logo,

        date,
        dateH,
        duration,
        durationH,

        timezone,
        timezoneOffset,
        locale,

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
