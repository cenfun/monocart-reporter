const { test, expect } = require('@playwright/test');
const EC = require('eight-colors');

// POM Page Object Model
const HomePage = require('./home-page.js');

let config;
test.beforeAll(({ browserName }, TestInfo) => {
    console.log(EC.magenta('Before home tests:'), browserName);
    config = TestInfo.project.use;
});

test.afterAll(() => {
    console.log(EC.magenta('After home tests'));
});

// let pageCurrent;

test('test home page', async ({ page, context }, testInfo) => {
    const homePage = new HomePage(page, context, config);
    await homePage.init();
    await homePage.goto();
    await homePage.checkClientScript();
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
test('test screenshot and video', async ({ page, context }) => {
    const homePage = new HomePage(page, context, config);
    await homePage.init();
    await homePage.goto();
    await homePage.checkWithError();
});

test('test without custom steps', async ({ page }) => {
    await page.goto(config.url);
    const locator = page.locator('input[type="search"]');
    await locator.fill('Text content');
    await expect(locator).toHaveValue('Text content');
});

// https://playwright.dev/docs/api/class-test#test-step
test('test with custom steps', async ({ page }) => {
    await test.step('accessing the login page', async () => {
        await page.goto(config.url);
    });
    await test.step('completing phone number', async () => {
        const locator = page.locator('input[type="search"]');
        await locator.fill('Text content');
        await expect(locator).toHaveValue('Text content');
    });
});
