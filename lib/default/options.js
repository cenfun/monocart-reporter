module.exports = () => ({
    // the report name
    name: '',

    // the output file path (relative process.cwd)
    outputFile: './test-results/report.html',

    // attachment path handler
    attachmentPath: null,
    // attachmentPath: (currentPath, extras) => `https://cenfun.github.io/monocart-reporter/${currentPath}`,

    traceViewerUrl: 'https://trace.playwright.dev/?trace={traceUrl}',

    // logging levels: off, error, info, debug
    logging: 'info',

    // timezone offset in minutes, GMT+0800 = -480
    timezoneOffset: 0,

    // global coverage settings for addCoverageReport API
    coverage: null,
    // coverage: {
    //     entryFilter: (entry) => true,
    //     sourceFilter: (sourcePath) => sourcePath.search(/src\/.+/) !== -1,
    // },

    state: null,

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

    // rows data handler (suite, case and step)
    visitor: null,
    // visitor: (data, metadata) => {},

    // enable/disable custom fields in comments. Defaults to true.
    customFieldsInComments: true,

    // mermaid options
    mermaid: null,
    // mermaid: {
    //     scriptSrc: 'https://cdn.jsdelivr.net/npm/mermaid@latest/dist/mermaid.min.js',
    //     // mermaid config https://mermaid.js.org/config/schema-docs/config.html
    //     config: {
    //         startOnLoad: false
    //     }
    // },

    // onEnd hook
    onEnd: null
    // onEnd: async (reportData, helper) => {}
});
