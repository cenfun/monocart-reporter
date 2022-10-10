# monocart-reporter
> A [playwright](https://github.com/microsoft/playwright) test reporter (Node.js). Shows suites/cases/steps with tree style.

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
      //the dir relative process.cwd
      outputFile: './test-results/index.html'
    }]
  ]
};
```
see example [tests/playwright.config.js](tests/playwright.config.js)  
more [https://playwright.dev/docs/test-reporters](https://playwright.dev/docs/test-reporters)

## Output Assets
- path-to/your-filename.html  
Single HTML file, easy to transfer/deploy or open directly anywhere   
Note that test attachments (screenshots images/videos) are not included but linked with relative path in report. All attachments will be found in [playwrightConfig.outputDir](https://playwright.dev/docs/api/class-testconfig#test-config-output-dir)
```js
// playwright.config.js
// attachments outputDir and report outputFile used same folder
const date = new Date().toISOString().slice(0, 10); //2022-10-10
const outputDir = `./test-results-${date}`;
module.exports = {
  outputDir: outputDir,
  reporter: [
    ['monocart-reporter', {  
      name: `My Test Report ${date}`,
      outputFile: `${outputDir}/index.html`
    }]
  ]
};
// deploy the folder to your report site and easy to checking online
// http://your.report.site/test-results-2022-10-10
```
- path-to/your-filename.json  
Separated metadata file (Already included in the above HTML and compressed, it can be deleted)

## Report UI [packages/app](packages/app)
 - Base on [Vue 3](https://github.com/vuejs/core)
 - Lightweight UI components [vine-ui](https://github.com/cenfun/vine-ui)
 - JSON compress/decompress with [lz-utils](https://github.com/cenfun/lz-utils)

## Example Test
- [monocart-reporter-test](https://github.com/cenfun/monocart-reporter-test)
- [monocart-test](https://github.com/cenfun/monocart-test)
## CHANGELOG
- [CHANGELOG.md](CHANGELOG.md)
