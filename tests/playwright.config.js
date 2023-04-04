module.exports = {

    globalSetup: require.resolve('./common/global-setup.js'),

    use: {
        // test attachments
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'on-first-retry'
    },

    metadata: {
        // test global-setup error
        // baseURL: 'https://example.coma/',

        // test home page object model
        url: 'https://www.npmjs.org/package/monocart-reporter',
        // test addInitScript
        clientPath: 'tests/common/client.js'
    },

    // test flaky case
    retries: 1,

    // testDir: '../tests/example/',

    // testDir: '../tests/home-page/',

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
            },
            metadata: {
                myMetaData: 'config-project-metadata',
                owner: 'PO'
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

            attachmentPath: (currentPath, extras) => {
                // console.log(currentPath, extras);
                // return `https://cenfun.github.io/monocart-reporter/${relativePath}`;
            },

            tags: {
                smoke: {
                    style: {
                        background: '#6F9913'
                    },
                    description: '"Smoke Testing" is a software testing technique performed post software build to verify that the <critical functionalities> of software are working fine.'
                },
                sanity: {
                    style: 'background:#178F43;',
                    description: '"Sanity testing" is a kind of Software Testing performed after receiving a software build, with minor changes in code, or functionality, to ascertain that the bugs have been fixed and no further issues are introduced due to these changes.'
                },
                critical: {
                    background: '#c00'
                },
                slow: 'background:orange;'
            },

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
                        const key = rowItem[columnItem.id];
                        return `<a href="https://your-jira-key-link.com/${key}" target="_blank">${valueFormatted}</a>`;
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

                defaultColumns.push({
                    id: 'description',
                    name: 'Description',
                    markdown: true,
                    searchable: true
                });

                // hide a default column
                const retryColumn = defaultColumns.find((column) => column.id === 'retry');
                retryColumn.invisible = true;

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

                // remove secrets and sensitive data from report
                if (data.type === 'step') {

                    // step title before:
                    // locator.type(input[type=password], mysecretpassword)
                    // apiRequestContext.get(https://api.npmjs.org/?token=myapitoken)

                    const mySecrets = [process.env.LOGIN_PASSWORD, process.env.API_TOKEN];
                    mySecrets.forEach((secret) => {
                        data.title = data.title.replace(secret, '***');
                    });

                    // step title after:
                    // locator.type(input[type=password], ***)
                    // apiRequestContext.get(https://api.npmjs.org/?token=***)

                }


            },

            // async hook after report data generated
            onEnd: async (reportData, capability) => {
                console.log('onEnd hook start');

                // console.log(reportData.summary);

                // send email
                const sendEmail = require('./common/send-email.js');
                await sendEmail(reportData, capability);

                // testrail integration
                // const testrail = require('./common/testrail.js');
                // await testrail(reportData, capability);

                // slack integration with webhook
                // const slackWebhook = require('./common/slack-webhook.js');
                // await slackWebhook(reportData, capability);

                // slack integration with web api
                // const slackWebApi = require('./common/slack-web-api.js');
                // await slackWebApi(reportData, capability);

                // html to pdf
                // const toPdf = require('./common/to-pdf.js');
                // await toPdf(reportData, capability);

            }
        }]
    ]
};
