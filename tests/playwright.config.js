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
        product: 'Monocart',
        env: 'STG',
        type: 'Regression',
        executor: 'Mono',

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

            trend: () => {
                return new Promise((resolve) => {
                    const fs = require('fs');
                    fs.readFile('.temp/monocart/index.json', (err, data) => {
                        if (err) {
                            console.log(err);
                            resolve();
                            return;
                        }
                        const json = JSON.parse(data);
                        // mock data
                        // for (let i = 0; i < 100; i++) {
                        //     const item = {
                        //         ... json.trends[0]
                        //     };
                        //     item.date -= 60 * 60 * 1000 + Math.floor(Math.random() * 60 * 60 * 1000);
                        //     if (Math.random() > 0.9) {
                        //         item.tests -= 1;
                        //         item.passed -= 1;
                        //     }
                        //     json.trends.unshift(item);
                        // }

                        resolve(json);
                    });
                });
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
                const index = defaultColumns.findIndex((column) => column.id === 'duration');
                defaultColumns.splice(index, 0, {
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
                    formatter: (v, rowItem, columnItem) => {
                        const key = rowItem[columnItem.id];
                        return `<a href="https://your-jira-url/${key}" target="_blank">${v}</a>`;
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
                    width: 300,
                    markdown: true,
                    searchable: true
                });

                // hide a default column
                // const retryColumn = defaultColumns.find((column) => column.id === 'retry');
                // retryColumn.invisible = true;

                // update a default column width
                // const locationColumn = defaultColumns.find((column) => column.id === 'location');
                // locationColumn.width = 150;

                // custom formatter for duration
                // const durationColumn = defaultColumns.find((column) => column.id === 'duration');
                // durationColumn.formatter = function(value, rowItem, columnItem) {
                //     if (typeof value === 'number' && value) {
                //         return `<i>${value.toLocaleString()} ms</i>`;
                //     }
                //     return value;
                // };

                // custom formatter for title
                // The title shows the tree style, it is a complicated HTML structure
                // it is recommended to format title base on previous.
                // const titleColumn = defaultColumns.find((column) => column.id === 'title');
                // titleColumn.formatter = function(value, rowItem, columnItem, cellNode) {
                //     const perviousFormatter = this.getFormatter('tree');
                //     const v = perviousFormatter(value, rowItem, columnItem, cellNode);
                //     if (rowItem.type === 'step') {
                //         return `${v}<div style="position:absolute;top:0;right:5px;">✅</div>`;
                //     }
                //     return v;
                // };

            },

            // additional custom visitor for columns
            visitor: (data, metadata, collect) => {
                // auto collect data from comments
                const parserOptions = {
                    // Indicate the mode the code should be parsed in.
                    // Can be one of "script", "module", or "unambiguous". Defaults to "script".
                    // sourceType: 'module',

                    // enable typescript syntax. more https://babeljs.io/docs/babel-parser
                    // plugins: ['typescript']
                };
                const comments = collect.comments(parserOptions);
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
                // console.log('onEnd hook start');

                // console.log(reportData.summary);

                // send email
                // const sendEmail = require('./common/send-email.js');
                // await sendEmail(reportData, capability);

                // testrail integration
                // const testrail = require('./common/testrail.js');
                // await testrail(reportData, capability);

                //  zephyr scale integration
                // const zephyrScale = require('./common/zephyr-scale.js');
                // await zephyrScale(reportData, capability);

                // slack integration with webhook
                // const slackWebhook = require('./common/slack-webhook.js');
                // await slackWebhook(reportData, capability);

                // slack integration with web api
                // const slackWebApi = require('./common/slack-web-api.js');
                // await slackWebApi(reportData, capability);

                // discord integration with webhook
                // const discordWebhook = require('./common/discord-webhook.js');
                // await discordWebhook(reportData, capability);

                // teams integration with webhook
                // const teamsWebhook = require('./common/teams-webhook.js');
                // await teamsWebhook(reportData, capability);

                // dingtalk integration with webhook
                // const dingtalkWebhook = require('./common/dingtalk-webhook.js');
                // await dingtalkWebhook(reportData, capability);

                // feishu integration with webhook
                // const feishuWebhook = require('./common/feishu-webhook.js');
                // await feishuWebhook(reportData, capability);

                // weixin integration with webhook
                // const weixinWebhook = require('./common/weixin-webhook.js');
                // await weixinWebhook(reportData, capability);

                // html to pdf
                // const toPdf = require('./common/to-pdf.js');
                // await toPdf(reportData, capability);

            }
        }]
    ]
};
