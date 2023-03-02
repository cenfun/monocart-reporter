const Table = require('./table.js');

const generateSummaryTable = (reportData) => {

    const summary = reportData.summary;

    const columnMap = {};
    Object.values(summary).map((item) => {
        columnMap[item.type] = {
            id: item.type,
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
        rowValue[item.type] = item.value;
    });

    rowValue.chart = Table.generateBarChart(rowValue.tests, rowValue.passed, rowValue.failed, rowValue.flaky);
    rowValue.chart_rowspan = 2;

    const rowPercent = {};
    Object.values(summary).map((item) => {
        rowPercent[item.type] = item.percent;
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
    // const Util = require('./util.js');
    // Util.writeFileContentSync(`${reportData.outputDir}/summary.html`, reportData.summaryTable);

};
