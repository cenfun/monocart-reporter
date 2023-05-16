const EC = require('eight-colors');
const { getSystemInfo, getTickInfo } = require('./utils/system.js');
const generateData = require('./generate-data.js');
const generateReport = require('./generate-report.js');
const defaultOptions = require('./default/options.js');
const { getTrends } = require('./common.js');

const merge = require('./merge-data.js');
const { attachAuditReport } = require('./plugins/audit/audit.js');
const { addCoverageReport, attachCoverageReport } = require('./plugins/coverage/coverage.js');
const { attachNetworkReport } = require('./plugins/network/network.js');

// custom reporter
// https://playwright.dev/docs/test-reporters#custom-reporters
class Reporter {

    static merge = merge;

    static addCoverageReport = addCoverageReport;

    static attachAuditReport = attachAuditReport;
    static attachCoverageReport = attachCoverageReport;
    static attachNetworkReport = attachNetworkReport;

    constructor(userOptions = {}) {

        const timestampStart = Date.now();

        this.options = {
            ... defaultOptions,
            ... userOptions
        };

        this.system = getSystemInfo();
        this.system.timestampStart = timestampStart;
        this.system.ticks = [];
        this.trends = [];
        getTrends(this.options.trend).then((res) => {
            this.trends = res;
        });

        this.tickTime = this.options.tickTime || 1000;
        this.tickStart();
    }

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

    // root suite in the reporter.onBegin(config, suite) method.
    onBegin(config, suite) {
        this.config = config;
        this.root = suite;
        // console.log(config);
        // console.log(`onBegin: ${suite.allTests().length} tests`);
    }

    // Called on some global error, for example unhandled exception in the worker process.
    onError(error) {
        // EC.logRed(error);
    }

    onTestBegin(test, result) {
        // console.log(`onTestBegin ${test.title}`);

        // Note that do not use this because is parallel
        if (!test.timestamps) {
            test.timestamps = [];
        }
        test.timestamps.push(Date.now());

        // keep logs here with order
        // result stderr and stdout without order
        if (test.logs) {
            const retryLogs = ['\n', EC.yellow(`Retry #${result.retry}`), '\n'].join('');
            test.logs.push(retryLogs);
        } else {
            test.logs = [];
        }
    }

    onStdErr(chunk, test, result) {
        // Note that output may happen when no test is running, in which case this will be void.
        if (test) {
            test.logs.push(EC.red(chunk));
        }
    }

    onStdOut(chunk, test, result) {
        // Note that output may happen when no test is running, in which case this will be void.
        if (test) {
            test.logs.push(chunk);
        }
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

        return generateReport(reportData, this.options.onEnd);
    }

}

module.exports = Reporter;
