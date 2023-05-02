const fs = require('fs');
const path = require('path');
const { test } = require('@playwright/test');
const { attachNetworkReport } = require('monocart-reporter');
const { delay } = require('../common/util.js');

test.describe.configure({
    mode: 'serial'
});

let context;

test.describe('attach network report 1', () => {

    const harPath = path.resolve('.temp/network-report1.har');
    if (fs.existsSync(harPath)) {
        // remove previous
        fs.rmSync(harPath);
    }

    test('first, open page', async ({ browser }) => {
        context = await browser.newContext({
            recordHar: {
                path: harPath
            }
        });
        const page = await context.newPage();
        await page.goto('http://localhost:8090/demo/', {
            waitUntil: 'networkidle'
        });
    });

    test('next, run test cases', async () => {
        await delay(500);
    });

    test('finally, attach HAR', async () => {

        // Close context to ensure HAR is saved to disk.
        await context.close();

        await attachNetworkReport(harPath, test.info(), {
            inline: true
        });

    });

});


test.describe('attach network report 2', () => {

    const harPath = path.resolve('.temp/network-report2.har');
    if (fs.existsSync(harPath)) {
        // remove previous
        fs.rmSync(harPath);
    }

    test('first, open page', async ({ browser }) => {
        context = await browser.newContext({
            recordHar: {
                path: harPath
            }
        });
        const page = await context.newPage();
        await page.goto('http://playwright.dev/', {
            waitUntil: 'networkidle'
        });
        await delay(500);

        const link1 = page.locator('[href="/docs/intro"]', {
            hasText: 'Docs'
        });
        await link1.click();
        await delay(500);

        await page.goto('http://playwright.dev/docs/test-reporters', {
            waitUntil: 'networkidle'
        });
        await delay(500);

    });

    test('next, run test cases', async () => {
        await delay(500);
    });

    test('finally, attach HAR', async () => {

        // Close context to ensure HAR is saved to disk.
        await context.close();

        await attachNetworkReport(harPath, test.info());

    });

});
