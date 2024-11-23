module.exports = () => ({
    // logging levels: off, error, info, debug
    logging: 'info',

    // the report name
    name: '',

    // image url (supports data url)
    logo: null,

    // the output html file path (relative process.cwd)
    outputFile: './monocart-report/index.html',

    json: true,
    zip: false,

    // whether to copy attachments to the reporter output dir, defaults to true
    // it is useful when there are multiple html reports being output.
    copyAttachments: true,

    // attachment path handler
    attachmentPath: null,
    // attachmentPath: (currentPath, extras) => `https://cenfun.github.io/monocart-reporter/${currentPath}`,

    // custom trace viewer url
    traceViewerUrl: 'https://trace.playwright.dev/?trace={traceUrl}',

    // timezone offset in minutes, GMT+0800 = -480
    timezoneOffset: 0,

    // normal or exclude-idle
    durationStrategy: null,

    // global coverage settings for addCoverageReport API
    coverage: null,
    // coverage: {
    //     entryFilter: (entry) => true,
    //     sourceFilter: (sourcePath) => sourcePath.search(/src\/.+/) !== -1,
    // },

    // Global State Management
    state: null,

    // trend data handler
    trend: null,
    // trend: () => './monocart-report/index.json',

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

    // enable/disable group or levels
    groupOptions: null,
    // groupOptions: {
    //     group: true,

    //     shard: true,
    //     project: true,
    //     file: true,
    //     describe: true,
    //     step: false,

    //     merge: false
    // },


    // onEnd hook
    onEnd: null
    // onEnd: async (reportData, helper) => {}
});
