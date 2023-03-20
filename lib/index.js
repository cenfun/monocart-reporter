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

    onTestBegin(test) {
        // console.log(`onTestBegin ${test.title}`);

        // timestampBegin exists if retry
        if (!test.timestampBegin) {
            test.timestampBegin = Date.now();
        }

        // keep logs here with order
        // result stderr and stdout without order
        this.logs = [];
    }

    onStdErr(chunk, test, result) {
        this.logs.push(EC.red(chunk));
    }

    onStdOut(chunk, test, result) {
        this.logs.push(chunk);
    }

    // onStepBegin(test, result, step)
    // onStepEnd(test, result, step)

    onTestEnd(test, result) {
        // console.log(`onTestEnd ${test.title}: ${result.status}`);
        // console.log(result);

        if (this.logs.length) {

            // logs exists if retry
            if (test.logs) {
                test.logs = test.logs.concat(this.logs);
            } else {
                test.logs = this.logs;
            }

            this.logs = [];
        }

        test.timestampEnd = Date.now();
    }

    onEnd(result) {
        // console.log(`onEnd: ${result.status}`);
        // console.log(result);
        return generateReport(this.config, this.root, this.options);
    }

}

module.exports = Reporter;
