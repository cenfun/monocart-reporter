const EC = require('eight-colors');
const generate = require('./generate.js');
const Util = require('./util.js');

//custom reporter
//https://playwright.dev/docs/test-reporters#custom-reporters
class Reporter {

    // root suite in the reporter.onBegin(config, suite) method.
    onBegin(config, suite) {
        this.config = config;
        this.root = suite;
        //console.log(config);
        //console.log(`onBegin: ${suite.allTests().length} tests`);
    }

    //Called on some global error, for example unhandled exception in the worker process.
    onError(error) {
        //Util.logRed(error);
    }

    onTestBegin(test) {
        //console.log(`onTestBegin ${test.title}`);
        test.logs = [];
    }

    onStdErr(chunk, test, result) {
        if (test) {
            test.logs.push(EC.red(chunk));
        }
    }

    onStdOut(chunk, test, result) {
        if (test) {
            test.logs.push(chunk);
        }
    }


    // onStepBegin(test, result, step)
    // onStepEnd(test, result, step)

    onTestEnd(test, result) {
        //console.log(`onTestEnd ${test.title}: ${result.status}`);
        //console.log(result);
        if (!Util.isList(test.logs)) {
            delete test.logs;
        }

    }

    onEnd(result) {
        //console.log(`onEnd: ${result.status}`);
        //console.log(result);
        const code = generate(this.root, this.config);
        if (code) {
            process.exit(code);
        }
    }


}

module.exports = Reporter;
