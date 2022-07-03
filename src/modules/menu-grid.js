
import { Grid } from 'turbogrid';
import Util from '../util/util.js';

export default {

    methods: {

        createMenuGrid() {

            this.initMenuGridData();

            const grid = new Grid('.prg-menu-grid');
            this.menuGrid = grid;

            grid.bind('onClick', (e, d) => {
                if (!d.rowNode) {
                    return;
                }

                this.hideFlyover();

                const rowItem = d.rowItem;
                grid.setRowSelected(rowItem);

                this.dataType = rowItem.dataType;

                let type = rowItem.dataType;
                if (type !== 'suite' && type !== 'step') {
                    type = 'case';
                }
                this.type = type;

            });

            grid.setOption({
                theme: 'dark',
                headerVisible: false,
                selectMultiple: false,
                bindWindowResize: true
            });
            grid.setFormatter({});
            grid.setData(this.menuGridData);
            grid.render();
        },

        initMenuGridData() {

            const columns = [{
                id: 'name',
                width: 100
            }, {
                id: 'value',
                width: 50,
                align: 'center'
            }, {
                id: 'percent',
                width: 60,
                align: 'right'
            }];

            const rows = [];

            this.initSummary(rows);

            this.menuGridData = {
                columns,
                rows
            };

            //console.log(this.menuGridData);

        },

        initSummary(rows) {

            const caseSummary = {
                passed: {
                    name: 'Passed',
                    value: 0,
                    dataType: 'passed'
                },
                failed: {
                    name: 'Failed',
                    value: 0,
                    dataType: 'failed'
                },
                flaky: {
                    name: 'Flaky',
                    value: 0,
                    dataType: 'flaky'
                },
                skipped: {
                    name: 'Skipped',
                    value: 0,
                    dataType: 'skipped'
                }
            };

            const summary = {
                case: {
                    name: 'Cases',
                    value: 0,
                    percent: '',
                    dataType: 'case',
                    selectable: true,
                    selected: true,
                    subs: Object.values(caseSummary)
                },
                step: {
                    name: 'Steps',
                    value: 0,
                    percent: '',
                    dataType: 'step'
                },
                suite: {
                    name: 'Suites',
                    value: 0,
                    percent: '',
                    dataType: 'suite'
                }
            };

            Object.values(summary).forEach((item) => {
                rows.push(item);
            });

            const caseHandler = (item) => {
                summary.case.value += 1;
                if (item.ok) {
                    if (item.status === 'skipped') {
                        caseSummary.skipped.value += 1;
                        item.classMap = 'tg-case-skipped';
                        item.dataType = 'skipped';
                    } else if (item.outcome === 'flaky') {
                        caseSummary.flaky.value += 1;
                        item.classMap = 'tg-case-flaky';
                        item.dataType = 'flaky';
                    } else {
                        caseSummary.passed.value += 1;
                        item.classMap = 'tg-case-passed';
                        item.dataType = 'passed';
                    }
                } else {
                    item.classMap = 'tg-case-failed';
                    item.dataType = 'failed';
                    caseSummary.failed.value += 1;
                    if (parent.failedCases) {
                        parent.failedCases += 1;
                    } else {
                        parent.failedCases = 1;
                    }
                }
            };

            Util.forEachTree(this.reportData.list, function(item, i, parent) {
                if (item.type === 'step') {
                    summary.step.value += 1;
                    if (item.error) {
                        item.classMap = 'tg-case-failed';
                    }
                    return;
                }

                if (item.type === 'case') {
                    caseHandler(item);
                    return;
                }
                if (item.type === 'suite') {
                    summary.suite.value += 1;
                }
            });

            caseSummary.passed.percent = Util.PF(caseSummary.passed.value, summary.case.value);
            caseSummary.passed.classMap = caseSummary.passed.value === summary.case.value ? 'tg-summary-passed' : '';

            caseSummary.failed.percent = Util.PF(caseSummary.failed.value, summary.case.value);
            caseSummary.failed.classMap = caseSummary.failed.value > 0 ? 'tg-summary-failed' : 'tg-summary-skipped';

            caseSummary.flaky.percent = Util.PF(caseSummary.flaky.value, summary.case.value);
            caseSummary.flaky.classMap = caseSummary.flaky.value > 0 ? 'tg-summary-flaky' : 'tg-summary-skipped';

            caseSummary.skipped.percent = Util.PF(caseSummary.skipped.value, summary.case.value);
            caseSummary.skipped.classMap = caseSummary.skipped.value > 0 ? '' : 'tg-summary-skipped';

        }


    }
};
