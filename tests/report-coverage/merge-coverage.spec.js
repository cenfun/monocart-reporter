const { test } = require('@playwright/test');
const { addCoverageReport } = require('monocart-reporter');

test('take coverage for foo', async ({ page }) => {
    await page.coverage.startJSCoverage();
    await page.goto('http://localhost:8090/coverage/v8.html');
    await page.evaluate(() => {
        const { foo } = window['coverage-v8'];
        foo();
    });
    const coverageList = await page.coverage.stopJSCoverage();
    await addCoverageReport(coverageList, test.info());
});

test('take coverage for bar', async ({ page }) => {
    await page.coverage.startJSCoverage();
    await page.goto('http://localhost:8090/coverage/v8.html');
    await page.evaluate(() => {
        const { bar } = window['coverage-v8'];
        bar();
    });
    const coverageList = await page.coverage.stopJSCoverage();
    await addCoverageReport(coverageList, test.info());
});

test('take coverage for start', async ({ page }) => {
    await page.coverage.startJSCoverage();
    await page.goto('http://localhost:8090/coverage/v8.html');
    await page.evaluate(() => {
        const { start } = window['coverage-v8'];
        start();
    });
    const coverageList = await page.coverage.stopJSCoverage();
    await addCoverageReport(coverageList, test.info());
});

