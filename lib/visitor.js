const Util = require('./util.js');

class Visitor {
    constructor(root, option) {
        this.root = root;
        this.option = option;
    }

    getList() {
        const list = [];
        this.visit(this.root, list);
        return list;
    }

    visit(suite, list, parent = {}) {
        if (!suite._entries) {
            return;
        }
        //suite -> tests/test case -> test result -> test step
        for (const entry of suite._entries) {
            //only case has results
            if (entry.results) {
                this.testCaseHandler(entry, list, parent);
            } else {
                this.testSuiteHandler(entry, list, parent);
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
    testSuiteHandler(suite, list, parent) {
        parent.subType = 'suite';
        const group = {
            title: Util.formatPath(suite.title),
            type: 'suite',
            subs: []
        };
        list.push(group);
        //drill down
        this.visit(suite, group.subs, group);
    }

    testStepHandler(steps) {
        return steps.map((testStep) => {
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
                step.subs = this.testStepHandler(testStep.steps);
            }
            return step;
        });
    }

    testCaseHandler(testCase, list, parent) {
        parent.subType = 'case';

        const myCase = {
            title: testCase.title,
            type: 'case',
            subType: 'step',

            //Whether the test is considered running fine. Non-ok tests fail the test run with non-zero exit code.
            ok: testCase.ok(),
            expectedStatus: testCase.expectedStatus,

            //Testing outcome for this test. Note that outcome is not the same as testResult.status:
            //returns: <"skipped"|"expected"|"unexpected"|"flaky">
            outcome: testCase.outcome(),
            location: testCase.location
            //annotations: testCase.annotations,
            //retries: testCase.retries,
            //timeout: testCase.timeout,

        };

        //repeated multiple times(retry)
        const results = testCase.results.map((testResult) => {
            const result = {
                status: testResult.status,
                duration: testResult.duration,
                retry: testResult.retry,
                error: testResult.error,
                //startTime: testResult.startTime,
                attachments: testResult.attachments,
                stderr: testResult.stderr,
                stdout: testResult.stdout,
                //testResult.workerIndex
                subs: this.testStepHandler(testResult.steps)
            };
            //last result as final result, merge to case
            Object.assign(myCase, result);
            return result;
        });

        //retry results
        if (results.length > 1) {
            results.length -= 1;
            myCase.results = results;
        }

        this.errorMessageHandler(myCase, testCase);
        this.attachmentsHandler(myCase);
        this.locationHandler(myCase);

        list.push(myCase);
    }

    errorMessageHandler(myCase, testCase) {
        if (myCase.outcome === 'unexpected' && !myCase.error) {
            if (myCase.status === 'timedOut') {
                myCase.error = {
                    message: `Timeout of ${testCase.timeout}ms exceeded.`
                };
            } else {
                myCase.error = {
                    message: `Expected status is ${myCase.expectedStatus}, but ${myCase.status}.`
                };
            }
        }
    }

    attachmentsHandler(myCase) {
        const attachments = myCase.attachments;
        if (!Util.isList(attachments)) {
            return;
        }
        myCase.attachments = attachments.map((item) => {
            //path to relative path
            item.path = Util.relativePath(item.path, this.option.outputFolder);
            //console.log(item);
            return item;
        });
    }

    locationHandler(myCase) {
        const location = myCase.location;
        if (!location || !location.file) {
            return;
        }
        location.file = Util.relativePath(location.file);
    }


}

module.exports = Visitor;
