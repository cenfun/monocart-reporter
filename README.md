# Monocart Reporter

[![](https://img.shields.io/npm/v/monocart-reporter)](https://www.npmjs.com/package/monocart-reporter)
![](https://img.shields.io/librariesio/github/cenfun/monocart-reporter)
![](https://img.shields.io/librariesio/dependents/npm/monocart-reporter)
[![](https://badgen.net/npm/dw/monocart-reporter)](https://www.npmjs.com/package/monocart-reporter)
![](https://img.shields.io/github/license/cenfun/monocart-reporter)

* A [Playwright](https://github.com/microsoft/playwright) test [reporter](https://playwright.dev/docs/test-reporters) (Node.js)
* Shows [suites](https://playwright.dev/docs/api/class-suite)/[cases](https://playwright.dev/docs/api/class-testcase)/[steps](https://playwright.dev/docs/api/class-teststep) with tree style
* Console logs
* Fuzzy search
* Style Tags
* Custom [annotations](https://playwright.dev/docs/test-annotations) with Markdown
* Custom columns and formatters (extra information for suite/case/step)
* Custom data collection visitor 
* Collect data from comments (similar to JsDoc)
* Output report data and summary (json)
* Export data (json)
* [Send Email](#send-email) with [nodemailer](https://nodemailer.com) (attachments/html)
* [Testrail Integration](#testrail-integration) with [testrail-api](https://github.com/rundef/node-testrail-api)

## Preview
[https://cenfun.github.io/monocart-reporter](https://cenfun.github.io/monocart-reporter)

![](/docs/report.gif)

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
Example [tests/playwright.config.js](tests/playwright.config.js)  
Playwright Docs [https://playwright.dev/docs/test-reporters](https://playwright.dev/docs/test-reporters)

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
* for suite
```js
/**
 * add extra information for suite
 * @owner Mark
 * @jira MCR-16900
 */
test.describe('suite title', () => { ... });
```
* for case
```js
/**
 * add extra information for case
 * @owner Kevin
 * @jira MCR-16888
 */
test('case title', () => { ... });
```
* for step
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
* for hooks
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

## onEnd Hook
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

## Test Examples
- [tests/playwright.config.js](tests/playwright.config.js)
- [tests/example/example.spec.js](tests/example/example.spec.js)
- [tests/home-page/home-page.spec.js](tests/home-page/home-page.spec.js)

## Report UI [packages/app](packages/app)
 - Base on [Vue 3](https://github.com/vuejs/core)
 - Lightweight UI components [vine-ui](https://github.com/cenfun/vine-ui)
 - High Performance Grid [turbogrid](https://github.com/cenfun/turbogrid)
 - JSON compress/decompress with [lz-utils](https://github.com/cenfun/lz-utils)


 ## Articles
 - [Test automation|Test Reporting| |Playwright|Monocart](https://medium.com/@kbalaji.kks/test-automation-test-reporting-playwright-monocart-d4bb35ef12ad)

## Dependencies
```sh
nmls -p
┌────────────────────────────┬─────────┬──────────┬──────┬───────────┬────────┐
│  Name                      │ Version │     Size │ Deps │ Deps Size │ Nested │
├────────────────────────────┼─────────┼──────────┼──────┼───────────┼────────┤
│ └ monocart-reporter        │ 1.5.1   │ 532.4 KB │   18 │   2.50 MB │      1 │
│   ├ dependencies           │         │          │      │           │        │
│   │ ├ @babel/code-frame    │ 7.18.6  │  6.82 KB │   10 │  153.0 KB │      0 │
│   │ ├ @babel/parser        │ 7.21.3  │  1.79 MB │    0 │       0 B │      0 │
│   │ ├ console-grid         │ 2.0.1   │  36.9 KB │    0 │       0 B │      0 │
│   │ ├ eight-colors         │ 1.0.3   │  14.9 KB │    0 │       0 B │      0 │
│   │ ├ lz-utils             │ 1.0.5   │  25.2 KB │    0 │       0 B │      0 │
│   │ ├ nodemailer           │ 6.9.1   │ 476.0 KB │    0 │       0 B │      0 │
│   │ └ stack-utils          │ 2.0.6   │  14.3 KB │    1 │   3.18 KB │      1 │
├────────────────────────────┼─────────┼──────────┼──────┼───────────┼────────┤
│   └ packages in workspaces │         │          │      │           │        │
│     └ monocart-reporter    │ 1.5.0   │ 487.5 KB │    0 │       0 B │      0 │
└────────────────────────────┴─────────┴──────────┴──────┴───────────┴────────┘
```

## CHANGELOG
- [CHANGELOG.md](CHANGELOG.md)
