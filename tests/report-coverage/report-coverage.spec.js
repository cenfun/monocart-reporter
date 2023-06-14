const { test, expect } = require('@playwright/test');
const { attachCoverageReport, addCoverageReport } = require('monocart-reporter');

test('Take Istanbul coverage report', async ({ page }) => {

    await page.goto('http://localhost:8090/coverage/istanbul.html');

    // delay for mock code execution
    await new Promise((resolve) => {
        setTimeout(resolve, 500);
    });

    // take Istanbul coverage
    const coverageData = await page.evaluate(() => window.__coverage__);
    await page.close();
    expect(coverageData, 'expect found Istanbul data: __coverage__').toBeTruthy();

    Object.keys(coverageData).forEach((k) => {
        const d = coverageData[k];
        delete coverageData[k];
        const p = k.replace(/\\/g, '/');
        coverageData[p] = d;
    });

    // coverage report
    const report = await attachCoverageReport(coverageData, test.info(), {
        lcov: true
    });
    console.log(report.summary);

});

test('Take V8 and Istanbul coverage report', async ({ page }) => {

    await Promise.all([
        page.coverage.startJSCoverage(),
        page.coverage.startCSSCoverage()
    ]);

    await page.goto('http://localhost:8090/coverage/v8.html');

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

    const v8 = await attachCoverageReport(coverageList, test.info(), {
        excludeDistFile: false
    });
    console.log(v8.summary);

    const istanbul = await attachCoverageReport(coverageList, test.info(), {
        // unpackSourceMap: false,
        // sourceFilter: (sourceName) => sourceName.indexOf('node_modules') === -1,
        toIstanbul: true
    });
    console.log(istanbul.summary);

});

test('Take anonymous scripts coverage report', async ({ page }) => {
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

    // delay for mock code execution
    await new Promise((resolve) => {
        setTimeout(resolve, 500);
    });

    const jsCoverageList = await page.coverage.stopJSCoverage();
    await page.close();

    const v8 = await attachCoverageReport(jsCoverageList, test.info(), {
        // inline: true
    });
    console.log(v8.summary);

    const istanbul = await attachCoverageReport(jsCoverageList, test.info(), {
        toIstanbul: true
    });
    console.log(istanbul.summary);

});


test('Take V8 js and css coverage report', async ({ page }) => {
    await Promise.all([
        page.coverage.startJSCoverage(),
        page.coverage.startCSSCoverage()
    ]);

    await page.goto('http://localhost:8090/demo/');
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

    await addCoverageReport(coverageList, test.info());

    const report = await attachCoverageReport(coverageList, test.info(), {
        unpackSourceMap: true
    });
    console.log(report.summary);

});

