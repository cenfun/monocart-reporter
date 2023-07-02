const { test: testBase } = require('@playwright/test');
const { addCoverageReport } = require('monocart-reporter');

// fixtures
const test = testBase.extend({
    autoTestFixture: [async ({ page }, use) => {

        // console.log('autoTestFixture setup...');

        await use('autoTestFixture');

        // console.log('autoTestFixture teardown...');

        const coverageData = await page.evaluate(() => window.__coverage__);
        await addCoverageReport(coverageData, test.info());

    }, {
        scope: 'test',
        auto: true
    }]
});


module.exports = () => {

    const pageUrl = 'http://localhost:8090/coverage/istanbul.html';

    test('take coverage for foo', async ({ page }) => {
        await page.goto(pageUrl);
        await page.evaluate(() => {
            const { foo } = window['coverage-istanbul'];
            foo();
        });
    });

    test('take coverage for bar', async ({ page }) => {
        await page.goto(pageUrl);
        await page.evaluate(() => {
            const { bar } = window['coverage-istanbul'];
            bar();
        });
    });

    test('take coverage for start', async ({ page }) => {
        await page.goto(pageUrl);
        await page.evaluate(() => {
            const { start } = window['coverage-istanbul'];
            start();
        });
    });

};
