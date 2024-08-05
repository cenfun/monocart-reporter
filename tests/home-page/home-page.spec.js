const {
    test, expect, request
} = require('@playwright/test');
const EC = require('eight-colors');

// POM Page Object Model
const HomePage = require('./home-page.js');

/**
 * rewrite "beforeAll hook" title to
 * @title do something before all
 */
test.beforeAll(({ browserName }, workerInfo) => {
    console.log(EC.magenta('beforeAll'));
    console.log(`Running ${browserName} in worker #${workerInfo.workerIndex}`);
});

/**
 * rewrite "beforeEach hook" title to
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
    console.log('snapshotPath(screenshot.png)', snapshotPath);

    console.log('outputDir', testInfo.outputDir);
    const outputPath = testInfo.outputPath('screenshot.png');
    console.log('outputPath(screenshot.png)', outputPath);

    await testInfo.attach('link', {
        path: `${testInfo.snapshotDir}/report.pdf`,
        contentType: 'application/pdf'
    });

    await testInfo.attach('downloaded', {
        contentType: 'application/zip',
        path: `${testInfo.snapshotDir}/report.zip`
    });

    const screenshot = await page.screenshot();
    await testInfo.attach('screenshot', {
        body: screenshot,
        contentType: 'image/png'
    });

});

/**
 * @owner 大强
 * @annotations TODO
 * @verify failed
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
    await page.locator('input[type=password]').fill(process.env.PASSWORD);

    const screenshot = await page.screenshot();
    await testInfo.attach('screenshot', {
        body: screenshot,
        contentType: 'image/png'
    });

    const context = await request.newContext();
    await context.get(`https://api.npmjs.org/?token=${process.env.TOKEN}`);

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

test.describe('group', () => {

    test('merge same steps - route.continue', async ({ page }) => {

        await page.route('**/*', (route) => {
            const url = route.request().url();
            // console.log(url);
            if (url.includes('abort')) {
                return route.abort();
            }
            return route.continue();
        });

        // mock requests
        await page.evaluate(() => {
            for (let i = 0; i < 30; i++) {
                const script = document.createElement('script');
                if (i === 5) {
                    script.src = `http://localhost/${i}/abort.js`;
                } else {
                    script.src = `http://localhost/${i}/continue.js`;
                }
                document.body.appendChild(script);
            }
        });

        await new Promise((resolve) => {
            setTimeout(resolve, 100);
        });

    });

    test('merge same steps - for expect', () => {
        for (let i = 1; i < 30; i++) {
            // @title step title count ( i > 0 )
            expect(i).toBeGreaterThan(0);
        }
    });

});

/**
 * @verify failed
 */
test('image comparison', async ({ page }) => {
    await HomePage.mockPageGoto(page, 'https://github.com/cenfun/monocart-reporter');
    await expect(page).toHaveScreenshot();
});

/**
 * @verify failed
 */
test('multiple soft comparisons', async ({ page }) => {

    test.info().attach('text/markdown:', {
        contentType: 'text/markdown',
        body: `### monocart reporter
        - playwright test reporter
        - html reporter`
    });

    await HomePage.mockPageGoto(page, 'https://github.com/cenfun/monocart-reporter/pulls');
    await expect.soft(page).toHaveScreenshot();
    await HomePage.mockPageGoto(page, 'https://github.com/cenfun/monocart-reporter/issues');
    await expect.soft(page).toHaveScreenshot();
});

/**
 * @verify failed
 */
test('text comparison', async ({ page }) => {

    // invalid
    // test.info().attach('application/json:', {
    //     contentType: 'application/json',
    //     body: {
    //         'Name': 'cenfun',
    //         'Rank': 1
    //     }
    // });

    test.info().attach('application/json stringify:', {
        contentType: 'application/json',
        body: JSON.stringify({
            Name: 'cenfun',
            Text: 'long text long text long text long text long text long text'
        }, null, 4)
    });

    test.info().attach('json:', {
        contentType: 'application/json',
        body: '{ "Name": "cenfun", Text: "long text long text long text long text long text long text" }'
    });

    test.info().attach('text:', {
        contentType: 'text/plain',
        body: 'long text long text long text long text long text long text'
    });

    test.info().attach('text/plain:', {
        contentType: 'text/plain',
        body: `monocart reporter,
        playwright test reporter`
    });

    test.info().attach('text/markdown:', {
        contentType: 'text/markdown',
        body: `### monocart reporter
- [playwright](https://playwright.dev/) test reporter
- html reporter`
    });

    console.log('https://playwright.dev/');
    console.log('http://localhost:8080/?query=1#page=a%20&b=1?hash-query=%20%22');

    await HomePage.mockPageGoto(page, 'https://github.com/cenfun/monocart-reporter');
    expect(await page.textContent('.page-url')).toMatchSnapshot();

});
