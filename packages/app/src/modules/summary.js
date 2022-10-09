
import Util from '../util/util.js';

export default {

    methods: {

        initSummaryData() {

            const summary = {
                all: {
                    name: 'All',
                    value: 0,
                    caseType: 'all'
                },
                passed: {
                    name: 'Passed',
                    value: 0,
                    caseType: 'passed'
                },
                failed: {
                    name: 'Failed',
                    value: 0,
                    caseType: 'failed'
                },
                flaky: {
                    name: 'Flaky',
                    value: 0,
                    caseType: 'flaky'
                },
                skipped: {
                    name: 'Skipped',
                    value: 0,
                    caseType: 'skipped'
                }
            };

            const caseHandler = (item) => {
                if (item.subs) {
                    item.collapsed = true;
                }
                summary.all.value += 1;
                if (item.ok) {
                    if (Util.isSkipped(item)) {
                        summary.skipped.value += 1;
                        item.classMap = 'tg-case-skipped';
                        item.caseType = 'skipped';
                    } else if (item.outcome === 'flaky') {
                        summary.flaky.value += 1;
                        item.classMap = 'tg-case-flaky';
                        item.caseType = 'flaky';
                    } else {
                        summary.passed.value += 1;
                        item.classMap = 'tg-case-passed';
                        item.caseType = 'passed';
                    }
                } else {
                    item.classMap = 'tg-case-failed';
                    item.caseType = 'failed';
                    summary.failed.value += 1;
                    if (parent.failedCases) {
                        parent.failedCases += 1;
                    } else {
                        parent.failedCases = 1;
                    }
                }
            };

            Util.forEachTree(this.gridDataAll.rows, function(item, i, parent) {
                item.selectable = true;
                if (item.type === 'step') {
                    if (item.subs) {
                        item.collapsed = true;
                    }
                    if (item.errors) {
                        item.classMap = 'tg-step-error';
                    } else if (item.status === 'retry') {
                        item.classMap = 'tg-step-retry';
                    }
                    return;
                }

                if (item.type === 'case') {
                    caseHandler(item);
                }
            });

            //percent handler
            Object.values(summary).forEach((item) => {
                if (item.value === 0 || item.caseType === 'all') {
                    item.percent = '';
                    return;
                }
                const p = Util.PF(item.value, summary.all.value);
                item.percent = `(${p})`;
            });

            //summary.failed.value = 0;

            summary.passed.classMap = summary.failed.value === 0 ? 'mcr-summary-passed' : '';
            summary.failed.classMap = summary.failed.value > 0 ? 'mcr-summary-failed' : 'mcr-summary-skipped';
            summary.flaky.classMap = summary.flaky.value > 0 ? 'mcr-summary-flaky' : 'mcr-summary-skipped';
            summary.skipped.classMap = 'mcr-summary-skipped';

            this.summary = summary;

        }


    }
};
