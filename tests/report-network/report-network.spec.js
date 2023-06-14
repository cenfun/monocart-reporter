const fs = require('fs');
const path = require('path');
const { test } = require('@playwright/test');
const { attachNetworkReport } = require('monocart-reporter');


test('attach network report 1', async ({ browser }) => {

    const harPath = path.resolve('.temp/network-report1.har');
    if (fs.existsSync(harPath)) {
        // remove previous
        fs.rmSync(harPath);
    }

    const context = await browser.newContext({
        recordHar: {
            path: harPath
        }
    });
    const page = await context.newPage();
    await page.goto('http://localhost:8090/demo/', {
        waitUntil: 'networkidle'
    });

    await new Promise((resolve) => {
        setTimeout(resolve, 500);
    });

    // Close context to ensure HAR is saved to disk.
    await context.close();

    await attachNetworkReport(harPath, test.info(), {
        //  inline: true
    });

});


test('attach network report 2', async ({ browser }) => {
    const harPath = path.resolve('.temp/network-report2.har');
    if (fs.existsSync(harPath)) {
        // remove previous
        fs.rmSync(harPath);
    }

    const context = await browser.newContext({
        recordHar: {
            path: harPath
        }
    });
    const page = await context.newPage();
    await page.goto('http://localhost:8090/coverage/', {
        waitUntil: 'networkidle'
    });
    await new Promise((resolve) => {
        setTimeout(resolve, 500);
    });


    await new Promise((resolve) => {
        setTimeout(resolve, 500);
    });


    // Close context to ensure HAR is saved to disk.
    await context.close();

    await attachNetworkReport(harPath, test.info());

});

