const fs = require('fs');
const path = require('path');
const EC = require('eight-colors');
const { test, expect } = require('@playwright/test');
const { attachCoverageReport, addCoverageReport } = require('monocart-reporter');

// const istanbulTests = require('./add-coverage-istanbul.js');
// istanbulTests();

const v8Tests = require('./add-coverage-v8.js');
v8Tests();

test('Take Istanbul coverage report', async ({ page }) => {

    await page.goto('http://localhost:8090/istanbul/');

    // delay for mock code execution
    await new Promise((resolve) => {
        setTimeout(resolve, 500);
    });

    // take Istanbul coverage
    const coverageData = await page.evaluate(() => window.__coverage__);
    await page.close();
    expect(coverageData, 'expect found Istanbul data: __coverage__').toBeTruthy();

    // await addCoverageReport(coverageData, test.info());

    // coverage report
    await attachCoverageReport(coverageData, test.info(), {
        lcov: true,
        // default is html-spa
        // reports: 'html',
        sourcePath: (sourcePath) => {
            // console.log('sourcePath', sourcePath);
            // replace local windows \ to server /
            sourcePath = sourcePath.replace(/\\/g, '/');
            const filePath = sourcePath.split('/mock/')[1];
            const redirectPath = path.resolve(__dirname, '../../scripts/mock', filePath);

            if (!fs.existsSync(redirectPath)) {
                console.log('not found redirectPath', EC.red(redirectPath));
            }

            return redirectPath;
        }
    });

});

test('Take V8 and Istanbul coverage report', async ({ page }) => {

    await Promise.all([
        page.coverage.startJSCoverage({
            resetOnNavigation: false
        }),
        page.coverage.startCSSCoverage({
            resetOnNavigation: false
        })
    ]);

    await page.goto('http://localhost:8090/v8/');

    // delay for mock code execution
    await new Promise((resolve) => {
        setTimeout(resolve, 500);
    });

    const [jsCoverage, cssCoverage] = await Promise.all([
        page.coverage.stopJSCoverage(),
        page.coverage.stopCSSCoverage()
    ]);
    await page.close();

    const coverageList = [... jsCoverage, ... cssCoverage];

    await addCoverageReport(coverageList, test.info());

    await attachCoverageReport(coverageList, test.info(), {
        sourceFilter: (sourcePath) => sourcePath.search(/src\//) !== -1,
        lcov: true
    });
    // console.log(v8.summary);

    await attachCoverageReport(coverageList, test.info(), {
        sourceFilter: (sourcePath) => sourcePath.search(/src\//) !== -1,
        lcov: true,
        reports: 'html'
    });
    // console.log(istanbul.summary);

});

test('Take anonymous scripts coverage report', async ({ page }) => {
    // JavaScript Coverage doesn't include anonymous scripts by default.
    await page.coverage.startJSCoverage({
        reportAnonymousScripts: true,
        resetOnNavigation: false
    });
    await page.setContent(`<html>
            <head>
                <title>mock page anonymous</title>
            </head>
            <body>
                mock page anonymous
            </body>
            </html>`);

    // delay for mock code execution
    await new Promise((resolve) => {
        setTimeout(resolve, 500);
    });

    const jsCoverageList = await page.coverage.stopJSCoverage();
    await page.close();

    await attachCoverageReport(jsCoverageList, test.info(), {
        // inline: true,
        lcov: true
    });
    // console.log(v8.summary);

    await attachCoverageReport(jsCoverageList, test.info(), {
        lcov: true,
        reports: [
            ['html'],
            ['json'],
            ['json', {
                file: 'my-json-file-name.json'
            }]
        ]
    });
    // console.log(istanbul.summary);

});


test('Take V8 js and css coverage report', async ({ page }) => {
    await Promise.all([
        page.coverage.startJSCoverage({
            resetOnNavigation: false
        }),
        page.coverage.startCSSCoverage({
            resetOnNavigation: false
        })
    ]);

    await page.goto('http://localhost:8090/minify/');
    // delay for mock code execution
    await new Promise((resolve) => {
        setTimeout(resolve, 500);
    });

    const screenshot = await page.screenshot();
    await test.info().attach('screenshot', {
        body: screenshot,
        contentType: 'image/png'
    });

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

    // await addCoverageReport(coverageList, test.info());

    await attachCoverageReport(coverageList, test.info(), {
        lcov: true
    });
    // console.log(report.summary);

});
