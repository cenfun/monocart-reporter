const EC = require('eight-colors');

// for local test
process.env.PASSWORD = 'my-password';
process.env.TOKEN = 'my-token';

module.exports = {

    globalSetup: './common/global-setup.js',
    globalTeardown: './common/global-teardown.js',

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
        url: 'https://www.npmjs.org/package/monocart-reporter'
    },

    // test flaky case
    retries: 1,

    workers: 4,

    // testDir: '../tests/example/',

    // testDir: '../tests/home-page/',

    webServer: {
        command: 'npm run mock-serve',
        url: 'http://localhost:8090/'
    },

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
                projectData: 'project level metadata',
                owner: 'PO',
                link: 'https://github.com/cenfun/monocart-reporter'
            }
        }
    ],

    outputDir: '../.temp/test-results/',
    reporter: [
        ['list'],
        ['json', {
            outputFile: '../.temp/json/results.json'
        }],
        ['html', {
            outputFolder: '../.temp/html',
            open: 'never'
        }],
        ['junit', {
            outputFile: '../.temp/junit/results.xml'
        }],

        // ['monocart-reporter']
        ['monocart-reporter', {
            name: 'My Test Report',
            outputFile: '.temp/monocart/index.html',

            zip: '.temp/monocart-zip/mr.zip',

            attachmentPath: (currentPath, extras) => {
                // console.log(currentPath, extras);
                // return `https://cenfun.github.io/monocart-reporter/${relativePath}`;
            },

            // logging: 'debug',

            mermaid: {
                // for local
                scriptSrc: null,

                // mermaid config: https://mermaid.js.org/config/schema-docs/config.html
                config: {
                    startOnLoad: false
                }
            },

            timezoneOffset: 0,

            // inline: false,

            // global coverage
            coverage: {

                name: 'My global coverage report name',

                sourceFilter: (sourcePath) => sourcePath.search(/src\//) !== -1,

                // sourcePath: (sp) => {
                //     return `pre-dir/${sp}`;
                // },

                sourcePath: {
                    'localhost-8090/': 'scripts/mock/',
                    'coverage-v8/test/': 'scripts/'
                },

                all: {
                    dir: ['scripts/mock/src']
                },

                // do not show the report link
                // reportPath: '',

                // reports: 'html',
                lcov: true,

                onEnd: (coverageResults) => {
                    // console.log(coverageResults.summary);
                }
            },

            // global state
            state: {
                data: {
                    count: 0
                },
                // https://github.com/websockets/ws/blob/master/doc/ws.md
                server: {

                },

                // receive message and send response from global state (main process)
                onReceive: function(message) {

                    // if (message && message.reportName) {
                    //     this.options.name = message.reportName;
                    //     return;
                    // }

                    const test = this.getTest(message.testId);
                    // console.log('get from map', test.title, this.testMap.size);
                    // console.log('get from map');

                    if (test) {
                        // test level data handler
                        // console.log('onReceive test ============ ', test.title);
                    }

                    // console.log('receive message on server', message);

                    return {
                        data: 'my response data'
                    };
                },
                onClose: function(data, config) {
                    // console.log('current test onClose ============ ', this.currentTest.title);
                    // console.log('state on close', data, config.metadata);
                    // save state data to global metadata
                    Object.assign(config.metadata, data);
                }
            },

            trend: () => {
                return new Promise((resolve) => {
                    const axios = require('axios');
                    axios.get('https://cenfun.github.io/monocart-reporter/index.json').then((res) => {
                        const json = res.data;
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
                    }).catch((e) => {
                        resolve();
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

                // custom tags column
                // defaultColumns.find((column) => column.id === 'title').titleTagsDisabled = true;
                // defaultColumns.splice(3, 0, {
                //     id: 'tags',
                //     name: 'Tags',
                //     width: 100,
                //     formatter: 'tags'
                // });

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

                // remove secrets and sensitive data
                if (data.type === 'step') {

                    // step title before:
                    // locator.type(input[type=password], mysecretpassword)
                    // apiRequestContext.get(https://api.npmjs.org/?token=myapitoken)

                    const mySecrets = [process.env.PASSWORD, process.env.TOKEN];
                    mySecrets.forEach((secret) => {
                        data.title = data.title.replace(secret, '***');
                    });

                    // step title after:
                    // locator.type(input[type=password], ***)
                    // apiRequestContext.get(https://api.npmjs.org/?token=***)

                }

            },

            customFieldsInComments: true,

            groupOptions: {
                group: true,

                shard: true,
                project: true,
                file: true,
                describe: true,
                step: false,

                merge: false
            },

            // async hook after report data generated
            onEnd: (reportData, helper) => {
                // console.log('onEnd hook start');

                // rename report filename
                // const fs = require('fs');
                // const path = require('path');
                // fs.renameSync(
                //     path.resolve(reportData.htmlPath),
                //     path.resolve(reportData.outputDir, 'new-filename.html')
                // );

                // console.log(reportData.summary);


                // find a test by title
                const myCase = helper.find((item, parent) => item.type === 'case' && item.title.includes('inline tag'));
                console.log('onEnd find test', myCase && myCase.title);

                // find a suite by title
                const mySuite = helper.find((item, parent) => item.type === 'suite' && item.title.includes('new syntax'));
                console.log('onEnd find suite', mySuite && mySuite.title);

                // filter failed cases
                const failedCases = helper.filter((item, parent) => item.type === 'case' && item.caseType === 'failed');
                console.log('onEnd failed cases', failedCases.map((it) => it.title).length);

                // Iterate all items
                helper.forEach((item, parent) => {
                    // do something
                });

                console.log('check test ...');

                const errMsg = [];
                helper.forEach((row) => {
                    if (row.type === 'case' && ['failed', 'flaky'].includes(row.caseType)) {
                        if (row.verify === 'random') {
                            return;
                        }
                        if (row.caseType !== row.verify) {
                            errMsg.push(`Failed to verify: ${row.caseType} => ${row.verify} for test "${row.title}"`);
                        }
                    }
                });

                if (errMsg.length) {
                    EC.logRed(errMsg.join('\n'));
                    process.exit(1);
                } else {
                    EC.logGreen('check test done');
                }

            }
        }]
    ]
};
