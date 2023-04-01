# Monocart Reporter

[![](https://img.shields.io/npm/v/monocart-reporter)](https://www.npmjs.com/package/monocart-reporter)
![](https://img.shields.io/librariesio/github/cenfun/monocart-reporter)
![](https://img.shields.io/librariesio/dependents/npm/monocart-reporter)
[![](https://badgen.net/npm/dw/monocart-reporter)](https://www.npmjs.com/package/monocart-reporter)
![](https://img.shields.io/github/license/cenfun/monocart-reporter)

* A [Playwright](https://github.com/microsoft/playwright) Test [Reporter](https://playwright.dev/docs/test-reporters) (Node.js)
* Shows [Suites](https://playwright.dev/docs/api/class-suite)/[Cases](https://playwright.dev/docs/api/class-testcase)/[Steps](https://playwright.dev/docs/api/class-teststep) with Tree Style
* Custom [annotations](https://playwright.dev/docs/test-annotations) with Markdown
* Custom Columns and Formatters (extra information for suite/case/step)
* Custom Searchable Fields
* Custom Data Collection Visitor 
* Collect Data from Comments (similar to JsDoc)
* Output Report Data and Summary (json)
* Console Logs in Order (log/error/warn/debug/info)
* Export Data (json)
* Timeline Workers Graph
* Monitor CPU and Memory Usage
* [Metadata](#metadata) Report
* [Style Tags](#style-tags)
* [Send Email](#send-email) with [nodemailer](https://nodemailer.com) (attachments/html)
* [Testrail Integration](#testrail-integration) with [testrail-api](https://github.com/rundef/node-testrail-api)
* [Slack Integration](#slack-integration) with [slack-sdk](https://github.com/slackapi/node-slack-sdk)

## Preview
[https://cenfun.github.io/monocart-reporter](https://cenfun.github.io/monocart-reporter)

![](/docs/report.gif)

[More Test Reports](https://github.com/cenfun/monocart-reporter-test)

## Install
```sh
npm i monocart-reporter
```

## Playwright Config
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

## Output Assets
- path-to/your-filename.html  
Single HTML file (data compressed), easy to transfer/deploy or open directly anywhere   
Note that test attachments (screenshots images/videos) are not included but linked with relative path in report. All attachments will be found in [playwrightConfig.outputDir](https://playwright.dev/docs/api/class-testconfig#test-config-output-dir)
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


## Default Options
```js
{
    // the report name
    name: '',

    // the output file path (relative process.cwd)
    outputFile: './test-results/report.html',

    // custom attachment path. default is relative to output file
    attachmentPath: null,
    // attachmentPath: (relativePath) => `https://cenfun.github.io/monocart-reporter/${relativePath}`,

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

    // custom columns
    columns: null,
    // columns: (defaultColumns) => {},

    // additional custom visitor for columns
    visitor: null,
    // visitor: (data, metadata, collect) => {},

    // async hook after report data generated
    onEnd: null
    // onEnd: async (reportData, capacity) => {}
}
```
See [lib/options.js](lib/options.js)

## Custom Columns and Data Collection Visitor
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

            },

            // additional custom visitor for columns
            visitor: (data, metadata, collect) => {
                // auto collect data from comments
                const comments = collect.comments();
                if (comments) {
                    Object.assign(data, comments);
                }
            }
        }]
    ]
};
```

## Adding Comments to Your Tests
> Compared to importing external libraries and calling its interface, Comments is a better way, no dependence, cleaner, easy to read, and never break the existing code.
* Case
```js
/**
 * add extra information for case
 * @owner Kevin
 * @jira MCR-16888
 */
test('case title', () => { ... });
```
* Describe
```js
/**
 * add extra information for describe
 * @owner Mark
 * @jira MCR-16900
 */
test.describe('suite title', () => { ... });
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

});
```
* Hooks
```js
/**
 * override "beforeAll hook" title to
 * @title do something before all
 */
test.beforeAll(() => { ... });

/**
 * override "beforeEach hook" title to
 * @title do something before each
 */
test.beforeEach(() => { ... });
```
* File
```js
/**
 * add extra information for file from first line 
 * @owner FO
 */
const { test, expect } = require('@playwright/test');
```
* Project (Can't use comments)
```js
// playwright.config.js
module.exports = {
    projects: [
        {
            name: 'Desktop Chromium',
            // add extra information for project with metadata
            metadata: {
                owner: 'PO'
            }
        }
    ]
};  
```

## Style Tags
* Add tag to test title (starts with @)
```js
test('test title @smoke @critical', () => { ... });
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
* add metadata to config
```js
// playwright.config.js
module.exports = {
    globalSetup: require.resolve('./common/global-setup.js'),
    metadata: {
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

## Searchable Fields
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
```

## onEnd callback
```js
// playwright.config.js
module.exports = {
    reporter: [
        ['monocart-reporter', {  
            name: "My Test Report",
            outputFile: './test-results/report.html',
            // async hook after report data generated
            onEnd: async (reportData, capacity) => {
                //await myAsyncFunction();
            }
        }]
    ]
};
```
## Send Email
### Check example: [send-email.js](/tests/common/send-email.js)
```js
// playwright.config.js
module.exports = {
    reporter: [
        ['monocart-reporter', {  
            name: "My Test Report",
            outputFile: './test-results/report.html',
            onEnd: async (reportData, capacity) => {
                const sendEmail = require('./common/send-email.js');
                await sendEmail(reportData, capacity);
            }
        }]
    ]
};
```
### Preview in Gmail
![](/docs/email.png)


## Testrail Integration
### Check example: [testrail.js](/tests/common/testrail.js)
```js
// playwright.config.js
module.exports = {
    reporter: [
        ['monocart-reporter', {  
            name: "My Test Report",
            outputFile: './test-results/report.html',
            onEnd: async (reportData, capacity) => {
                const testrail = require('./common/testrail.js');
                await testrail(reportData, capacity);
            }
        }]
    ]
};
```

### Preview Testrail Run/Results
![](/docs/testrail.png)

## Slack Integration
1. Simply send message with @slack/webhook [slack-webhook.js](/tests/common/slack-webhook.js)
```js
// playwright.config.js
module.exports = {
    reporter: [
        ['monocart-reporter', {  
            name: "My Test Report",
            outputFile: './test-results/report.html',
            onEnd: async (reportData, capacity) => {
                const slackWebhook = require('./common/slack-webhook.js');
                await slackWebhook(reportData, capacity);
            }
        }]
    ]
};
```
2. Post chat message or upload report file with @slack/web-api [slack-web-api.js](/tests/common/slack-web-api.js)
### Preview in Slack
![](/docs/slack-webhook.png)

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
│ └ monocart-reporter        │ 1.6.1   │ 582.5 KB │   18 │   2.50 MB │      1 │
│   ├ dependencies           │         │          │      │           │        │
│   │ ├ @babel/code-frame    │ 7.18.6  │  6.82 KB │   10 │  153.0 KB │      0 │
│   │ ├ @babel/parser        │ 7.21.3  │  1.79 MB │    0 │       0 B │      0 │
│   │ ├ console-grid         │ 2.0.1   │  36.9 KB │    0 │       0 B │      0 │
│   │ ├ eight-colors         │ 1.0.3   │  14.9 KB │    0 │       0 B │      0 │
│   │ ├ lz-utils             │ 1.0.6   │  26.5 KB │    0 │       0 B │      0 │
│   │ ├ nodemailer           │ 6.9.1   │ 476.0 KB │    0 │       0 B │      0 │
│   │ └ stack-utils          │ 2.0.6   │  14.3 KB │    1 │   3.18 KB │      1 │
├────────────────────────────┼─────────┼──────────┼──────┼───────────┼────────┤
│   └ packages in workspaces │         │          │      │           │        │
│     └ monocart-reporter    │ 1.6.1   │ 532.2 KB │    0 │       0 B │      0 │
└────────────────────────────┴─────────┴──────────┴──────┴───────────┴────────┘
```

## CHANGELOG
- [CHANGELOG.md](CHANGELOG.md)
