const {
    test, expect, request
} = require('@playwright/test');
const EC = require('eight-colors');
const { takeCoverage } = require('monocart-reporter');

const { delay } = require('../common/util.js');
// POM Page Object Model
const HomePage = require('./home-page.js');

/**
 * override "beforeAll hook" title to
 * @title do something before all
 */
test.beforeAll(({ browserName }, workerInfo) => {
    console.log(EC.magenta('beforeAll'));
    console.log(`Running ${browserName} in worker #${workerInfo.workerIndex}`);
});

/**
 * override "beforeEach hook" title to
 * @title do something before each
 */
test.beforeEach(() => {
    console.log('beforeEach');
});

test.afterEach(() => {
    console.log('afterEach');
});

test.afterAll(() => {
    console.log(EC.magenta('afterAll'));
});

// let pageCurrent;

test('test home page', async ({ page, context }, testInfo) => {
    const metadata = testInfo.config.metadata;
    const homePage = new HomePage(page, context, metadata);
    await homePage.init();
    await homePage.checkName();

    console.log('snapshotDir', testInfo.snapshotDir);
    const snapshotPath = testInfo.snapshotPath('screenshot.png');
    console.log('snapshotPath', snapshotPath);

    console.log('outputDir', testInfo.outputDir);
    const outputPath = testInfo.outputPath('screenshot.png');
    console.log('outputPath', outputPath);

    const screenshot = await page.screenshot();
    await testInfo.attach('screenshot', {
        body: screenshot,
        contentType: 'image/png'
    });

});

/**
 * @owner 大强
 * @annotations TODO
 */
test('test screenshot and video', async ({ page, context }, testInfo) => {
    const metadata = testInfo.config.metadata;
    const homePage = new HomePage(page, context, metadata);
    await homePage.init();
    await homePage.checkWithError();
});

test('test locator fill', async ({ page }, testInfo) => {
    const metadata = testInfo.config.metadata;
    await HomePage.mockPageGoto(page, metadata.url);
    const locator = page.locator('input[type="search"]');
    await locator.fill('Text content');
    await expect(locator).toHaveValue('Text content');
});

test('secrets and sensitive data', async ({ page }, testInfo) => {
    await HomePage.mockPageGoto(page, 'https://www.npmjs.com/login');
    await page.locator('input[type=password]').type(process.env.LOGIN_PASSWORD);

    const screenshot = await page.screenshot();
    await testInfo.attach('screenshot', {
        body: screenshot,
        contentType: 'image/png'
    });

    const context = await request.newContext();
    await context.get(`https://api.npmjs.org/?token=${process.env.API_TOKEN}`);

});

// https://playwright.dev/docs/api/class-test#test-step
test('test with custom steps', async ({ page }, testInfo) => {
    const metadata = testInfo.config.metadata;
    await test.step('accessing the login page', async () => {
        await HomePage.mockPageGoto(page, metadata.url);
    });
    await test.step('completing phone number', async () => {
        const locator = page.locator('input[type="search"]');
        await locator.fill('Text content');
        await expect(locator).toHaveValue('Text content');
    });
});

test('take v8 coverage report', async ({ page }) => {
    await page.coverage.startJSCoverage({
        reportAnonymousScripts: true
    });
    // mock a page with script
    await HomePage.mockPageGoto(page, 'https://anonymous');
    await delay(500);
    // JavaScript Coverage doesn't include anonymous scripts by default.
    // However, scripts with sourceURLs are reported.
    const jsCoverage = await page.coverage.stopJSCoverage();
    const report = await takeCoverage(jsCoverage, test.info());
    console.log(report.lines);
});
