const Table = require('../utils/table.js');

const generateSummaryTable = (reportData) => {

    const summary = reportData.summary;

    const columnMap = {};
    Object.values(summary).filter((it) => it.nav).map((item) => {
        columnMap[item.id] = {
            id: item.id,
            name: item.name
        };
    });

    columnMap.passed.formatter = function(v, row, column) {
        if (summary.failed.value === 0) {
            return `<span style="color:green;">${v}</span>`;
        }
        return v;
    };
    columnMap.failed.formatter = function(v, row, column) {
        if (summary.failed.value > 0) {
            return `<span style="color:red;">${v}</span>`;
        }
        return v;
    };
    columnMap.flaky.formatter = function(v, row, column) {
        if (summary.flaky.value > 0) {
            return `<span style="color:orange;">${v}</span>`;
        }
        return v;
    };

    const columns = Object.values(columnMap);
    columns.push({
        id: 'chart',
        name: ''
    });

    const rowValue = {};
    Object.values(summary).map((item) => {
        rowValue[item.id] = item.value;
    });

    rowValue.chart = Table.generateBarChart(rowValue.tests, rowValue.passed, rowValue.failed, rowValue.flaky);
    rowValue.chart_rowspan = 2;

    const rowPercent = {};
    Object.values(summary).map((item) => {
        rowPercent[item.id] = item.percent;
    });

    const summaryData = {
        option: {
            hideHeaders: false
        },
        columns,
        rows: [
            rowValue,
            rowPercent
        ]
    };

    reportData.summaryTable = Table.generateHtml(summaryData);
};


module.exports = (reportData) => {

    generateSummaryTable(reportData);

    // local test
    // const Util = require('./utils/util.js');
    // Util.writeFileSync(`${reportData.outputDir}/summary.html`, reportData.summaryTable);

};
