const fs = require('fs');
const EC = require('eight-colors');
const StackUtils = require('stack-utils');
const { codeFrameColumns } = require('@babel/code-frame');
const Util = require('./util.js');

class Visitor {
    constructor(root, option) {
        this.root = root;
        this.option = option;
    }

    getInfo() {
        const list = [];
        const errorSet = new Set();
        this.visit(this.root, list, errorSet);

        //set to array
        const errors = Array.from(errorSet);
        this.errorSetHandler(list, errors);
        this.errorSnippetHandler(errors);

        return {
            errors,
            list
        };
    }

    errorSetHandler(list, errors) {
        if (!Util.isList(list)) {
            return;
        }
        list.forEach((item) => {
            if (item.errors) {
                item.errors = item.errors.map((err) => {
                    return errors.indexOf(err);
                });
            }
            this.errorSetHandler(item.subs, errors);
        });
    }

    errorSnippetHandler(errors) {
        errors.forEach((err, i) => {
            const lines = err.split('\n');
            const firstStackLine = lines.findIndex((line) => line.trim().startsWith('at '));
            if (firstStackLine === -1) {
                return;
            }

            const line = lines[firstStackLine];

            const stackUtils = new StackUtils();
            const location = stackUtils.parseLine(line);
            if (!location) {
                return;
            }
            const source = fs.readFileSync(location.file, 'utf8');
            const codeFrame = codeFrameColumns(source, {
                start: location
            }, {
                highlightCode: true
                //forceColor: true
            });

            if (!codeFrame) {
                return;
            }

            lines.splice(firstStackLine, 0, `\n${codeFrame}\n`);

            //console.log(codeFrame);
            errors[i] = lines.join('\n');
        });
    }

    visit(suite, list, errorSet) {
        if (!suite._entries) {
            return;
        }
        //suite -> tests/test case -> test result -> test step
        for (const entry of suite._entries) {
            //only case has results
            if (entry.results) {
                this.testCaseHandler(entry, list, errorSet);
            } else {
                this.testSuiteHandler(entry, list, errorSet);
            }
        }
    }

    /*
    Project suite #1. Has a child suite for each test file in the project.
        File suite #1
            TestCase #1
            Suite corresponding to a test.describe(title, callback) group
                TestCase #1 in a group
                    TestStep
    */
    testSuiteHandler(suite, list, errorSet) {
        const group = {
            title: Util.formatPath(suite.title),
            type: 'suite',
            //all test cases in this suite and its descendants
            tests: suite.allTests().length,
            subs: []
        };

        if (suite.location) {
            group.location = this.locationHandler(suite.location);
        }

        list.push(group);
        //drill down
        this.visit(suite, group.subs, errorSet);
    }

    testCaseHandler(testCase, list, errorSet) {

        const caseItem = {
            title: testCase.title,
            type: 'case',

            //Whether the test is considered running fine. Non-ok tests fail the test run with non-zero exit code.
            ok: testCase.ok(),

            //Testing outcome for this test. Note that outcome is not the same as testResult.status:
            //returns: <"skipped"|"expected"|"unexpected"|"flaky">
            outcome: testCase.outcome(),

            annotations: testCase.annotations,
            expectedStatus: testCase.expectedStatus,
            location: this.locationHandler(testCase.location),

            //generate test logs, merge result stderr/stdout by order
            logs: testCase.logs,

            //repeatEachIndex: testCase.repeatEachIndex,

            //The maximum number of retries given to this test in the configuration
            //retries: testCase.retries,

            //The timeout given to the test.
            //Affected by testConfig.timeout, testProject.timeout, test.setTimeout(timeout), test.slow() and testInfo.setTimeout(timeout).
            timeout: testCase.timeout
        };

        //merge all results (retry multiple)
        const result = {

            attachments: [],
            duration: 0,

            //errors thrown during the test execution.
            //error is first errors
            errors: [],

            retry: 0,

            //<"passed"|"failed"|"timedOut"|"skipped">
            status: '',

            //steps
            subs: []
        };


        testCase.results.forEach((testResult) => {

            result.attachments = result.attachments.concat(testResult.attachments);
            result.duration += testResult.duration;

            result.errors = result.errors.concat(testResult.errors);

            result.retry = testResult.retry;
            result.status = testResult.status;

            //concat all steps
            if (result.subs.length) {
                result.subs.push({
                    title: `Retry #${testResult.retry}`,
                    type: 'step',
                    status: 'retry',
                    retry: testResult.retry
                });
            }
            result.subs = result.subs.concat(this.testStepHandler(testResult.steps, errorSet));

        });

        Object.assign(caseItem, result);

        this.attachmentsHandler(caseItem);
        this.caseErrorsHandler(caseItem, errorSet);

        list.push(caseItem);
    }

    testStepHandler(steps, errorSet) {
        return steps.map((testStep) => {
            const step = {
                title: testStep.title,
                type: 'step',

                //using status column as category
                status: testStep.category,
                duration: testStep.duration,
                location: this.locationHandler(testStep.location)
            };
            this.stepErrorsHandler(step, testStep, errorSet);
            if (Util.isList(testStep.steps)) {
                //console.log(testStep.title);
                step.subs = this.testStepHandler(testStep.steps, errorSet);
            }
            return step;
        });
    }

    caseErrorsHandler(caseItem, errorSet) {

        const errors = caseItem.errors;
        if (Util.isList(errors)) {
            caseItem.errors = this.errorsHandler(errors, errorSet);
            return;
        }

        //missed errors for unexpected
        if (caseItem.outcome === 'unexpected') {
            const error = {
                message: EC.red(`Expected to "${caseItem.expectedStatus}", but "${caseItem.status}"`)
            };
            caseItem.errors = this.errorsHandler([error], errorSet);
            return;
        }

        delete caseItem.errors;

    }

    stepErrorsHandler(step, testStep, errorSet) {
        const error = testStep.error;
        if (!error) {
            return;
        }
        step.errors = this.errorsHandler([error], errorSet);
    }

    errorsHandler(errors, errorSet) {
        return errors.map((err) => {
            err = err.stack || err.message || err;
            errorSet.add(err);
            return err;
        });
    }

    attachmentsHandler(caseItem) {
        const attachments = caseItem.attachments;
        if (!Util.isList(attachments)) {
            delete caseItem.attachments;
            return;
        }
        attachments.forEach((item) => {
            //path to relative path
            if (item.path) {
                item.path = Util.relativePath(item.path, this.option.outputFolder);
            }
            if (item.body) {
                delete item.body;
            }
        });
    }

    locationHandler(location) {
        if (!location) {
            return '';
        }
        const file = Util.relativePath(location.file);
        return `${file}:${location.line}:${location.column}`;
    }


}

module.exports = Visitor;
