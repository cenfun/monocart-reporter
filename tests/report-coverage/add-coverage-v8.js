const { test: testBase } = require('@playwright/test');
const { addCoverageReport } = require('monocart-reporter');

// fixtures
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

module.exports = () => {

    const pageUrl = 'http://localhost:8090/coverage/v8.html';

    test('take coverage for foo', async ({ page }) => {
        await page.goto(pageUrl);
        await page.evaluate(() => {
            const { foo } = window['coverage-v8'];
            foo();
        });
    });

    test('take coverage for bar', async ({ page }) => {
        await page.goto(pageUrl);
        await page.evaluate(() => {
            const { bar } = window['coverage-v8'];
            bar();
        });
    });

    test('take coverage for start', async ({ page }) => {
        await page.goto(pageUrl);
        await page.evaluate(() => {
            const { start } = window['coverage-v8'];
            start();
        });
    });

};
