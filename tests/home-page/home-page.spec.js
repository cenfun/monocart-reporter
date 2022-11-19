const { test } = require('@playwright/test');
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

test('test home page', async ({ page, context }) => {
    const homePage = new HomePage(page, context, config);
    await homePage.init();
    await homePage.goto();
    await homePage.checkClientScript();
    await homePage.checkName();
});

test('test screenshot and video', async ({ page, context }) => {
    const homePage = new HomePage(page, context, config);
    await homePage.init();
    await homePage.goto();
    await homePage.checkWithError();
});
