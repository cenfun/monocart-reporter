const config = {

    globalSetup: require.resolve('./common/global-setup.js'),

    use: {

        // test attachments
        screenshot: 'only-on-failure',
        video: 'on-first-retry',
        // trace: 'retain-on-failure'

        // test global-setup error
        // baseURL: 'https://example.coma/'
        baseURL: 'https://www.imdb.com/',

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
            // the dir relative process.cwd
            outputFile: '.temp/monocart/index.html',

            // Advanced reporter columns
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
                    // type is suite, metadata is Suite, https://playwright.dev/docs/api/class-suite
                    // type is case, metadata is TestCase, https://playwright.dev/docs/api/class-testcase
                    // type is step, metadata is TestStep, https://playwright.dev/docs/api/class-teststep
                    visitor: (type, metadata) => {

                        if (type === 'suite') {
                            // generate the owner for the suite
                            return 'Elon Musk';
                        }

                        if (type === 'case') {
                            // generate the owner for the case
                            return 'Kevin';
                        }

                    }
                }, {
                    // another column for JIRA story link
                    id: 'story',
                    name: 'Story',
                    align: 'right',

                    visitor: (type, metadata) => {

                        // story id for JIRA
                        if (type === 'suite') {
                            return '';
                        }

                        if (type === 'case') {
                            return '<a href="#" target="_blank">#16888</a>';
                        }

                    }
                });

                // support grouped columns
                defaultColumns.push({
                    id: 'group',
                    name: 'Group',
                    subs: [{
                        id: 'item1',
                        name: 'Test Item 1',
                        width: 120,
                        formatter: 'replace',

                        visitor: (type, metadata) => {
                            if (type === 'case') {
                                return 'Test replace {type}';
                            }
                        }
                    }, {
                        id: 'item2',
                        name: 'Test Item 2'
                    }]
                });

                // just do something in visitor
                defaultColumns.push({
                    id: 'whatever-your-id',
                    // invisible column
                    invisible: true,

                    // support async way
                    visitor: async () => {
                        // do something like call some API when case failed

                        // if (type === 'case') {
                        // request something when case failed
                        // const res = await fetch(`https://your-domain/api?id=${metadata.id}`);
                        // return res.data;
                        // }

                    }
                });

                // hide a default column
                // const retryColumn = defaultColumns.find((column) => column.id === 'retry');
                // retryColumn.invisible = true;

                // update a default column width
                const locationColumn = defaultColumns.find((column) => column.id === 'location');
                locationColumn.width = 100;


            }
        }]
    ]
};

module.exports = config;
