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

                // insert custom column(s) before a default column
                const durationColumnIndex = defaultColumns.findIndex((column) => column.id === 'duration');
                defaultColumns.splice(durationColumnIndex, 0, {
                    // define the column in reporter
                    id: 'owner',
                    name: 'Owner',
                    align: 'center',
                    searchable: true,
                    styleMap: {
                        'font-weight': 'normal'
                    }
                }, {
                    // another column for JIRA link
                    id: 'jira',
                    name: 'JIRA Key',
                    width: 100,
                    searchable: true,
                    styleMap: 'font-weight:normal;',
                    formatter: (valueFormatted, rowItem, columnItem) => {
                        const valueOriginal = rowItem[columnItem.id];
                        return `<a href="${valueOriginal}" target="_blank">${valueFormatted}</a>`;
                    }
                });

                // append grouped columns
                // defaultColumns.push({
                //     id: 'group',
                //     name: 'Group',
                //     subs: [{
                //         id: 'item1',
                //         name: 'Item 1'
                //     }, {
                //         id: 'item2',
                //         name: 'Item 2'
                //     }]
                // });

                // hide a default column
                // const retryColumn = defaultColumns.find((column) => column.id === 'retry');
                // retryColumn.invisible = true;

                // update a default column width
                // const locationColumn = defaultColumns.find((column) => column.id === 'location');
                // locationColumn.width = 150;

            },

            // additional custom visitor for columns
            visitor: (data, metadata, collect) => {
                // auto collect data from comments
                const comments = collect.comments();
                if (comments) {
                    Object.assign(data, comments);
                }
            },

            // async hook after report data generated
            onEnd: async (reportData, { sendEmail, config }) => {
                console.log('onEnd hook start');

                console.log(reportData.summary);
                // {
                //     tests: { name: 'Tests', value: 22, type: 'tests', percent: '' },
                //     passed: { name: 'Passed', value: 13, type: 'passed', percent: '59.1%' },
                //     failed: { name: 'Failed', value: 5, type: 'failed', percent: '22.7%' },
                //     flaky: { name: 'Flaky', value: 1, type: 'flaky', percent: '4.5%' },
                //     skipped: { name: 'Skipped', value: 3, type: 'skipped', percent: '13.6%' }
                //   }

                const emailOptions = {
                    // https://nodemailer.com/smtp/
                    transport: {
                        service: 'Hotmail',
                        auth: {
                            user: '',
                            pass: ''
                        }
                    },
                    // https://nodemailer.com/message/
                    message: {
                        from: '',
                        to: '',
                        cc: '',
                        bcc: '',

                        subject: `${reportData.name} - ${reportData.dateH}`,
                        attachments: [{
                            path: reportData.htmlPath
                        }],

                        html: `
                            <h3>${reportData.name}</h3>
                            <ul>
                                <li>Env: STG</li>
                                <li>Type: Smoke</li>
                                <li>Url: ${reportData.use.url}</li>
                                <li>Workers: ${config.workers}</li>
                                <li>Date: ${reportData.dateH}</li>
                                <li>Duration: ${reportData.durationH}</li>
                            </ul>
                            
                            ${reportData.summaryTable}

                            <p>Please check attachment html for detail.</p>

                            <p>Thanks,</p>
                        `
                    }
                };

                const info = await sendEmail(emailOptions).catch((e) => {
                    console.error(e);
                });
                if (info) {
                    console.log(info);
                }

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
