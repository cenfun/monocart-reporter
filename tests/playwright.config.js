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
        url: 'https://www.npmjs.com/package/monocart-reporter',
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
                    width: 100,
                    align: 'center',

                    // generate the column data from playwright metadata
                    // data.type is suite, metadata is Suite, https://playwright.dev/docs/api/class-suite
                    // data.type is case, metadata is TestCase, https://playwright.dev/docs/api/class-testcase
                    // data.type is step, metadata is TestStep, https://playwright.dev/docs/api/class-teststep (seems useless for now)
                    visitor: (data, metadata) => {

                        // generate the owner for the suite
                        if (data.type === 'suite') {
                            // currently we can only obtain suite custom data via title, for example:
                            // test.describe('suite title @Elon_Musk', () => {});
                            const matched = `${metadata.title}`.match(/@\w+/g);
                            if (matched) {
                                return matched[0];
                            }

                            // you can try to get custom data from first child test annotations
                            // metadata.tests[0].annotations
                        }

                        // generate the owner for the case
                        if (data.type === 'case') {
                            // obtain case custom data via title like suite, for example:
                            // test('case title @Elon_Musk', () => {});

                            // or from custom annotations, for example:
                            // test.info().annotations.push({
                            //     owner: 'Elon Musk',
                            //     story: '#16888'
                            // });
                            const annotation = metadata.annotations.find((item) => item.owner);
                            if (annotation) {
                                return annotation.owner;
                            }

                        }

                    }
                }, {
                    // another column for JIRA story link
                    id: 'story',
                    name: 'JIRA Story',
                    align: 'right',

                    visitor: (data, metadata) => {

                        if (data.type === 'suite') {
                            const matched = `${metadata.title}`.match(/#\d+/g);
                            if (matched) {
                                return `<a href="#" target="_blank">${matched[0]}</a>`;
                            }
                        }

                        if (data.type === 'case') {
                            const annotation = metadata.annotations.find((item) => item.story);
                            if (annotation) {
                                return `<a href="#" target="_blank">${annotation.story}</a>`;
                            }
                        }

                    }
                });

                // support grouped columns
                defaultColumns.push({
                    id: 'group',
                    name: 'Group',
                    subs: [{
                        id: 'item1',
                        name: 'Test replace',
                        width: 150,
                        // using replace formatter
                        formatter: 'replace',

                        visitor: (data, metadata) => {
                            if (data.type === 'case' && data.owner && data.story) {
                                return '{owner} {story}';
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
                locationColumn.width = 100;

            },

            // async hook after report data generated
            onEnd: (reportData, config, root) => {
                console.log('onEnd hook start');
                return new Promise((resolve) => {
                    // you can send email or call some API here
                    console.log('onEnd hook do something slow (async) ...');
                    setTimeout(() => {
                        console.log(`onEnd hook end: ${reportData.name}`);
                        resolve();
                    }, 2000);
                });
            }
        }]
    ]
};
