# A grid style report for playwright

## Install
```sh
npm i playwright-report-grid
```

## Playwright Multiple Reporters
```js
// playwright.config.js
/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  reporter: [
    //['list'],
    ['playwright-report-grid', {  
        outputFolder: 'playwright-report',
        outputFilename: 'playwright-report-grid'
    }]
  ],
};
module.exports = config;
```

## CHANGELOG
