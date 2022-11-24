module.exports = {
    // the report name
    name: '',

    // the output file path (relative process.cwd)
    outputFile: './test-results/report.html',

    // custom columns
    columns: null,
    // columns: (defaultColumns) => {},

    // async hook after report data generated
    onEnd: null
    // onEnd: async (reportData, config, root) => {}
};
