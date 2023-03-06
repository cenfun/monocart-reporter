# Monocart Reporter
![](/docs/monocart.jpg)

[![](https://img.shields.io/npm/v/monocart-reporter)](https://www.npmjs.com/package/monocart-reporter)
![](https://img.shields.io/librariesio/github/cenfun/monocart-reporter)
![](https://img.shields.io/librariesio/dependents/npm/monocart-reporter)
[![](https://badgen.net/npm/dw/monocart-reporter)](https://www.npmjs.com/package/monocart-reporter)
![](https://img.shields.io/github/license/cenfun/monocart-reporter)

* A [Playwright](https://github.com/microsoft/playwright) test [reporter](https://playwright.dev/docs/test-reporters) (Node.js)
* Shows [suites](https://playwright.dev/docs/api/class-suite)/[cases](https://playwright.dev/docs/api/class-testcase)/[steps](https://playwright.dev/docs/api/class-teststep) with tree style
* Console logs
* Fuzzy search
* Custom [annotations](https://playwright.dev/docs/test-annotations) with Markdown
* Custom columns and formatters (extra information for suite/case/step)
* Custom data collection visitor 
* Collect data from comments (similar to JsDoc)
* Output report data and summary (json)
* Send Email with [nodemailer](https://nodemailer.com) (attachments/html)

## Preview
[https://cenfun.github.io/monocart-reporter](https://cenfun.github.io/monocart-reporter)

![](/docs/report.png)

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

    // custom columns
    columns: null,
    // columns: (defaultColumns) => {},

    // additional custom visitor for columns
    visitor: null,
    // visitor: (data, metadata, collect) => {},

    // async hook after report data generated
    onEnd: null
    // onEnd: async (reportData, config, root) => {}
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
                        const valueOriginal = rowItem[columnItem.id];
                        return `<a href="${valueOriginal}" target="_blank">${valueFormatted}</a>`;
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

## Send Email with nodemailer
```js
// playwright.config.js
module.exports = {
    reporter: [
        ['monocart-reporter', {  
            name: "My Test Report",
            outputFile: './test-results/report.html',

            onEnd: async (reportData, { sendEmail, config }) => {
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
            }
        }]
    ]
};
```
### Preview in Gmail
![](/docs/email.png)

## Examples
- [tests/playwright.config.js](tests/playwright.config.js)
- [tests/example/example.spec.js](tests/example/example.spec.js)
- [tests/home-page/home-page.spec.js](tests/home-page/home-page.spec.js)

## Report UI [packages/app](packages/app)
 - Base on [Vue 3](https://github.com/vuejs/core)
 - Lightweight UI components [vine-ui](https://github.com/cenfun/vine-ui)
 - High Performance Grid [turbogrid](https://github.com/cenfun/turbogrid)
 - JSON compress/decompress with [lz-utils](https://github.com/cenfun/lz-utils)

## CHANGELOG
- [CHANGELOG.md](CHANGELOG.md)
