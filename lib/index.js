const path = require('path');
const EC = require('eight-colors');
const { getSystemInfo, getTickInfo } = require('./utils/system.js');
const generateData = require('./generate-data.js');
const generateReport = require('./generate-report.js');
const getDefaultOptions = require('./default/options.js');
const { getTrends } = require('./common.js');

const merge = require('./merge-data.js');
const { attachAuditReport } = require('./plugins/audit/audit.js');
const { addCoverageReport, attachCoverageReport } = require('./plugins/coverage/coverage.js');
const { attachNetworkReport } = require('./plugins/network/network.js');
const { setMetadata } = require('./plugins/metadata/metadata.js');

const { createStateServer, useState } = require('./plugins/state/state.js');

const Util = require('./utils/util.js');

// custom reporter
// https://playwright.dev/docs/test-reporters#custom-reporters
class MonocartReporter {

    static Util = Util;

    static merge = merge;

    static attachAuditReport = attachAuditReport;

    static addCoverageReport = addCoverageReport;
    static attachCoverageReport = attachCoverageReport;

    static attachNetworkReport = attachNetworkReport;

    static setMetadata = setMetadata;

    static useState = useState;

    constructor(userOptions = {}) {

        const timestampStart = Date.now();

        this.options = {
            ... getDefaultOptions(),
            ... userOptions
        };

        Util.initLoggingLevel(this.options.logging, 'reporter');

        this.testMap = new Map();

        this.system = getSystemInfo();
        this.system.timestampStart = timestampStart;
        this.system.ticks = [];

        this.tickTime = this.options.tickTime || 1000;
        this.tickStart();

        this.trends = [];
        this.initTrendsAndDir();

        const stateOptions = this.options.state;
        if (stateOptions) {
            this.bindFunctions(stateOptions);
            this.stateServer = createStateServer(stateOptions);
        }
    }

    async initTrendsAndDir() {

        const cwd = Util.formatPath(process.cwd());
        this.options.cwd = cwd;

        // read trends from json before clean dir
        this.trends = await getTrends(this.options.trend);

        // init outputDir
        const outputFile = await Util.resolveOutputFile(this.options.outputFile);
        this.options.outputFile = outputFile;

        const outputDir = path.dirname(outputFile);

        Util.initDir(outputDir);
        // for visitor relative path of attachments
        this.options.outputDir = outputDir;

        // init attachmentsDir
        if (this.options.copyAttachments) {
            this.options.attachmentsDir = path.resolve(outputDir, 'attachments');
        }
    }

    // ==========================================================================

    bindFunctions(obj) {
        Object.keys(obj).forEach((k) => {
            if (typeof obj[k] === 'function') {
                // The bind() method creates a new function
                obj[k] = obj[k].bind(this);
            }
        });
    }

    // ==========================================================================


    tickStart() {
        this.tick_time_id = setTimeout(async () => {
            const tickInfo = await getTickInfo();
            this.system.ticks.push(tickInfo);
            this.tickStart();
        }, this.tickTime);
    }

    tickStop() {
        clearTimeout(this.tick_time_id);
    }

    // ==========================================================================

    getTest(testId) {
        return this.testMap.get(testId);
    }

    addTestLog(test, log) {
        if (test && test.logs) {
            test.logs.push(log);
        }
    }

    // ==========================================================================

    // Whether this reporter uses stdio for reporting.
    // When it does not, Playwright Test could add some output to enhance user experience.
    // If your reporter does not print to the terminal, it is strongly recommended to return false.
    printsToStdio() {
        return true;
    }

    // root suite in the reporter.onBegin(config, suite) method.
    onBegin(config, suite) {
        this.config = config;
        this.root = suite;

        // output dir for test results (not reporter)
        this.options.testOutputDir = config.projects[0].outputDir;
        // console.log(`onBegin: ${suite.allTests().length} tests`);
    }

    onTestBegin(test, result) {
        // console.log(`onTestBegin ${test.title}`);

        // there maybe multiple test running at same time
        // current test only for missing logs
        // do NOT using for test info
        this.lastTest = test;

        // id, not testId (for test info)
        // console.log('==========================================');
        // console.log('keep test in map', test.id);
        this.testMap.set(test.id, test);

        // Note that do not use this because is parallel
        if (!test.timestamps) {
            test.timestamps = [];
        }
        test.timestamps.push(Date.now());

        // keep logs here with order
        // result stderr and stdout without order
        if (test.logs) {
            const retryLogs = ['\n', EC.yellow(`Retry #${result.retry}`), '\n'].join('');
            this.addTestLog(test, retryLogs);
        } else {
            test.logs = [];
        }
    }

    onStdErr(chunk, test, result) {
        // Note that output may happen when no test is running, in which case this will be void.
        this.addTestLog(test || this.lastTest, EC.red(chunk));
    }

    onStdOut(chunk, test, result) {
        // Note that output may happen when no test is running, in which case this will be void.
        this.addTestLog(test || this.lastTest, chunk);
    }

    // Called on some global error, for example unhandled exception in the worker process.
    onError(error) {
        // EC.logRed(error);

        // add the error to test logs
        this.addTestLog(this.lastTest, EC.red(error.message));

    }

    // onStepBegin(test, result, step)
    // onStepEnd(test, result, step)

    onTestEnd(test, result) {
        // console.log(`onTestEnd ${test.title}: ${result.status}`);
        // console.log(result);

        // logs
        if (!test.logs.length) {
            delete test.logs;
        }

        // timestamps
        test.timestamps.push(Date.now());

    }

    async onEnd(result) {

        if (this.stateServer) {
            await this.stateServer.close(this.config);
            this.stateServer = null;
        }

        this.lastTest = null;
        this.testMap.clear();

        // console.log(`onEnd: ${result.status}`);
        // console.log(result);
        this.tickStop();

        const reportData = await generateData({
            config: this.config,
            root: this.root,
            options: this.options,
            system: this.system,
            trends: this.trends
        });

        return generateReport(reportData, this.options);
    }

}

module.exports = MonocartReporter;
