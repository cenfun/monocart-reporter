const EC = require('eight-colors');
const generateReport = require('./generate-report.js');
const defaultOptions = require('./options.js');

// custom reporter
// https://playwright.dev/docs/test-reporters#custom-reporters
class Reporter {

    constructor(userOptions = {}) {
        this.options = {
            ... defaultOptions,
            ... userOptions
        };
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
        // Util.logRed(error);
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
            const retryLogs = ['\n', EC.yellow(`Retry #${result.retry}`), '\n'];
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

    onEnd(result) {
        // console.log(`onEnd: ${result.status}`);
        // console.log(result);
        return generateReport(this.config, this.root, this.options);
    }

}

module.exports = Reporter;
