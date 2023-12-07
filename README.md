# Monocart Reporter

[![](https://img.shields.io/npm/v/monocart-reporter)](https://www.npmjs.com/package/monocart-reporter)
[![](https://badgen.net/npm/dw/monocart-reporter)](https://www.npmjs.com/package/monocart-reporter)
![](https://img.shields.io/github/license/cenfun/monocart-reporter)

* A [Playwright](https://github.com/microsoft/playwright) Test [Reporter](https://playwright.dev/docs/test-reporters) (Node.js)
    - Shows Test Report in A `Tree Grid`
    - Console Logs in Order (log/error/warn/debug/info)
    - Custom Annotations with Markdown 
    - Timeline Workers Graph
    - Monitor CPU and Memory Usage
    - Export Data (json)
* [Preview](#preview)
* [Install](#install)
* [Playwright Config](#playwright-config)
* [Examples](#examples)
* [Output](#output) HTML and JSON
* [Reporter Options](#reporter-options)
* [View Trace Online](#view-trace-online)
* [Custom Columns](#custom-columns) (Extra properties for suite/case/step)
    - [Custom Formatter](#custom-formatter)
    - [Searchable Fields](#searchable-fields)
* [Custom Data Visitor](#custom-data-visitor) (Extra data collection for suite/case/step)
    - [Collect Data from the Title](#collect-data-from-the-title)
    - [Collect Data from the Annotations](#collect-data-from-the-annotations)
    - [Collect Data from the Comments](#collect-data-from-the-comments) (Recommended)
    - [Remove Secrets and Sensitive Data](#remove-secrets-and-sensitive-data)
* [Style Tags](#style-tags)
* [Metadata](#metadata)
* [Trend Chart](#trend-chart)
* [Attach Lighthouse Audit Report](#attach-lighthouse-audit-report)
* [Code Coverage Report](#code-coverage-report)
    - [Coverage Options](#coverage-options)
    - [Istanbul](#istanbul)
    - [V8](#v8)
    - [V8 to Istanbul](#v8-to-istanbul)
    - [Istanbul vs V8](#istanbul-vs-v8)
    - [Global Coverage Report](#global-coverage-report) for Component Testing
* [Attach Network Report](#attach-network-report)
* [Global State Management](#global-state-management)
    - [Setup Global State](#setup-global-state)
    - [Get, Set, and Remove Global Data](#get-set-and-remove-global-data)
    - [Send and Receive Messages between Processes](#send-and-receive-messages-between-processes)
* [Merge Shard Reports](#merge-shard-reports)
* [onEnd Hook](#onend-hook)
    - [Send Email](#send-email)
    - [Testrail Integration](#testrail-integration)
    - [Jira + Zephyr Scale Integration](#jira--zephyr-scale-integration)
    - [Jira + Xray Integration](#jira--xray-integration)
    - [Slack Integration](#slack-integration)
    - [Discord Integration](#discord-integration)
    - [Teams Integration](#teams-integration)
    - [Dingtalk/Weixin/Feishu Integration](#dingtalkweixinfeishu-integration)
* [Contributing](#contributing)
* [Changelog](CHANGELOG.md)
## Preview
[https://cenfun.github.io/monocart-reporter](https://cenfun.github.io/monocart-reporter)

![](/docs/report.gif)

![](/docs/cli.png)

[More Test Reports](https://github.com/cenfun/monocart-reporter-test)

## Install
```sh
npm i -D monocart-reporter
```

## Playwright Config
> Note: Most examples use `CommonJS` by default, please [move to ESM](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c#how-can-i-move-my-commonjs-project-to-esm) according to your needs.
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
- [tests](/tests/)
- [more](https://github.com/cenfun/monocart-reporter-test/tree/main/tests) 
## Output
- path-to/your-filename.html  
Single HTML file (data compressed), easy to transfer/deploy or open directly anywhere   
> Note: Test attachments (screenshots images/videos) are not included but linked with relative path in report. All attachments will be found in [playwrightConfig.outputDir](https://playwright.dev/docs/api/class-testconfig#test-config-output-dir)
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
    // attachmentPath: (currentPath, extras) => `https://another-path/${currentPath}`,

    traceViewerUrl: 'https://trace.playwright.dev/?trace={traceUrl}',

    // logging levels: off, error, info, debug
    logging: 'info',

    // timezone offset in minutes, GMT+0800 = -480
    timezoneOffset: 0,

    // global coverage settings for addCoverageReport API
    coverage: null,
    // coverage: {
    //     entryFilter: (entry) => true,
    //     sourceFilter: (sourcePath) => sourcePath.search(/src\/.+/) !== -1,
    // },

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

## View Trace Online 
> The [Trace Viewer](https://trace.playwright.dev/) requires that the trace file must be loaded over the http:// or https:// protocols without [CORS](https://developer.mozilla.org/en-US/docs/Glossary/CORS) issue, try following start a local web server:
```sh
# serve and open report
npx monocart show-report <your-outputFile-path>

# serve report
npx monocart serve-report <your-outputFile-path>
```
Or customize your own trace viewer url with option `traceViewerUrl` defaults to  `https://trace.playwright.dev/?trace={traceUrl}`

## Custom Columns
The report will be displayed in a `Tree Grid`. The `columns` function is used to customize the grid columns. The column properties following:
- `id` (String) Column id (required)
- `name` (String) Column name, shows in grid header
- `align` (String) left (default), center, right
- `width` (Number) Column width
- `minWidth`, `maxWidth` (Number) Default to 81 ~ 300
- `styleMap` (Object, String) Column style (css)
- `formatter` (Function) [column formatter](#custom-formatter). Arguments: value, rowItem, columnItem, cellNode
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
> Note: The `formatter` function will be serialized into string via JSON, so closures, contexts, etc. will not work!
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

## Custom Data Visitor
The `visitor` function will be executed for each row item (suite, case and step). Arguments:
- `data` data item (suite/case/step) for reporter, you can rewrite some of its properties or add more
- `metadata` original data object from Playwright test, could be one of [Suite](https://playwright.dev/docs/api/class-suite), [TestCase](https://playwright.dev/docs/api/class-testcase) or [TestStep](https://playwright.dev/docs/api/class-teststep)
- `collect` see [collect data from the comments](#collect-data-from-the-comments)

### Collect Data from the Title
For example, we want to parse out the jira key from the title:
```js
test('[MCR-123] collect data from the title', () => {

});
```
You can simply use regular expressions to parse and get jira key:
```js
// playwright.config.js
module.exports = {
    reporter: [
        ['monocart-reporter', {  
            name: "My Test Report",
            outputFile: './test-results/report.html',
            visitor: (data, metadata, collect) => {
                // [MCR-123] collect data from the title
                const matchResult = metadata.title.match(/\[(.+)\]/);
                if (matchResult && matchResult[1]) {
                    data.jira = matchResult[1];
                }
            }
        }]
    ]
};
```
multiple matches example: [collect-data](https://github.com/cenfun/monocart-reporter-test/tree/main/tests/collect-data)

### Collect Data from the Annotations
It should be easier than getting from title. see [custom annotations](https://playwright.dev/docs/test-annotations#custom-annotations) via `test.info().annotations`
```js
test('collect data from the annotations', () => {
    test.info().annotations.push({
        type: "jira",
        description: "MCR-123"
    })
});
```
```js
// playwright.config.js
module.exports = {
    reporter: [
        ['monocart-reporter', {  
            name: "My Test Report",
            outputFile: './test-results/report.html',
            visitor: (data, metadata, collect) => {
                // collect data from the annotations
                if (metadata.annotations) {
                    const jiraItem = metadata.annotations.find((item) => item.type === 'jira');
                    if (jiraItem && jiraItem.description) {
                        data.jira = jiraItem.description;
                    }
                }
            }
        }]
    ]
};
```

### Collect Data from the Comments
> The code comments are good enough to provide extra information without breaking existing code, and no dependencies, clean, easy to read, etc. 
- First, add the collection of comments in the visitor. 
> Note: If there are any parsing error messages in red lines, try other parser options like `sourceType: 'module'` or `plugins: ['typescript']` according to your situation.
```js
// playwright.config.js
module.exports = {
    reporter: [
        ['monocart-reporter', {  
            name: "My Test Report",
            outputFile: './test-results/report.html',
            // additional custom visitor for columns
            visitor: (data, metadata, collect) => {
                
                // auto collect data from the comments
                const parserOptions = {
                    // Indicate the mode the code should be parsed in.
                    // Can be one of "script", "module", or "unambiguous". Defaults to "script".
                    // sourceType: 'module',

                    // enable typescript syntax.
                    // plugins: ['typescript']

                    // more https://babeljs.io/docs/babel-parser
                };
                const comments = collect.comments(parserOptions);
                if (comments) {
                    // Append all collected comments data to report data
                    Object.assign(data, comments);
                }

            }
        }]
    ]
};
```

- Then, add comments to your tests
> Note: Each comment item must start with `@` which is similar to [JSDoc](https://jsdoc.app/).

For example, we want to add `owner` and `jira` or others for the cases, steps, and suites, or rewrite the step `title`
```js
/**
 * for case
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
```js
test('case title', ({ browserName }, testInfo) => {

    /**
     * rewrite assert step title "expect.toBe" to
     * @title my custom assert step title
     * @annotations important
     */
    expect(testInfo).toBe(test.info());

    // @owner Steve
    await test.step('step title', () => {
       
    });

});

/**
 * rewrite "beforeAll hook" title to
 * @title do something before all
 */
test.beforeAll(() => { 

});

/**
 * rewrite "beforeEach hook" title to
 * @title do something before each
 */
test.beforeEach(() => { 
    
});
```
```js
/**
 * for describe
 * @owner Mark
 * @jira MCR-16900
 */
test.describe('suite title', () => {

});
```
```js
/**
 * for file (comment file in the first line)
 * @owner FO
 */
const { test, expect } = require('@playwright/test');
```

### Remove Secrets and Sensitive Data
> The report may hosted outside of the organization’s internal boundaries, security becomes a big issue. Any secrets or sensitive data, such as usernames, passwords, tokens and API keys, should be handled with extreme care. The following example is removing the password and token from the report data with the string replacement in `visitor` function.
```js
// playwright.config.js
module.exports = {
    reporter: [
        ['monocart-reporter', {  
            name: "My Test Report",
            outputFile: './test-results/report.html',
            visitor: (data, metadata, collect) => {
                const mySecrets = [process.env.PASSWORD, process.env.TOKEN];
                mySecrets.forEach((secret) => {
                    // remove from title
                    data.title = data.title.replace(secret, '***');
                    // remove from logs
                    if (data.logs) {
                        data.logs = data.logs.map((item) => item.replace(secret, '***'));
                    }
                    // remove from errors
                    if (data.errors) {
                        data.errors = data.errors.map((item) => item.replace(secret, '***'));
                    }
                });
            }
        }]
    ]
};
```
see example: [remove-secrets](https://github.com/cenfun/monocart-reporter-test/tree/main/tests/remove-secrets)

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
        url: 'https://www.npmjs.org/package/monocart-reporter'
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
> Note: The trend chart requires historical data generally stored in the server database. There is a serverless solution which is connecting and collecting historical trend data from previous report data before test every time.
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

## Attach Lighthouse Audit Report
Attach an audit report with API `attachAuditReport(runnerResult, testInfo)`. Arguments:
- `runnerResult` lighthouse result. see [lighthouse](https://github.com/GoogleChrome/lighthouse/tree/main/docs)
- `testInfo` see [TestInfo](https://playwright.dev/docs/api/class-testinfo)
```js
const { test, chromium } = require('@playwright/test');
const { attachAuditReport } = require('monocart-reporter');
const lighthouse = require('lighthouse/core/index.cjs');
test('attach lighthouse audit report', async () => {
    const port = 9222;
    const browser = await chromium.launch({
        args: [`--remote-debugging-port=${port}`]
    });
    const options = {
        // logLevel: 'info',
        // onlyCategories: ['performance', 'best-practices', 'seo'],
        output: 'html',
        port
    };
    const url = 'https://github.com/cenfun/monocart-reporter';
    const runnerResult = await lighthouse(url, options);
    await browser.close();
    await attachAuditReport(runnerResult, test.info());
});

```

## Code Coverage Report
The reporter integrates [monocart-coverage-reports](https://github.com/cenfun/monocart-coverage-reports) for coverage reports, there are two APIs:
- `attachCoverageReport(data, testInfo, options)` Attach a coverage report to a test. Arguments:
    - `data` There are two supported data inputs: [Istanbul](#istanbul) (Object) or [V8](#v8) (Array)
    - `testInfo` see [TestInfo](https://playwright.dev/docs/api/class-testinfo)
    - `options` (Object) see [Coverage Options](#coverage-options)
- `addCoverageReport(data, testInfo)` Add coverage to global coverage report from a test. see [Global Coverage Report](#global-coverage-report)

### Coverage Options
- Default [options](https://github.com/cenfun/monocart-coverage-reports/blob/main/lib/default/options.js)
- More examples [monocart-coverage-reports](https://github.com/cenfun/monocart-coverage-reports)

### [Istanbul](https://github.com/istanbuljs) 
Requires your source code is instrumented. Usually we can use the tool [babel-plugin-istanbul](https://github.com/istanbuljs/babel-plugin-istanbul) to build instrumenting code. (see example: [webpack.config-istanbul.js](https://github.com/cenfun/monocart-reporter-test/blob/main/packages/coverage/webpack.config-istanbul.js)) The instrumented code will automatically generate coverage data and save it on `window.__coverage__`. The Istanbul HTML report will be generated and attached to the test report as an attachment.
```js
import { test, expect } from '@playwright/test';
import { attachCoverageReport } from 'monocart-reporter';

test('Take Istanbul coverage report', async ({ page }) => {

    await page.goto('http://localhost:8090/coverage/istanbul.html');

    // delay for mock code execution
    await new Promise((resolve) => {
        setTimeout(resolve, 500);
    });

    // take Istanbul coverage
    const coverageData = await page.evaluate(() => window.__coverage__);
    await page.close();
    expect(coverageData, 'expect found Istanbul data: __coverage__').toBeTruthy();

    // coverage report
    const report = await attachCoverageReport(coverageData, test.info(), {
        lcov: true
    });
    console.log(report.summary);

});
```

### [V8](https://v8.dev/blog/javascript-code-coverage)
Simply take coverage data with  [class-coverage](https://playwright.dev/docs/api/class-coverage) APIs, so it is [Chromium-based only](https://chromedevtools.github.io/devtools-protocol/tot/Profiler/#type-ScriptCoverage), the V8 HTML report will be generated.
```js
import { test, expect } from '@playwright/test';
import { attachCoverageReport } from 'monocart-reporter';

test('Take V8 and Istanbul coverage report', async ({ page }) => {

    await Promise.all([
        page.coverage.startJSCoverage({
            resetOnNavigation: false
        }),
        page.coverage.startCSSCoverage({
            resetOnNavigation: false
        })
    ]);

    await page.goto('http://localhost:8090/coverage/v8.html');

    // delay for mock code execution
    await new Promise((resolve) => {
        setTimeout(resolve, 500);
    });

    const [jsCoverage, cssCoverage] = await Promise.all([
        page.coverage.stopJSCoverage(),
        page.coverage.stopCSSCoverage()
    ]);
    await page.close();

    const coverageList = [... jsCoverage, ... cssCoverage];

    const v8 = await attachCoverageReport(coverageList, test.info(), {
        
    });
    console.log(v8.summary);

});
```

![](/docs/v8.gif)

### V8 to Istanbul
Take V8 coverage data and convert it to Istanbul's coverage format. The Istanbul HTML report will be generated. 
```js
const report = await attachCoverageReport(coverageList, test.info(), {
    reports: "html"
});
```

### Istanbul vs V8
- [Compare Istanbul, V8 and V8 to Istanbul Reports](https://github.com/cenfun/monocart-coverage-reports#compare-reports)
- [Compare Istanbul and V8 Workflows](https://github.com/cenfun/monocart-coverage-reports#compare-workflows)

### Global Coverage Report
The global coverage report will not be attached to any test case, but will merge all coverages into one global report after all the tests are finished. 
- The global coverage options see [Coverage Options](#coverage-options)
```js
// playwright.config.js
module.exports = {
    reporter: [
        ['monocart-reporter', {  
            name: "My Test Report",
            outputFile: './test-results/report.html',
            // global coverage report options
            coverage: {
                entryFilter: (entry) => true,
                sourceFilter: (sourcePath) => sourcePath.search(/src\/.+/) !== -1,
            }
        }]
    ]
};
```
- It is recommended to use [automatic fixtures](https://playwright.dev/docs/test-fixtures#automatic-fixtures) to add coverage for each test:
```js
// fixtures.js for v8
import { test as testBase, expect } from '@playwright/test';
import { addCoverageReport } from 'monocart-reporter';

const test = testBase.extend({
    autoTestFixture: [async ({ page }, use) => {

        const isChromium = test.info().project.name === 'Desktop Chromium';

        // console.log('autoTestFixture setup...');
        // coverage API is chromium only
        if (isChromium) {
            await Promise.all([
                page.coverage.startJSCoverage({
                    resetOnNavigation: false
                }),
                page.coverage.startCSSCoverage({
                    resetOnNavigation: false
                })
            ]);
        }

        await use('autoTestFixture');

        // console.log('autoTestFixture teardown...');
        if (isChromium) {
            const [jsCoverage, cssCoverage] = await Promise.all([
                page.coverage.stopJSCoverage(),
                page.coverage.stopCSSCoverage()
            ]);
            const coverageList = [... jsCoverage, ... cssCoverage];
            // console.log(coverageList.map((item) => item.url));
            await addCoverageReport(coverageList, test.info());
        }

    }, {
        scope: 'test',
        auto: true
    }]
});
export { test, expect };
```
- The coverage examples for Playwright component testing:
    - [playwright-ct-vue](https://github.com/cenfun/playwright-ct-vue)
    - [playwright-ct-react](https://github.com/cenfun/playwright-ct-react)
    - [playwright-ct-svelte](https://github.com/cenfun/playwright-ct-svelte)

## Attach Network Report
Attach a network report with API `attachNetworkReport(har, testInfo)`. Arguments:
- `har` HAR path (String) or HAR file buffer (Buffer). see [HAR 1.2 Spec](http://www.softwareishard.com/blog/har-12-spec/)
- `testInfo` see [TestInfo](https://playwright.dev/docs/api/class-testinfo)

 Generate HAR with `recordHar` option in browser.newContext() (see example: [report-network.spec.js](https://github.com/cenfun/monocart-reporter/blob/main/tests/report-network/report-network.spec.js) preview [report](https://cenfun.github.io/monocart-reporter/network-1a18723ee59b36867898/index.html))

```js
const fs = require('fs');
const path = require('path');
const { test } = require('@playwright/test');
const { attachNetworkReport } = require('monocart-reporter');
let context;
test.describe('attach network report 1', () => {

    const harPath = path.resolve('.temp/network-report1.har');
    if (fs.existsSync(harPath)) {
        // remove previous
        fs.rmSync(harPath);
    }

    test('first, open page', async ({ browser }) => {
        context = await browser.newContext({
            recordHar: {
                path: harPath
            }
        });
        const page = await context.newPage();
        await page.goto('https://github.com/cenfun/monocart-reporter');
    });

    test('next, run test cases', async () => {
        
    });

    test('finally, attach HAR', async () => {
        // Close context to ensure HAR is saved to disk.
        await context.close();
        await attachNetworkReport(harPath, test.info());
    });
});
```
Generate HAR with [playwright-har](https://github.com/janzaremski/playwright-har)
```js
import { test } from '@playwright/test';
import { attachNetworkReport } from 'monocart-reporter';
import { PlaywrightHar } from 'playwright-har';

const harPath = path.resolve('.temp/network-report2.har');
if (fs.existsSync(harPath)) {
    // remove previous
    fs.rmSync(harPath);
}

test('first, open page', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    playwrightHar = new PlaywrightHar(page);
    await playwrightHar.start();
    await page.goto('https://github.com/cenfun/monocart-reporter');
});

test('next, run test cases', async () => {
    
});

test('finally, attach HAR', async () => {
    await playwrightHar.stop(harPath);
    await attachNetworkReport(harPath, test.info());
});
```
Preview [Network HTML Report](https://cenfun.github.io/monocart-reporter/network-da7f5b4cceb1e6280782/index.html)

## Global State Management
When tests are executed in [isolation](https://playwright.dev/docs/browser-contexts) mode, the reporter and each test may run in a different process, they cannot share data with each other. we can start a local WebSocket server to serve the global data, and read/write the global data with `useState` API from a test.
### Setup Global State
```js
module.exports = {
    reporter: [
        ['list'],
        ['monocart-reporter', {  
            name: "My Test Report",
            outputFile: './test-results/report.html',
            state: {
                data: {
                    count: 0
                },
                server: {
                    // port: 8130
                },
                onClose: (data, config) => {
                    // save state data to global metadata
                    Object.assign(config.metadata, data);
                }
            }
        }]
    ]
};
```
### Get, Set, and Remove Global Data
```js
const { test } = require('@playwright/test');
const { useState } = require('monocart-reporter');
test('state test', async ({ browserName }) => {
    const state = useState({
        // port: 8130
    });

    const count = await state.get('count');
    console.log('count', count);

    await state.set('count', count + 1);

    await state.set({
        browser: browserName,
        someKey: 'some value'
    });

    const [browser, someKey] = await state.get('browser', 'someKey');
    console.log(browser, someKey);

    await state.remove('someKey');

    const all = await state.get();
    console.log(all);
});
``` 
### Send and Receive Messages between Processes
- send message and receive response from a test (child process)
```js
const { test } = require('@playwright/test');
const { useState } = require('monocart-reporter');
test('state test send message', async () => {
    const state = useState({
        // port: 8130
    });
    const response = await state.send({
        testId: test.info().testId,
        data: 'my test data'
    });
    console.log('receive response on client', response);
});
``` 
- receive message and send response from global state (main process)
```js
module.exports = {
    reporter: [
        ['list'],
        ['monocart-reporter', {  
            name: "My Test Report",
            outputFile: './test-results/report.html',
            state: {
                onReceive: function(message) {
                    const test = this.getTest(message.testId);
                    if (test) {
                        // current test
                    }
                    console.log('receive message on server', message);
                    return {
                        data: 'my response data'
                    };
                }
            }
        }]
    ]
};
```
see example: [Allow specified test cases to run in sequence mode with lock/unlock state](https://github.com/cenfun/monocart-reporter-test/tree/main/tests/global-state)

## Merge Shard Reports
There will be multiple reports to be generated if Playwright test executes in sharding mode. for example:
```sh
npx playwright test --shard=1/3
npx playwright test --shard=2/3
npx playwright test --shard=3/3
```
There are 3 reports will be generated. Using `merge(reportDataList, options)` API to merge all reports into one.
> Note: One more suite level "shard" will be added, its title will be the machine hostname, and the summary will be restated. You may need to transfer the attachments by yourself and update the path of the attachments with `attachmentPath` API.
```js
import { merge } from 'monocart-reporter';

const reportDataList = [
    // json file path
    'path-to/shard1/index.json',
    'path-to/shard2/index.json',
    // or JSON data
    JSON.parse(fs.readFileSync(path.resolve('path-to/shard3/index.json')))
];

await merge(reportDataList, {
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
Preview [merged report](https://cenfun.github.io/monocart-reporter-test/merged)

## onEnd Hook
The `onEnd` function will be executed after report generated. Arguments:
- `reportData` all report data, properties:
    - `name` (String) report name 
    - `date` (Number) start date in milliseconds 
    - `dateH` (String) human-readable date with `Date.toLocaleString()` 
    - `duration` (Number) test duration in milliseconds 
    - `durationH` (String) human-readable duration
    - `summary` (Object) test summary, includes `tests`, `suites`, `steps`, etc.
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
            }
        }]
    ]
};
```
## Send Email
- Simply send email with [nodemailer](https://nodemailer.com)
- Example: [send-email](https://github.com/cenfun/monocart-reporter-test/tree/main/integrations/send-email)

## Testrail Integration
- Send test results to your [Testrail](https://www.testrail.com/)
- Example: [testrail](https://github.com/cenfun/monocart-reporter-test/tree/main/integrations/testrail)

## Jira + Zephyr Scale Integration
- Create test cycle and executions with [zephyr-scale-api](https://support.smartbear.com/zephyr-scale-cloud/api-docs/)
- Example: [zephyr-scale](https://github.com/cenfun/monocart-reporter-test/tree/main/integrations/zephyr-scale)

## Jira + Xray Integration
- Import test execution results with [Xray REST API](https://docs.getxray.app/display/XRAYCLOUD/REST+API)
- Update Jira issue status with [Jira Transition API](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-issueidorkey-transitions-post)
- Example: [xray](https://github.com/cenfun/monocart-reporter-test/tree/main/integrations/xray)

## Slack Integration
- Simply send message with [@slack/webhook](https://github.com/slackapi/node-slack-sdk) 
- Example: [slack-webhook](https://github.com/cenfun/monocart-reporter-test/tree/main/integrations/slack-webhook)
- Post chat message and upload image with [@slack/web-api](https://github.com/slackapi/node-slack-sdk) 
- Example: [slack-web-api](https://github.com/cenfun/monocart-reporter-test/tree/main/integrations/slack-web-api)

## Discord Integration
- Using [Discord webhooks](https://discord.com/developers/docs/resources/webhook) to post messages to channels.
- Example: [discord-webhook](https://github.com/cenfun/monocart-reporter-test/tree/main/integrations/discord-webhook)

## Teams Integration
- Please create an [Incoming Webhooks](https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook) for the channel first. 
- Example: [teams-webhook](https://github.com/cenfun/monocart-reporter-test/tree/main/integrations/teams-webhook)

## Dingtalk/Weixin/Feishu Integration
- [dingtalk-webhook](https://github.com/cenfun/monocart-reporter-test/tree/main/integrations/dingtalk-webhook)
- [weixin-webhook](https://github.com/cenfun/monocart-reporter-test/tree/main/integrations/weixin-webhook)
- [feishu-webhook](https://github.com/cenfun/monocart-reporter-test/tree/main/integrations/feishu-webhook)


## Contributing
```sh
npm install starfall-cli -g
npm install
npm run test
npm run build
npm run dev
```
## Dependencies
 - UI Framework [Vue 3](https://github.com/vuejs/core)
 - Lightweight UI Components [vine-ui](https://github.com/cenfun/vine-ui)
 - High Performance Grid [turbogrid](https://github.com/cenfun/turbogrid)
 - String compress/decompress [lz-utils](https://github.com/cenfun/lz-utils)
