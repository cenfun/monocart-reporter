const fs = require('fs');
const path = require('path');
const EC = require('eight-colors');
const compress = require('lz-utils/lib/compress.js');
const Util = require('./util.js');
const defaultOption = require('./option.js');

//==============================================================================================

const testStepHandler = (steps) => {
    return steps.map(testStep => {
        const step = {
            title: testStep.title,
            type: 'step',
            category: testStep.category,
            duration: testStep.duration,
            error: testStep.error,
            location: testStep.location
        };
        if (Util.isList(testStep.steps)) {
            //console.log(testStep.title);
            step.subType = 'step';
            step.subs = testStepHandler(testStep.steps);
        }
        return step;
    });
};

const testCaseHandler = (testCase, list, parent) => {
    parent.subType = 'case';

    //repeated multiple times(retry)
    const results = testCase.results;
    const testResult = results[results.length - 1];
    
    const subCase = {
        title: testCase.title,
        type: 'case',

        //Whether the test is considered running fine. Non-ok tests fail the test run with non-zero exit code.
        ok: testCase.ok(),

        status: testResult.status,
        expectedStatus: testCase.expectedStatus,
        
        //Testing outcome for this test. Note that outcome is not the same as testResult.status:
        //returns: <"skipped"|"expected"|"unexpected"|"flaky">
        outcome: testCase.outcome(),

        duration: testResult.duration,
        retry: testResult.retry,
        
        error: testResult.error,
        location: testCase.location,
        //annotations: testCase.annotations,
        //retries: testCase.retries,
        //timeout: testCase.timeout,

        //startTime: testResult.startTime,

        attachments: testResult.attachments,
        stderr: testResult.stderr,
        stdout: testResult.stdout,
        //testResult.workerIndex

        //====================================================
        subType: 'step',
        subs: testStepHandler(testResult.steps)

    };
    
    list.push(subCase);
};

/*
Project suite #1. Has a child suite for each test file in the project.
    File suite #1
        TestCase #1
        Suite corresponding to a test.describe(title, callback) group
            TestCase #1 in a group
                TestStep
*/
const testSuiteHandler = (suite, list, parent) => {
    parent.subType = 'suite';
    const group = {
        title: Util.formatPath(suite.title),
        type: 'suite',
        subs: []
    };
    list.push(group);
    //drill down
    visit(suite, group.subs, group);
};

const visit = (suite, list, parent = {}) => {
    if (!suite._entries) {
        return;
    }
    //suite -> tests/test case -> test result -> test step
    for (const entry of suite._entries) {
        //only case has results
        if (entry.results) {
            testCaseHandler(entry, list, parent);
        } else {
            testSuiteHandler(entry, list, parent);
        }
    }
};

//==============================================================================================

const getReportOption = (config) => {
    let option = {};
    const reporter = config.reporter;
    if (reporter) {
        //console.log(reporter);
        if (Array.isArray(reporter)) {
            const grid = reporter.find(it => {
                if (Array.isArray(it)) {
                    const p = `${it[0]}`;
                    if (p && p.indexOf('playwright-report-grid') !== -1) {
                        return true;
                    }
                }
            });
            //console.log(grid);
            if (grid) {
                option = grid[1];
            }
        }
    }
    //console.log(option);
    return {
        ... defaultOption,
        ... option
    };
};
const generateReport = (root, config) => {
    //report is diff from cli process
    const reportOption = getReportOption(config);
    console.log(reportOption);
    
    //console.log(root);
    const list = [];
    visit(root, list);

    //user config
    const projectConfig = config.projects[0].use.config;

    const reportData = {
        ... projectConfig,
        list
    };
    //console.log(reportData);
    const filename = path.basename(reportOption.outputFilename, '.html');

    const jsonPath = path.resolve(reportOption.outputFolder, `${filename}.json`);
    Util.writeJSONSync(jsonPath, reportData, true);
    console.log(`saved json report: ${EC.cyan(Util.relativePath(jsonPath))}`);
    
    const reportDistPath = path.resolve(__dirname, 'report-grid.js');
    if (!fs.existsSync(reportDistPath)) {
        Util.logRed(`Not found report lib: ${reportDistPath}`);
        return 1;
    }

    //generate html report
    const reportDataStr = compress(JSON.stringify(reportData));
    const reportJs = Util.readFileContentSync(reportDistPath);
    const content = `<script>\nwindow.reportData = '${reportDataStr}';\n${reportJs}\n</script>`;

    //replace template
    let html = Util.getTemplate(path.resolve(__dirname, 'report-grid.html'));
    html = Util.replace(html, {
        title: reportData.name,
        content: content
    });
    
    const htmlPath = path.resolve(reportOption.outputFolder, `${filename}.html`);
    Util.writeFileContentSync(htmlPath, html, true);
    console.log(`saved html report: ${EC.cyan(Util.relativePath(htmlPath))}`);

    return 0;
};

//==============================================================================================

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
    }

    // onStdErr(chunk, test, result)
    // onStdOut(chunk, test, result)
    // onStepBegin(test, result, step)
    // onStepEnd(test, result, step)
  
    onTestEnd(test, result) {
        //console.log(`onTestEnd ${test.title}: ${result.status}`);
        //console.log(result);
    }
  
    onEnd(result) {
        //console.log(`onEnd: ${result.status}`);
        //console.log(result);
        const code = generateReport(this.root, this.config);
        if (code) {
            process.exit(code);
        }
    }
   

}

module.exports = Reporter;
