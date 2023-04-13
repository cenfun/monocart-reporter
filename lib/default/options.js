module.exports = {
    // the report name
    name: '',

    // the output file path (relative process.cwd)
    outputFile: './test-results/report.html',

    // attachment path handler
    attachmentPath: null,
    // attachmentPath: (currentPath, extras) => `https://cenfun.github.io/monocart-reporter/${currentPath}`,

    // trend data handler
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

    // columns data handler
    columns: null,
    // columns: (defaultColumns) => {},

    // rows data handler
    visitor: null,
    // visitor: (data, metadata, collect) => {},

    // onEnd hook
    onEnd: null
    // onEnd: async (reportData, capability) => {}
};
