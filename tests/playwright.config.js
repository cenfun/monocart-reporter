module.exports = {

    globalSetup: require.resolve('./common/global-setup.js'),

    use: {

        // test attachments
        screenshot: 'only-on-failure',
        video: 'on-first-retry',
        // trace: 'retain-on-failure'

        // test global-setup error
        // baseURL: 'https://example.coma/'

        // test home page object model
        url: 'https://www.npmjs.org/package/monocart-reporter',
        // test addInitScript
        clientPath: 'tests/common/client.js'
    },

    // test flaky case
    retries: 1,

    projects: [
        // {
        //     name: 'Desktop Firefox',
        //     use: {
        //         browserName: 'firefox',
        //         viewport: {
        //             width: 1280,
        //             height: 720
        //         }
        //     }
        // },
        {
            name: 'Desktop Chromium',
            use: {
                browserName: 'chromium',
                viewport: {
                    width: 1280,
                    height: 720
                }
            }
        }
    ],

    outputDir: '../.temp/monocart/',
    reporter: [
        ['list'],
        ['json', {
            outputFile: '../.temp/json/results.json'
        }],
        ['html', {
            outputFolder: '../.temp/html',
            outputFile: 'results.html',
            open: 'never'
        }],
        ['junit', {
            outputFile: '../.temp/junit/results.xml'
        }],
        // ['monocart-reporter']
        ['monocart-reporter', {
            name: 'My Test Report',
            outputFile: '.temp/monocart/index.html',

            // custom columns
            columns: (defaultColumns) => {
                // console.log(defaultColumns);

                // insert custom column(s) before a default column
                const durationColumnIndex = defaultColumns.findIndex((column) => column.id === 'duration');
                defaultColumns.splice(durationColumnIndex, 0, {
                    // define the column in reporter
                    id: 'owner',
                    name: 'Owner',
                    align: 'center',
                    styleMap: {
                        'font-weight': 'normal'
                    },

                    // generate the column data from playwright metadata
                    // data.type is suite, metadata is Suite, https://playwright.dev/docs/api/class-suite
                    // data.type is case, metadata is TestCase, https://playwright.dev/docs/api/class-testcase
                    // data.type is step, metadata is TestStep, https://playwright.dev/docs/api/class-teststep (seems useless for now)
                    visitor: (data, metadata) => {

                        if (data.type === 'suite') {
                            // currently we can customize suite data through test.use(obj), for example:
                            // test.use({
                            //     owner: 'Kevin',
                            //     jira: 'Epic #16888'
                            // });
                            // and get custom data like following:
                            const suiteUse = metadata._use && metadata._use.find((item) => item.fixtures);
                            if (suiteUse) {
                                return suiteUse.fixtures.owner;
                            }
                        }

                        if (data.type === 'case') {
                            // currently we can customize case data through custom annotations, for example:
                            // test.info().annotations.push({
                            //     owner: 'Musk',
                            //     jira: 'Task #16933'
                            // });
                            // and get custom data like following:
                            const annotation = metadata.annotations.find((item) => item.owner);
                            if (annotation) {
                                return annotation.owner;
                            }

                        }

                    }
                }, {
                    // another column for JIRA link
                    id: 'jira',
                    name: 'JIRA Link',
                    width: 100,
                    align: 'right',
                    styleMap: 'font-weight:normal;',

                    visitor: (data, metadata) => {

                        if (data.type === 'suite') {
                            const suiteUse = metadata._use && metadata._use.find((item) => item.fixtures);
                            if (suiteUse) {
                                return `<a href="#" target="_blank">${suiteUse.fixtures.jira}</a>`;
                            }
                        }

                        if (data.type === 'case') {
                            const annotation = metadata.annotations.find((item) => item.jira);
                            if (annotation) {
                                return `<a href="#" target="_blank">${annotation.jira}</a>`;
                            }
                        }

                    }
                });

                // support grouped columns
                defaultColumns.push({
                    id: 'group',
                    name: 'Group',
                    subs: [{
                        id: 'comments',
                        name: 'Comments',
                        width: 150,
                        // using replace formatter
                        formatter: 'replace',

                        visitor: (data, metadata) => {
                            if (data.type === 'case' && data.owner && data.jira) {
                                return '{owner} {jira}';
                            }
                        }
                    }, {
                        id: 'item2',
                        name: 'Test Item'
                    }]
                });

                // hide a default column
                // const retryColumn = defaultColumns.find((column) => column.id === 'retry');
                // retryColumn.invisible = true;

                // update a default column width
                const locationColumn = defaultColumns.find((column) => column.id === 'location');
                locationColumn.width = 150;

            },

            // async hook after report data generated
            onEnd: (reportData, config, root) => {
                console.log('onEnd hook start');
                return new Promise((resolve) => {
                    // you can send email or call some API here
                    console.log('onEnd hook do something slow (async) ...');
                    setTimeout(() => {
                        console.log(`onEnd hook end: ${reportData.name} - ${reportData.htmlPath}`);
                        resolve();
                    }, 2000);
                });
            }
        }]
    ]
};
