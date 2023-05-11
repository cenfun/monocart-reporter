const { test, expect } = require('@playwright/test');
const { attachCoverageReport } = require('monocart-reporter');
const { delay } = require('../common/util.js');

test.describe.configure({
    mode: 'serial'
});

let page;

test.describe('take Istanbul coverage report', () => {
    test('first, open page', async ({ browser }) => {
        page = await browser.newPage();
        await page.goto('http://localhost:8090/istanbul/');
    });

    test('next, run test cases', async () => {
        await delay(500);
    });

    test('finally, take coverage', async () => {
        // take Istanbul coverage
        const coverageData = await page.evaluate(() => window.__coverage__);
        await page.close();
        expect(coverageData, 'expect found Istanbul data: __coverage__').toBeTruthy();
        // coverage report
        const report = await attachCoverageReport(coverageData, test.info());
        console.log(report.summary);
    });
});

test.describe('take V8 js to Istanbul coverage report', () => {

    test('first, open page', async ({ browser }) => {
        page = await browser.newPage();
        await page.coverage.startJSCoverage();
        await page.goto('http://localhost:8090/playwright.dev/');
    });

    test('next, run test cases', async () => {
        await delay(500);
    });

    test('finally, take coverage', async () => {
        const jsCoverageList = await page.coverage.stopJSCoverage();
        await page.close();
        const report = await attachCoverageReport(jsCoverageList, test.info(), {
            toIstanbul: true
        });
        console.log(report.summary);
    });

});


test.describe('take V8 anonymous js to Istanbul coverage report', () => {
    test('first, open page', async ({ browser }) => {
        page = await browser.newPage();
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
        const jsCoverageList = await page.coverage.stopJSCoverage();
        await page.close();
        const report = await attachCoverageReport(jsCoverageList, test.info(), {
            toIstanbul: true
        });
        console.log(report.summary);
    });
});

test.describe('take V8 anonymous js coverage report', () => {
    test('first, open page', async ({ browser }) => {
        page = await browser.newPage();
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
        const jsCoverageList = await page.coverage.stopJSCoverage();
        await page.close();
        const report = await attachCoverageReport(jsCoverageList, test.info(), {
            // inline: true
        });
        console.log(report.summary);
    });
});

test.describe('take V8 js and css coverage report', () => {

    test('first, open page', async ({ browser }) => {
        page = await browser.newPage();
        await Promise.all([
            page.coverage.startJSCoverage(),
            page.coverage.startCSSCoverage()
        ]);

        await page.goto('http://localhost:8090/demo/');
    });

    test('next, run test cases', async () => {
        const screenshot = await page.screenshot();
        await test.info().attach('screenshot', {
            body: screenshot,
            contentType: 'image/png'
        });
        await delay(500);
    });

    test('finally, take coverage', async () => {

        const [jsCoverage, cssCoverage] = await Promise.all([
            page.coverage.stopJSCoverage(),
            page.coverage.stopCSSCoverage()
        ]);
        await page.close();
        const coverageList = [... jsCoverage, ... cssCoverage];
        // filter file list
        // coverageList = coverageList.filter((item) => {
        //     if (item.url.endsWith('.js') || item.url.endsWith('.css')) {
        //         return true;
        //     }
        // });
        const report = await attachCoverageReport(coverageList, test.info());
        console.log(report.summary);
    });

});

