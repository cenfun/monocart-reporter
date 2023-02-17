# monocart-reporter
> A [playwright](https://github.com/microsoft/playwright) test reporter (Node.js). Shows suites/cases/steps with tree style, console logs, markdown annotations, custom columns, fuzzy search.

## Preview
[https://cenfun.github.io/monocart-reporter](https://cenfun.github.io/monocart-reporter)

## Install
```sh
npm i monocart-reporter
```

## Playwright Multiple Reporters
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

    // async hook after report data generated
    onEnd: null
    // onEnd: async (reportData, config, root) => {}
}
```
See [lib/options.js](lib/options.js)

## Custom Annotations with markdown description
```js
test('test custom annotations', () => {
    test.info().annotations.push({
        type: 'issue',
        description: `## see github issues
- [monocart-reporter/issues](https://github.com/cenfun/monocart-reporter/issues)
- [playwright/custom-annotations](https://playwright.dev/docs/test-annotations#custom-annotations)
`
    });
});
```
See [playwright test annotations](https://playwright.dev/docs/test-annotations#custom-annotations)
## Advanced: Custom Columns
```js
module.exports = {
    reporter: [
        ['monocart-reporter', {  
            name: "My Test Report",
            outputFile: './test-results/report.html',

            // custom columns
            columns: (defaultColumns) => {
                // console.log(defaultColumns);

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
                    },

                    // generate the column data from playwright metadata
                    // data.type is suite, metadata is Suite, https://playwright.dev/docs/api/class-suite
                    // data.type is case, metadata is TestCase, https://playwright.dev/docs/api/class-testcase
                    // data.type is step, metadata is TestStep, https://playwright.dev/docs/api/class-teststep (seems useless for now)
                    visitor: (data, metadata) => {

                        if (data.type === 'suite') {
                            // currently we can customize suite data through test.use(obj), for example:
                            // test.use({
                            //     owner: 'Kevin',
                            //     jira: 'Epic #16888'
                            // });
                            // and get custom data like following:
                            const suiteUse = metadata._use && metadata._use.find((item) => item.fixtures);
                            if (suiteUse) {
                                return suiteUse.fixtures.owner;
                            }
                        }

                        if (data.type === 'case') {
                            // currently we can customize case data through custom annotations, for example:
                            // test.info().annotations.push({
                            //     owner: 'Musk',
                            //     jira: 'Task #16933'
                            // });
                            // and get custom data like following:
                            const annotation = metadata.annotations.find((item) => item.owner);
                            if (annotation) {
                                return annotation.owner;
                            }

                        }

                    }
                }, {
                    // another column for JIRA link
                    id: 'jira',
                    name: 'JIRA Link',
                    width: 100,
                    align: 'right',
                    styleMap: 'font-weight:normal;',

                    visitor: (data, metadata) => {

                        if (data.type === 'suite') {
                            const suiteUse = metadata._use && metadata._use.find((item) => item.fixtures);
                            if (suiteUse) {
                                return `<a href="#" target="_blank">${suiteUse.fixtures.jira}</a>`;
                            }
                        }

                        if (data.type === 'case') {
                            const annotation = metadata.annotations.find((item) => item.jira);
                            if (annotation) {
                                return `<a href="#" target="_blank">${annotation.jira}</a>`;
                            }
                        }

                    }
                });

                // support grouped columns
                defaultColumns.push({
                    id: 'group',
                    name: 'Group',
                    subs: [{
                        id: 'comments',
                        name: 'Comments',
                        width: 150,
                        // using replace formatter
                        formatter: 'replace',

                        visitor: (data, metadata) => {
                            if (data.type === 'case' && data.owner && data.jira) {
                                return '{owner} {jira}';
                            }
                        }
                    }, {
                        id: 'item2',
                        name: 'Test Item'
                    }]
                });

                // hide a default column
                // const retryColumn = defaultColumns.find((column) => column.id === 'retry');
                // retryColumn.invisible = true;

                // update a default column width
                const locationColumn = defaultColumns.find((column) => column.id === 'location');
                locationColumn.width = 150;

            }
        }]
    ]
};
```

## onEnd hook
```js
module.exports = {
    reporter: [
        ['monocart-reporter', {  
            name: "My Test Report",
            outputFile: './test-results/report.html',

            // async hook after report data generated
            onEnd: async (reportData, config, root) => {
                // you can send email or call some API here
                //await myAsyncFunction();
            }
        }]
    ]
};
```

## Example
- [tests/playwright.config.js](tests/playwright.config.js)
- [tests/example/example.spec.js](tests/example/example.spec.js)
- [tests/home-page/home-page.spec.js](tests/home-page/home-page.spec.js)

## Reporter UI [packages/app](packages/app)
 - Base on [Vue 3](https://github.com/vuejs/core)
 - Lightweight UI components [vine-ui](https://github.com/cenfun/vine-ui)
 - High Performance Grid [turbogrid](https://github.com/cenfun/turbogrid)
 - JSON compress/decompress with [lz-utils](https://github.com/cenfun/lz-utils)


## CHANGELOG
- [CHANGELOG.md](CHANGELOG.md)
