
import Util from '../util/util.js';

export default {

    methods: {

        initSummaryData() {

            const summary = {
                all: {
                    name: 'All',
                    value: 0,
                    percent: '',
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
                    if (item.status === 'skipped') {
                        summary.skipped.value += 1;
                        item.classMap = 'tg-skipped';
                        item.caseType = 'skipped';
                    } else if (item.outcome === 'flaky') {
                        summary.flaky.value += 1;
                        item.classMap = 'tg-flaky';
                        item.caseType = 'flaky';
                    } else {
                        summary.passed.value += 1;
                        item.classMap = 'tg-passed';
                        item.caseType = 'passed';
                    }
                } else {
                    item.classMap = 'tg-failed';
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
                    if (item.error) {
                        item.classMap = 'tg-failed';
                    }
                    return;
                }

                if (item.type === 'case') {
                    caseHandler(item);
                }
            });

            summary.passed.percent = Util.PF(summary.passed.value, summary.all.value);
            summary.passed.classMap = summary.passed.value === summary.all.value ? 'prg-summary-passed' : '';

            summary.failed.percent = Util.PF(summary.failed.value, summary.all.value);
            summary.failed.classMap = summary.failed.value > 0 ? 'prg-summary-failed' : 'prg-summary-skipped';

            summary.flaky.percent = Util.PF(summary.flaky.value, summary.all.value);
            summary.flaky.classMap = summary.flaky.value > 0 ? 'prg-summary-flaky' : 'prg-summary-skipped';

            summary.skipped.percent = Util.PF(summary.skipped.value, summary.all.value);
            summary.skipped.classMap = summary.skipped.value > 0 ? '' : 'prg-summary-skipped';

            this.summary = summary;

        }


    }
};
