const fs = require('fs');
const path = require('path');
const EC = require('eight-colors');
const StackUtils = require('stack-utils');
const { codeFrameColumns } = require('@babel/code-frame');
const Util = require('./util.js');
const defaultColumns = require('./columns.js');
const collectComments = require('./collect-comments.js');
class Visitor {
    constructor(root, options) {
        this.root = root;
        this.options = options;

        // console.log(options);

        if (typeof options.visitor === 'function') {
            this.customCommonVisitor = options.visitor;
        }

    }

    async getData() {

        // default columns not detailed in report
        defaultColumns.forEach((item) => {
            item.detailed = false;
        });

        // custom column formatters with string passed to JSON
        const formatters = {};

        // user defined custom columns
        const handler = this.options.columns;
        if (typeof handler === 'function') {
            // update default columns by user
            handler.call(this, defaultColumns);
            // maybe a tree
            const customVisitors = [];
            this.initCustomHandler(defaultColumns, customVisitors, formatters);
            if (customVisitors.length) {
                this.customVisitors = customVisitors;
            }
        }

        // console.log(customFormatters);

        const columns = defaultColumns;
        const rows = [];
        const errorSet = new Set();
        await this.visit(this.root, rows, errorSet);

        // set to array
        const errors = Array.from(errorSet);
        this.errorSetHandler(rows, errors);
        this.errorSnippetHandler(errors);

        return {
            columns,
            rows,
            errors,
            formatters
        };
    }

    // ==============================================================================================

    initCustomHandler(list, visitors, formatters) {

        list.forEach((column) => {
            if (column.id) {

                // custom visitor
                if (typeof column.visitor === 'function') {

                    visitors.push({
                        id: column.id,
                        visitor: column.visitor
                    });

                    // remove function (can not be in JSON)
                    delete column.visitor;

                }

                // custom formatter
                if (typeof column.formatter === 'function') {

                    formatters[column.id] = column.formatter.toString();

                    // remove function (can not be in JSON)
                    delete column.formatter;
                }

            }

            // drill down
            if (Util.isList(column.subs)) {
                this.initCustomHandler(column.subs, visitors, formatters);
            }
        });
    }

    // generate the column data from playwright metadata
    // data.type is suite, metadata is Suite, https://playwright.dev/docs/api/class-suite
    // data.type is case, metadata is TestCase, https://playwright.dev/docs/api/class-testcase
    // data.type is step, metadata is TestStep, https://playwright.dev/docs/api/class-teststep
    async customVisitorsHandler(data, metadata) {

        const collect = {
            comments: (d) => {
                return collectComments(d || metadata);
            }
        };

        // for all data
        if (this.customCommonVisitor) {
            await this.customCommonVisitor.call(this, data, metadata, collect);
        }

        // for single column data (high priority)
        if (this.customVisitors) {
            for (const item of this.customVisitors) {
                const res = await item.visitor.call(this, data, metadata, collect);
                if (typeof res !== 'undefined') {
                    data[item.id] = res;
                }
            }
        }
    }

    // ==============================================================================================

    async visit(suite, list, errorSet) {
        if (!suite._entries) {
            return;
        }
        // suite -> tests/test case -> test result -> test step
        for (const entry of suite._entries) {
            // only case has results
            if (entry.results) {
                await this.testCaseHandler(entry, list, errorSet);
            } else {
                await this.testSuiteHandler(entry, list, errorSet);
            }
        }
    }

    // ==============================================================================================

    /*
    Project suite #1. Has a child suite for each test file in the project.
        File suite #1
            TestCase #1
            Suite corresponding to a test.describe(title, callback) group
                TestCase #1 in a group
                    TestStep
    */
    async testSuiteHandler(suite, list, errorSet) {
        const group = {
            title: Util.formatPath(suite.title),
            type: 'suite',
            // all test cases in this suite and its descendants
            tests: suite.allTests().length,
            subs: []
        };

        if (suite.location) {
            group.location = this.locationHandler(suite.location);
        }

        await this.customVisitorsHandler(group, suite);

        list.push(group);
        // drill down
        await this.visit(suite, group.subs, errorSet);
    }

    // ==============================================================================================

    async testCaseHandler(testCase, list, errorSet) {

        const caseItem = {
            title: testCase.title,
            type: 'case',

            // Whether the test is considered running fine. Non-ok tests fail the test run with non-zero exit code.
            ok: testCase.ok(),

            // Testing outcome for this test. Note that outcome is not the same as testResult.status:
            // returns: <"skipped"|"expected"|"unexpected"|"flaky">
            outcome: testCase.outcome(),

            expectedStatus: testCase.expectedStatus,
            location: this.locationHandler(testCase.location),

            annotations: testCase.annotations,

            // custom collection
            logs: testCase.logs,
            timestampBegin: testCase.timestampBegin,
            timestampEnd: testCase.timestampEnd,

            // repeatEachIndex: testCase.repeatEachIndex,

            // The maximum number of retries given to this test in the configuration
            // retries: testCase.retries,

            // The timeout given to the test.
            // Affected by testConfig.timeout, testProject.timeout, test.setTimeout(timeout), test.slow() and testInfo.setTimeout(timeout).
            timeout: testCase.timeout
        };

        // merge all results (retry multiple)
        const result = {

            attachments: [],

            // errors thrown during the test execution.
            // error is first errors
            errors: [],

            retry: 0,

            // <"passed"|"failed"|"timedOut"|"skipped">
            status: '',

            workers: [],

            // steps
            subs: []
        };

        let resultsDuration = 0;

        for (const testResult of testCase.results) {
            result.attachments = result.attachments.concat(testResult.attachments);

            result.errors = result.errors.concat(testResult.errors);

            result.retry = testResult.retry;
            result.status = testResult.status;

            // workers
            // const filename = testCase.titlePath()[2];
            // console.log(workerInfo, filename, testCase.title, testCase.ok());

            // The worker index is used to reference a specific browser instance,
            // The parallel index coordinates the parallel execution of tests across multiple worker instances.

            // Worker index and parallel index
            // Each worker process is assigned two ids:
            // - a unique worker index that starts with 1
            // - a parallel index that is between 0 and workers - 1.
            // When a worker is restarted, for example after a failure, the new worker process has the same parallelIndex and a new workerIndex.
            result.workers.push({
                parallelIndex: testResult.parallelIndex,
                workerIndex: testResult.workerIndex,
                duration: testResult.duration
            });

            resultsDuration += testResult.duration;

            // concat all steps
            if (result.subs.length) {
                result.subs.push({
                    title: `Retry #${testResult.retry}`,
                    type: 'step',
                    status: 'retry',
                    retry: testResult.retry
                });
            }

            const steps = await this.testStepHandler(testResult.steps, errorSet);

            result.subs = result.subs.concat(steps);
        }

        // duration
        // total of testResult.duration is not exact, it will cost time before/between/after result
        const caseDuration = testCase.timestampEnd - testCase.timestampBegin;
        // using bigger one, sometimes results 2ms + 0ms > case 1ms
        result.duration = Math.max(resultsDuration, caseDuration);

        // no steps
        if (!result.subs.length) {
            delete result.subs;
        }

        Object.assign(caseItem, result);

        this.attachmentsHandler(caseItem, testCase);
        this.caseErrorsHandler(caseItem, errorSet);

        await this.customVisitorsHandler(caseItem, testCase);

        list.push(caseItem);
    }

    // ==============================================================================================

    async testStepHandler(steps, errorSet) {

        const list = [];

        for (const testStep of steps) {
            const step = {
                title: testStep.title,
                type: 'step',

                category: testStep.category,
                // using status column as category
                status: testStep.category,

                duration: testStep.duration,
                location: this.locationHandler(testStep.location)
            };
            this.stepErrorsHandler(step, testStep, errorSet);
            if (Util.isList(testStep.steps)) {
                // console.log(testStep.title);
                step.subs = await this.testStepHandler(testStep.steps, errorSet);
            }

            await this.customVisitorsHandler(step, testStep);

            list.push(step);
        }

        return list;
    }

    // ==============================================================================================

    caseErrorsHandler(caseItem, errorSet) {

        const errors = caseItem.errors;
        if (Util.isList(errors)) {
            caseItem.errors = this.errorsHandler(errors, errorSet);
            return;
        }

        // missed errors for unexpected
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

    attachmentsHandler(caseItem, testCase) {
        const attachments = caseItem.attachments;
        if (!Util.isList(attachments)) {
            delete caseItem.attachments;
            return;
        }

        attachments.forEach((item, i) => {

            if (item.body) {
                if (!item.path) {
                    this.saveAttachmentHandler(item, i, testCase);
                }
                delete item.body;
            }

            this.attachmentPathHandler(item);

        });
    }

    saveAttachmentHandler(item, i, testCase) {

        const attachmentsPath = path.resolve(this.options.outputDir, 'attachments');
        if (!fs.existsSync(attachmentsPath)) {
            fs.mkdirSync(attachmentsPath, {
                recursive: true
            });
        }

        /* eslint-disable no-control-regex */
        const filename = `${testCase.title}`.replace(/[\x00-\x2C\x2E-\x2F\x3A-\x40\x5B-\x60\x7B-\x7F]+/g, '-');
        /* eslint-enable */

        const types = {
            'text/plain': 'txt',
            'application/octet-stream': 'data'
        };

        let ext = 'data';
        const contentType = item.contentType;
        if (contentType) {
            ext = types[contentType] || contentType.split('/').pop().slice(0, 4);
        }
        const filePath = path.resolve(attachmentsPath, `${item.name}-${filename}-${i}.${ext}`);
        fs.writeFileSync(filePath, item.body);
        item.path = filePath;
    }

    attachmentPathHandler(item) {
        // path to relative path
        if (!item.path) {
            return;
        }

        let p = Util.relativePath(item.path, this.options.outputDir);
        const ap = this.options.attachmentPath;
        if (typeof ap === 'function') {
            p = ap.call(this, p);
        }

        item.path = p;

    }

    locationHandler(location) {
        if (!location) {
            return '';
        }
        const file = Util.relativePath(location.file);
        return `${file}:${location.line}:${location.column}`;
    }

    // ==============================================================================================

    errorSetHandler(list, errors) {
        if (!Util.isList(list)) {
            return;
        }
        list.forEach((item) => {
            if (item.errors) {
                const ls = item.errors.map((err) => {
                    return errors.indexOf(err);
                });
                // remove repeat error
                item.errors = Array.from(new Set(ls));
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
                highlightCode: true,
                // forceColor: true
                // linesAbove: 2,
                linesBelow: 0
            });

            if (!codeFrame) {
                return;
            }

            lines.splice(firstStackLine, 0, `\n${codeFrame}\n`);

            // console.log(codeFrame);
            errors[i] = lines.join('\n');
        });
    }


}

module.exports = Visitor;
