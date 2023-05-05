const { test, chromium } = require('@playwright/test');
const { attachAuditReport } = require('monocart-reporter');
// ESM
// import lighthouse from 'lighthouse';
// CJS
const lighthouse = require('lighthouse/core/index.cjs');

test('attach lighthouse audit report', async () => {
    const port = 9222;
    const browser = await chromium.launch({
        args: [`--remote-debugging-port=${port}`]
        // headless: false
    });
    // https://github.com/GoogleChrome/lighthouse/tree/main/docs
    const options = {
        // logLevel: 'info',
        // onlyCategories: ['performance', 'best-practices', 'seo'],
        output: 'html',
        port
    };
    const url = 'http://localhost:8090/demo/';
    const runnerResult = await lighthouse(url, options);
    await browser.close();
    await attachAuditReport(runnerResult, test.info());
});
