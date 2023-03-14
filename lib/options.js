module.exports = {
    // the report name
    name: '',

    // the output file path (relative process.cwd)
    outputFile: './test-results/report.html',

    // custom attachment path. default is relative to output file
    attachmentPath: null,
    // attachmentPath: (relativePath) => `https://cenfun.github.io/monocart-reporter/${relativePath}`,

    // custom columns
    columns: null,
    // columns: (defaultColumns) => {},

    // additional custom visitor for columns
    visitor: null,
    // visitor: (data, metadata, collect) => {},

    // async hook after report data generated
    onEnd: null
    // onEnd: async (reportData, config, root) => {}
};
