# Monocart Reporter

[![](https://img.shields.io/npm/v/monocart-reporter)](https://www.npmjs.com/package/monocart-reporter)
![](https://img.shields.io/librariesio/github/cenfun/monocart-reporter)
![](https://img.shields.io/librariesio/dependents/npm/monocart-reporter)
[![](https://badgen.net/npm/dw/monocart-reporter)](https://www.npmjs.com/package/monocart-reporter)
![](https://img.shields.io/github/license/cenfun/monocart-reporter)

* A [Playwright](https://github.com/microsoft/playwright) Test [Reporter](https://playwright.dev/docs/test-reporters) (Node.js)
* Shows Test Report in A [Tree Grid](https://github.com/cenfun/turbogrid)
* [Custom Columns](#custom-columns) (extra properties for suite/case/step)
    - [Custom Formatter](#custom-formatter)
    - [Searchable Fields](#searchable-fields)
* [Data Collection Visitor](#data-collection-visitor) (extra data collection for suite/case/step)
    - [Adding Comments to Your Tests](#adding-comments-to-your-tests)
    - [Removing Secrets and Sensitive Data from Report](#removing-secrets-and-sensitive-data-from-report)
* Output Report Data and Summary (json)
* Console Logs in Order (log/error/warn/debug/info)
* Export Data (json)
* Timeline Workers Graph
* Monitor CPU and Memory Usage
* [Custom Annotations](https://playwright.dev/docs/test-annotations#custom-annotations) with Markdown Support
* [Style Tags](#style-tags)
* [Metadata](#metadata)
* [Trend Chart](#trend-chart)
* [Merge Shard Reports](#merge-shard-reports)
* [onEnd hook](#onend-hook)
    - [Send Email](#send-email)
    - [Testrail Integration](#testrail-integration)
    - [Jira + Zephyr Scale Integration](#jira--zephyr-scale-integration)
    - [Jira + Xray Integration](#jira--xray-integration)
    - [Slack Integration](#slack-integration)
    - [Discord Integration](#discord-integration)
    - [Teams Integration](#teams-integration)
    - [Dingtalk/Weixin/Feishu Integration](#dingtalkweixinfeishu-integration)

## Preview
[https://cenfun.github.io/monocart-reporter](https://cenfun.github.io/monocart-reporter)

![](/docs/report.gif)

![](/docs/cli.png)

[More Test Reports](https://github.com/cenfun/monocart-reporter-test)

## Install
```sh
npm i monocart-reporter
```

## Playwright Config
> Note: we use `CommonJS` by default, please [move to ESM](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c#how-can-i-move-my-commonjs-project-to-esm) according to your needs.
```js
// playwright.config.js
module.exports = {
    reporter: [
        ['list'],
        ['monocart-reporter', {  
            name: "My Test Report",
            outputFile: './test-results/report.html'
        }]
    ]
};
```
Playwright Docs [https://playwright.dev/docs/test-reporters](https://playwright.dev/docs/test-reporters)

## Examples
- [tests/playwright.config.js](/tests/playwright.config.js)
- [tests/example/example.spec.js](/tests/example/example.spec.js)
- [tests/home-page/home-page.spec.js](/tests/home-page/home-page.spec.js)

## Output
- path-to/your-filename.html  
Single HTML file (data compressed), easy to transfer/deploy or open directly anywhere   
> Note: test attachments (screenshots images/videos) are not included but linked with relative path in report. All attachments will be found in [playwrightConfig.outputDir](https://playwright.dev/docs/api/class-testconfig#test-config-output-dir)
```js
// playwright.config.js
// attachments outputDir and report outputFile used same folder
const date = new Date().toISOString().slice(0, 10); //2022-10-10
const outputDir = `./test-results/${date}`;
module.exports = {
    outputDir: outputDir,
    reporter: [
        ['monocart-reporter', {  
            name: `My Test Report ${date}`,
            outputFile: `${outputDir}/index.html`
        }]
    ]
};
// deploy the folder to your report site and easy checking online
// http://your.report.site/test-results/2022-10-10
```
- path-to/your-filename.json  
Separated metadata file (Already included in the above HTML and compressed, it can be deleted). Can be used for debugging or custom data collection.


## Reporter Options
```js
{
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

    // rows data handler (suite, case and step)
    visitor: null,
    // visitor: (data, metadata, collect) => {},

    // onEnd hook
    onEnd: null
    // onEnd: async (reportData, capability) => {}
}
```

## Custom Columns
The report will be displayed in a `Tree Grid`. The `columns` function is used to customize the grid columns. The column properties following:
- `id` (String) Column id (required)
- `name` (String) Column name, shows in grid header
- `align` (String) left (default), center, right
- `width` (Number) Column width
- `minWidth`, `maxWidth` (Number) Default to 81 ~ 300
- `styleMap` (Object, String) Column style (css)
- `formatter` (Function) [column formatter](#custom-formatter), arguments: value, rowItem, columnItem, cellNode
- `sortable` (Boolean) Column sortable when click column header name
- `resizable` (Boolean) Column width resizable
- `searchable` (Boolean) Specifies whether the column is searchable
- `markdown` (Boolean) Specifies whether the column needs to use markdown conversion
- `detailed` (Boolean) Specifies whether the column needs to display the layout in detail (horizontal)
- more properties [columnProps](https://cenfun.github.io/turbogrid/api.html#options.columnProps)
```js
// playwright.config.js
module.exports = {
    reporter: [
        ['monocart-reporter', {  
            name: "My Test Report",
            outputFile: './test-results/report.html',

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

            }
        }]
    ]
};
```
### Custom Formatter
> Note: the `formatter` function will be serialized into string via JSON, so closures, contexts, etc. will not work!
```js
// playwright.config.js
module.exports = {
     reporter: [
        ['monocart-reporter', {  
            name: "My Test Report",
            outputFile: './test-results/report.html',
            columns: (defaultColumns) => {

                // duration formatter
                const durationColumn = defaultColumns.find((column) => column.id === 'duration');
                durationColumn.formatter = function(value, rowItem, columnItem) {
                    if (typeof value === 'number' && value) {
                        return `<i>${value.toLocaleString()} ms</i>`;
                    }
                    return value;
                };

                // title formatter
                // Note: The title shows the tree style, it is a complicated HTML structure
                // it is recommended to format title base on previous.
                const titleColumn = defaultColumns.find((column) => column.id === 'title');
                titleColumn.formatter = function(value, rowItem, columnItem, cellNode) {
                    const perviousFormatter = this.getFormatter('tree');
                    const v = perviousFormatter(value, rowItem, columnItem, cellNode);
                    if (rowItem.type === 'step') {
                        return `${v}<div style="position:absolute;top:0;right:5px;">✅</div>`;
                    }
                    return v;
                };

            }
        }]
    ]
};
```

### Searchable Fields
```js
// playwright.config.js
module.exports = {
     reporter: [
        ['monocart-reporter', {  
            name: "My Test Report",
            outputFile: './test-results/report.html',
            columns: (defaultColumns) => {
                const locationColumn = defaultColumns.find((column) => column.id === 'location');
                locationColumn.searchable = true;
            }
        }]
    ]
};
```

## Data Collection Visitor
The `visitor` function will be executed for each row item (suite, case and step), the arguments are:
- `data` data item (suite/case/step) for reporter, you can override some of its properties or add more
- `metadata` original data object from Playwright test, could be one of [Suite](https://playwright.dev/docs/api/class-suite), [TestCase](https://playwright.dev/docs/api/class-testcase) or [TestStep](https://playwright.dev/docs/api/class-teststep)
- `collect` only one self collection for now: `collect.comments(parserOptions)` and parser options following:
    - empty for normal CommonJs syntax by default
    - `{ sourceType: 'module', plugins: ['typescript'] }` for typescript syntax
    - more [https://babeljs.io/docs/babel-parser](https://babeljs.io/docs/babel-parser)
```js
// playwright.config.js
module.exports = {
    reporter: [
        ['monocart-reporter', {  
            name: "My Test Report",
            outputFile: './test-results/report.html',
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
            }
        }]
    ]
};
```
### Adding Comments to Your Tests
> Compared with importing external library, code comments are good enough to provide extra information without breaking existing code, and no dependencies, clean, easy to read, etc. Each comment info starts with `@` which is similar to JSDoc.
* Case
```js
/**
 * add extra information for case
 * @owner Kevin
 * @jira MCR-16888
 */
test('case title', () => { 

});

/**
 * @description multiple lines text description
multiple lines text description
multiple lines text description
 * @jira MCR-16888
*/
test('case description', () => {

});

```
* Describe
```js
/**
 * add extra information for describe
 * @owner Mark
 * @jira MCR-16900
 */
test.describe('suite title', () => {

});
```
* Step
```js
test('case title', ({ browserName }, testInfo) => {

    /**
     * override assert step title "expect.toBe" to
     * @title my custom assert step title
     * @annotations important
     */
    expect(testInfo).toBe(test.info());

    // @owner Steve
    await test.step('step title', () => {
       
    });

});
```
* Hooks
```js
/**
 * override "beforeAll hook" title to
 * @title do something before all
 */
test.beforeAll(() => { 

});

/**
 * override "beforeEach hook" title to
 * @title do something before each
 */
test.beforeEach(() => { 
    
});
```
* File
```js
/**
 * add extra information for file in the first line 
 * @owner FO
 */
const { test, expect } = require('@playwright/test');
```
* Project (Can't use comments but use project `metadata`)
```js
// playwright.config.js
module.exports = {
    projects: [
        {
            name: 'Desktop Chromium',
            metadata: {
                owner: 'PO'
            }
        }
    ]
};  
```
### Removing Secrets and Sensitive Data from Report
> The report may hosted outside of the organization’s internal boundaries, security becomes a big issue. Any secrets or sensitive data, such as usernames, passwords, tokens and API keys, should be handled with extreme care. The following example is removing the password and token from the step title with the string replacement in `visitor` function.
```js
// playwright.config.js
module.exports = {
    reporter: [
        ['monocart-reporter', {  
            name: "My Test Report",
            outputFile: './test-results/report.html',
            visitor: (data, metadata, collect) => {
                // remove secrets and sensitive data from reporter
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
            }
        }]
    ]
};
```

## Style Tags
* Add tag to test/describe title ( starts with `@` )
```js
test('test title @smoke @critical', () => { });
test.describe('describe title @smoke @critical', () => { });
```
* Custom tag style
```js
// playwright.config.js
module.exports = {
    reporter: [
        ['monocart-reporter', {  
            name: "My Test Report",
            outputFile: './test-results/report.html',
            tags: {
                smoke: {
                    style: {
                        background: '#6F9913'
                    },
                    description: 'This is Smoke Test'
                },
                critical: {
                    background: '#c00'
                }
            }
        }]
    ]
};
```

## Metadata
* add `metadata` to config
```js
// playwright.config.js
module.exports = {
    globalSetup: require.resolve('./common/global-setup.js'),
    metadata: {
        product: 'Monocart',
        env: 'STG',
        type: 'Regression',
        executor: 'Mono',
        
        // test home page object model
        url: 'https://www.npmjs.org/package/monocart-reporter',
        // test addInitScript
        clientPath: 'tests/common/client.js'
    },
     reporter: [
        ['monocart-reporter', {  
            name: "My Test Report",
            outputFile: './test-results/report.html'
        }]
    ]
};
```
* collect metadata in global setup
```js
// ./common/global-setup.js
import { chromium } from '@playwright/test';
export default async (config) => {
    const metadata = config.metadata;
    // collect data and save to metadata
    const browser = await chromium.launch();
    const chromiumVersion = await browser.version();
    metadata.chromiumVersion = chromiumVersion;
};
```

## Trend Chart
> Note: the trend chart requires historical data generally stored in the server database. There is a serverless solution which is connecting and collecting historical trend data from previous report data before test every time.
- If a report is generated in the same place every time, you can simply connect the data with the report JSON path (the data is not 100% safe if there is any runtime error, the previous output dir will be empty by Playwright but the reporter processing not finish)
```js
// playwright.config.js
module.exports = {
    reporter: [
        ['monocart-reporter', {  
            name: "My Test Report",
            outputFile: './test-results/report.html',
            // connect previous report data for trend chart
            trend: './test-results/report.json'
        }]
    ]
};
```
- Recommended: resolve the data by yourself (could be requested from the server), required data fields: 
    - `date` (Number) the previous test date in milliseconds
    - `duration` (Number) the previous test duration
    - `summary` (Object) the previous test summary 
    - `trends` (Array) historical data list, but except the previous self
```js
// playwright.config.js
module.exports = {
    reporter: [
        ['monocart-reporter', {  
            name: "My Test Report",
            outputFile: './test-results/report.html',
            // connect previous report data for trend chart
            trend: async () => {
                const previousReportData = await readDataFromSomeWhere("path-to/report.json");
                // do some data filtering to previous trends
                previousReportData.trends = previousReportData.trends.filter((item) => {
                    // remove data a week ago
                    return item.date > (Date.now() - 7 * 24 * 60 * 60 * 1000)
                });
                return previousReportData;
            }
        }]
    ]
};
```

## Merge Shard Reports
There will be multiple reports to be generated if Playwright test executes in sharding mode. for example:
```sh
npx playwright test --shard=1/3
npx playwright test --shard=2/3
npx playwright test --shard=3/3
```
There are 3 reports will be generated. Using `MonocartReporter.merge()` API to merge all reports into one.
> Note: one more suite level "shard" will be added, its title will be the machine hostname, and the summary will be restated. You may need to transfer the attachments by yourself and update the path of the attachments with `attachmentPath` API.
```js
import MonocartReporter from 'monocart-reporter';

const reportDataList = [
    // json file path
    'path-to/shard1/index.json',
    'path-to/shard2/index.json',
    // or JSON data
    JSON.parse(fs.readFileSync(path.resolve('path-to/shard3/index.json')))
];

await MonocartReporter.merge(reportDataList, {
    name: 'My Merged Report',
    outputFile: 'merged-report/index.html',
    attachmentPath: (currentPath, extras) => {
       // return `https://cenfun.github.io/monocart-reporter/${currentPath}`;
    },
    onEnd: async (reportData, capability) => {
        // send email or third party integration
    }
});
```
example: [merged report](https://cenfun.github.io/monocart-reporter-test/merged)

## onEnd hook
The `onEnd` function will be executed after report generated. the arguments are:
- `reportData` all report data, properties:
    - `name` (String) report name 
    - `date` (Number) start date in milliseconds 
    - `dateH` (String) human-readable date with `Date.toLocaleString()` 
    - `duration` (Number) test duration in milliseconds 
    - `durationH` (String) human-readable duration
    - `summary` (Object) test summary, includes tests, suites, steps, etc.
    - `rows` and `columns` (Array) all rows and columns data, both are tree structure, see [detail](https://cenfun.github.io/turbogrid/api.html#data)
    - `tags` (Object) tag collection
    - `metadata` (Object) metadata collection
    - `system` (Object) system information
    - `trends` (Array) historical trend data
    - `caseTypes` and `suiteTypes` (Array)
    - `cwd`, `outputDir` and `outputFile` (String)
    - `htmlPath`, `jsonPath` and `summaryTable` (String)
    - ...
- `capability` APIs:
    - `capability.forEach(callback)` Iterate over all rows of data (suites/cases/steps), return `false` will `break` loop.
    - `capability.sendEmail(emailOptions)` 
```js
// playwright.config.js
module.exports = {
    reporter: [
        ['monocart-reporter', {  
            name: "My Test Report",
            outputFile: './test-results/report.html',
            // async hook after report data generated
            onEnd: async (reportData, capability) => {
                // console.log(reportData.summary);

                // send email
                // const sendEmail = require('./common/send-email.js');
                // await sendEmail(reportData, capability);

                // testrail integration
                // const testrail = require('./common/testrail.js');
                // await testrail(reportData, capability);

                // jira + zephyr scale integration
                // const zephyrScale = require('./common/zephyr-scale.js');
                // await zephyrScale(reportData, capability);

                // jira + xray integration
                // const xray = require('./common/xray.js');
                // await xray(reportData, capability);

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

                // html to pdf
                // const toPdf = require('./common/to-pdf.js');
                // await toPdf(reportData, capability);
            }
        }]
    ]
};
```
## Send Email
Simply send email with [nodemailer](https://nodemailer.com), check example: [send-email.js](/tests/common/send-email.js)

![](/docs/email.png)


## Testrail Integration
Send results to your Testrail with [testrail-api](https://github.com/rundef/node-testrail-api), check example: [testrail.js](/tests/common/testrail.js)

![](/docs/testrail.png)

## Jira + Zephyr Scale Integration
Create test cycle and executions with [zephyr-scale-api](https://support.smartbear.com/zephyr-scale-cloud/api-docs/), check example: [zephyr-scale.js](/tests/common/zephyr-scale.js)

![](/docs/zephyr.png)

## Jira + Xray Integration
check example: [xray.js](/tests/common/xray.js)
- Import test execution results with [Xray REST API](https://docs.getxray.app/display/XRAYCLOUD/REST+API)
- Update Jira issue status with [Jira Transition API](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-issueidorkey-transitions-post)

![](/docs/xray.png)


## Slack Integration
1. Simply send message with [@slack/webhook](https://github.com/slackapi/node-slack-sdk), example: [slack-webhook.js](/tests/common/slack-webhook.js)
2. Recommended: Post chat message and upload image with [@slack/web-api](https://github.com/slackapi/node-slack-sdk), example: [slack-web-api.js](/tests/common/slack-web-api.js)

![](/docs/slack.png)

## Discord Integration
Using [Discord webhooks](https://discord.com/developers/docs/resources/webhook) to post messages to channels. example: [discord-webhook.js](/tests/common/discord-webhook.js)

![](/docs/discord.png)

## Teams Integration
Please create an [Incoming Webhooks](https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook) for the channel first. example: [teams-webhook.js](/tests/common/teams-webhook.js)

![](/docs/teams.png)

## Dingtalk/Weixin/Feishu Integration
- [dingtalk-webhook.js](/tests/common/dingtalk-webhook.js)
- [weixin-webhook.js](/tests/common/weixin-webhook.js)
- [feishu-webhook.js](/tests/common/feishu-webhook.js)

## Report UI [packages/app](packages/app)
 - Base on [Vue 3](https://github.com/vuejs/core)
 - Lightweight UI components [vine-ui](https://github.com/cenfun/vine-ui)
 - High Performance Grid [turbogrid](https://github.com/cenfun/turbogrid)
 - JSON compress/decompress with [lz-utils](https://github.com/cenfun/lz-utils)

## Dependencies
```sh
nmls -p
┌────────────────────────────┬─────────┬──────────┬──────┬───────────┬────────┐
│  Name                      │ Version │     Size │ Deps │ Deps Size │ Nested │
├────────────────────────────┼─────────┼──────────┼──────┼───────────┼────────┤
│ └ monocart-reporter        │ 1.6.12  │ 627.7 KB │   18 │   2.51 MB │      1 │
│   ├ dependencies           │         │          │      │           │        │
│   │ ├ @babel/code-frame    │ 7.21.4  │  19.6 KB │   10 │  153.0 KB │      0 │
│   │ ├ @babel/parser        │ 7.21.4  │  1.79 MB │    0 │       0 B │      0 │
│   │ ├ console-grid         │ 2.0.1   │  36.9 KB │    0 │       0 B │      0 │
│   │ ├ eight-colors         │ 1.0.3   │  14.9 KB │    0 │       0 B │      0 │
│   │ ├ lz-utils             │ 1.0.6   │  26.5 KB │    0 │       0 B │      0 │
│   │ ├ nodemailer           │ 6.9.1   │ 476.0 KB │    0 │       0 B │      0 │
│   │ └ stack-utils          │ 2.0.6   │  14.3 KB │    1 │   3.18 KB │      1 │
└────────────────────────────┴─────────┴──────────┴──────┴───────────┴────────┘
```

## CHANGELOG
- [CHANGELOG.md](CHANGELOG.md)
