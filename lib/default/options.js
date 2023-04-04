module.exports = {
    // the report name
    name: '',

    // the output file path (relative process.cwd)
    outputFile: './test-results/report.html',

    // custom attachment path. default is relative to output file
    attachmentPath: null,
    // attachmentPath: (currentPath, extras) => `https://cenfun.github.io/monocart-reporter/${currentPath}`,

    // trend data collection
    trend: null,
    // trend: () => './test-results/report.json',

    // custom tags style
    tags: null,
    // tags: {
    //     smoke: {
    //         'background': '#6F9913'
    //     },
    //     sanity: {
    //         'background': '#178F43'
    //     }
    // },

    // custom columns
    columns: null,
    // columns: (defaultColumns) => {},

    // additional custom visitor for columns
    visitor: null,
    // visitor: (data, metadata, collect) => {},

    // async hook after report data generated
    onEnd: null
    // onEnd: async (reportData, capability) => {}
};
