const { test, expect } = require('@playwright/test');
const EC = require('eight-colors');

// POM Page Object Model
const HomePage = require('./home-page.js');

let use;

/**
 * override "beforeAll hook" title to
 * @title do something before all
 */
test.beforeAll(() => {
    console.log(EC.magenta('beforeAll'));
    use = test.info().project.use;
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
    const homePage = new HomePage(page, context, use);
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
    const homePage = new HomePage(page, context, use);
    await homePage.init();
    await homePage.goto();
    await homePage.checkWithError();
});

test('test without custom steps', async ({ page }) => {
    await page.goto(use.url);
    const locator = page.locator('input[type="search"]');
    await locator.fill('Text content');
    await expect(locator).toHaveValue('Text content');
});

// https://playwright.dev/docs/api/class-test#test-step
test('test with custom steps', async ({ page }) => {
    await test.step('accessing the login page', async () => {
        await page.goto(use.url);
    });
    await test.step('completing phone number', async () => {
        const locator = page.locator('input[type="search"]');
        await locator.fill('Text content');
        await expect(locator).toHaveValue('Text content');
    });
});
