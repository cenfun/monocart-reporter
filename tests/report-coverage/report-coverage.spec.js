const { test, expect } = require('@playwright/test');
const { attachCoverageReport } = require('monocart-reporter');
const { delay } = require('../common/util.js');

test.describe.configure({
    mode: 'serial'
});

let page;

test.beforeAll(async ({ browser }) => {
    console.log('beforeAll new page');
    page = await browser.newPage();
});
test.afterAll(async () => {
    await page.close();
    console.log('afterAll close page');
});

test.describe('take istanbul coverage report', () => {
    test('first, open page', async () => {
        await page.goto('http://localhost:8090/istanbul/');
    });

    test('next, run test cases', async () => {
        await delay(500);
    });

    test('finally, take coverage', async () => {
        // take istanbul coverage
        const coverageInput = await page.evaluate(() => window.__coverage__);
        expect(coverageInput, 'expect found istanbul data: __coverage__').toBeTruthy();
        // coverage report
        const report = await attachCoverageReport(coverageInput, test.info());
        console.log(report.lines);
    });
});

test.describe('take v8 js to istanbul coverage report', () => {

    test('first, open page', async () => {
        await page.coverage.startJSCoverage();
        await page.goto('http://localhost:8090/playwright.dev/');
    });

    test('next, run test cases', async () => {
        await delay(500);
    });

    test('finally, take coverage', async () => {
        const jsCoverage = await page.coverage.stopJSCoverage();
        const report = await attachCoverageReport(jsCoverage, test.info(), {
            toIstanbul: true
        });
        console.log(report.summary);
    });

});


test.describe('take v8 anonymous js to istanbul coverage report', () => {
    test('first, open page', async () => {
        // JavaScript Coverage doesn't include anonymous scripts by default.
        await page.coverage.startJSCoverage({
            reportAnonymousScripts: true
        });
        await page.setContent(`<html>
            <head>
                <title>mock page anonymous</title>
            </head>
            <body>
                mock page anonymous
            </body>
            </html>`);
    });

    test('next, run test cases', async () => {
        await delay(500);
    });

    test('finally, take coverage', async () => {
        const jsCoverage = await page.coverage.stopJSCoverage();
        const report = await attachCoverageReport(jsCoverage, test.info(), {
            toIstanbul: true
        });
        console.log(report.summary);
    });
});

test.describe('take v8 js and css coverage report', () => {

    test('first, open page', async () => {
        await Promise.all([
            page.coverage.startJSCoverage(),
            page.coverage.startCSSCoverage()
        ]);

        await page.goto('http://localhost:8090/youtube.com/');
    });

    test('next, run test cases', async () => {
        await delay(500);
    });

    test('finally, take coverage', async () => {

        const [jsCoverage, cssCoverage] = await Promise.all([
            page.coverage.stopJSCoverage(),
            page.coverage.stopCSSCoverage()
        ]);

        const list = [... jsCoverage, ... cssCoverage];

        const report = await attachCoverageReport(list, test.info(), {
            // toIstanbul: true,
            inline: false
        });
        console.log(report.summary);
    });

});

