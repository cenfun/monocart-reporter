const Util = require('./util.js');
const { generatePieChart } = require('./chart.js');

const calculateSummaryPercent = (summary, caseTypes) => {
    caseTypes.forEach((k) => {
        const item = summary[k];
        item.percent = Util.PF(item.value, summary.tests.value);
    });
};

const calculateSummaryPieChart = (summary, caseTypes) => {
    // percent and pie list
    const pieDataList = [];
    caseTypes.forEach((k) => {
        const item = summary[k];
        pieDataList.push({
            ... item
        });
    });
    // charts
    return generatePieChart(pieDataList);
};

module.exports = {
    calculateSummaryPercent,
    calculateSummaryPieChart
};
