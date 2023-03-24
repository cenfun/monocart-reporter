const fs = require('fs');
const path = require('path');
const EC = require('eight-colors');
const StackUtils = require('stack-utils');
const { codeFrameColumns } = require('@babel/code-frame');
const Util = require('./utils/util.js');
const collectComments = require('./utils/collect-comments.js');
const defaultColumns = require('./columns.js');
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

        await this.visit(this.root, rows);

        this.duplicatedErrorsHandler(rows);

        return {
            columns,
            rows,
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

    async visit(suite, list) {
        if (!suite._entries) {
            return;
        }
        // suite -> tests/test case -> test result -> test step
        for (const entry of suite._entries) {
            // only case has results
            if (entry.results) {
                await this.testCaseHandler(entry, list);
            } else {
                await this.testSuiteHandler(entry, list);
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
    async testSuiteHandler(suite, list) {

        const group = {
            title: Util.formatPath(suite.title),
            type: 'suite',
            // root, project, file, describe
            suiteType: suite._type,
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
        await this.visit(suite, group.subs);
    }

    // ==============================================================================================

    async testCaseHandler(testCase, list) {

        // duration
        // total of testResult.duration is not exact, it will cost time before/between/after result
        const caseTimestamps = [].concat(testCase.timestamps);
        const duration = caseTimestamps.pop() - caseTimestamps.shift();

        const caseItem = {
            title: testCase.title,
            type: 'case',
            caseType: '',

            // Whether the test is considered running fine. Non-ok tests fail the test run with non-zero exit code.
            ok: testCase.ok(),

            // Testing outcome for this test. Note that outcome is not the same as testResult.status:
            // returns: <"skipped"|"expected"|"unexpected"|"flaky">
            outcome: testCase.outcome(),

            expectedStatus: testCase.expectedStatus,
            location: this.locationHandler(testCase.location),

            // custom collection
            logs: testCase.logs,
            timestamps: testCase.timestamps,

            duration,

            // annotations, string or array
            annotations: this.getCaseAnnotations(testCase.annotations),

            // repeatEachIndex: testCase.repeatEachIndex,

            // The maximum number of retries given to this test in the configuration
            // retries: testCase.retries,

            // The timeout given to the test.
            // Affected by testConfig.timeout, testProject.timeout, test.setTimeout(timeout), test.slow() and testInfo.setTimeout(timeout).
            timeout: testCase.timeout,

            // ===============================================================
            // merge all results (retry multiple times)

            attachments: [],

            // errors thrown during the test execution.
            // error is first errors
            errors: [],

            retry: 0,

            // <"passed"|"failed"|"timedOut"|"skipped">
            status: '',

            workers: [],

            // all results steps
            subs: []
        };

        const resultsTimestamps = [].concat(testCase.timestamps);

        for (const testResult of testCase.results) {
            caseItem.attachments = caseItem.attachments.concat(testResult.attachments);

            caseItem.errors = caseItem.errors.concat(testResult.errors);

            caseItem.retry = testResult.retry;
            caseItem.status = testResult.status;

            // workers
            // The worker index is used to reference a specific browser instance
            // The parallel index coordinates the parallel execution of tests across multiple worker instances.
            // https://playwright.dev/docs/test-parallel#worker-index-and-parallel-index

            // result duration
            const time_start = resultsTimestamps.shift();
            const time_end = resultsTimestamps.shift();
            const resultDuration = time_end - time_start;

            caseItem.workers.push({
                // like worker
                parallelIndex: testResult.parallelIndex,
                // like job
                workerIndex: testResult.workerIndex,
                timestamp: time_start,
                duration: resultDuration
            });

            // concat all steps
            if (caseItem.subs.length) {
                caseItem.subs.push({
                    title: `Retry #${testResult.retry}`,
                    type: 'step',
                    status: 'retry',
                    retry: testResult.retry
                });
            }

            const steps = await this.testStepHandler(testResult.steps);

            caseItem.subs = caseItem.subs.concat(steps);
        }

        // 'passed', 'flaky', 'skipped', 'failed'
        // after all required status in results
        caseItem.caseType = this.getCaseType(caseItem);

        // no steps
        if (!caseItem.subs.length) {
            delete caseItem.subs;
        }

        this.attachmentsHandler(caseItem, testCase);
        this.caseErrorsHandler(caseItem);

        await this.customVisitorsHandler(caseItem, testCase);

        list.push(caseItem);
    }

    getCaseType(item) {
        // ok includes outcome === 'expected' || 'flaky' || 'skipped'
        if (item.ok) {
            if (item.outcome === 'skipped' || item.status === 'skipped') {
                return 'skipped';
            }
            if (item.outcome === 'flaky') {
                return 'flaky';
            }
            return 'passed';
        }
        return 'failed';
    }

    getCaseAnnotations(annotations) {
        // array
        if (Util.isList(annotations)) {
            return annotations;
        }

        // string from comments
        if (typeof annotations === 'string' && annotations) {
            return annotations;
        }

    }

    // ==============================================================================================

    async testStepHandler(steps) {

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
            this.stepErrorsHandler(step, testStep);
            if (Util.isList(testStep.steps)) {
                // console.log(testStep.title);
                step.subs = await this.testStepHandler(testStep.steps);
            }

            await this.customVisitorsHandler(step, testStep);

            list.push(step);
        }

        return list;
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

    caseErrorsHandler(caseItem) {

        const errors = caseItem.errors;
        if (Util.isList(errors)) {
            caseItem.errors = this.errorsHandler(errors);
            return;
        }

        // missed errors for unexpected
        if (caseItem.outcome === 'unexpected') {
            const error = {
                message: EC.red(`Expected to "${caseItem.expectedStatus}", but "${caseItem.status}"`)
            };
            caseItem.errors = this.errorsHandler([error]);
            return;
        }

        delete caseItem.errors;

    }

    stepErrorsHandler(step, testStep) {
        const error = testStep.error;
        if (!error) {
            return;
        }
        step.errors = this.errorsHandler([error]);
    }

    errorsHandler(errors) {
        return errors.map((err) => {
            err = err.stack || err.message || err;
            return err;
        });
    }

    // ==============================================================================================

    duplicatedErrorsHandler(rows) {

        Util.forEach(rows, (item) => {
            if (!item.errors) {
                return;
            }

            item.numErrors = item.errors.length;
            const errors = item.errors.filter((err) => !this.isErrorInSubs(err, item.subs));
            if (errors.length) {
                item.errors = this.errorsToSnippets(errors);
            } else {
                delete item.errors;
            }

        });

    }

    isErrorInSubs(err, subs) {
        let res = false;
        Util.forEach(subs, (item) => {
            if (item.errors) {
                if (item.errors.find((e) => e === err)) {
                    res = true;
                    // return false to break loop
                    return false;
                }
            }
        });
        return res;
    }

    errorsToSnippets(errors) {
        return errors.map((err, i) => {
            const lines = err.split('\n');
            const firstStackLine = lines.findIndex((line) => line.trim().startsWith('at '));
            if (firstStackLine === -1) {
                return err;
            }

            const line = lines[firstStackLine];

            const stackUtils = new StackUtils();
            const location = stackUtils.parseLine(line);
            if (!location) {
                return err;
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
                return err;
            }

            lines.splice(firstStackLine, 0, `\n${codeFrame}\n`);

            // console.log(codeFrame);
            return lines.join('\n');
        });
    }

}

module.exports = Visitor;
