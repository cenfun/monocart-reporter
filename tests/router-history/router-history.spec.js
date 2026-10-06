const path = require('path');
const { build } = require('esbuild');
const { test, expect } = require('@playwright/test');

const host = 'http://localhost:8090';

const bundleRouter = async (kind) => {
    const entry = kind === 'app' ? 'app' : 'network';
    const open = kind === 'app' ? 'openReportRoute' : 'openRequestRoute';
    const route = kind === 'app' ? 'openReportRoute()' : 'openRequestRoute(\'test-id\')';
    const result = await build({
        stdin: {
            contents: `
                import { createApp, h } from 'vue';
                import router, { ${open} } from './src/${entry}/router.js';
                window.testRouter = { router, open: () => ${route} };
                createApp({ render: () => h('div', { id: 'mounted' }, 'mounted') })
                    .use(router).mount('#app');
            `,
            resolveDir: path.resolve(__dirname, '../..'),
            sourcefile: 'router-test.js'
        },
        bundle: true,
        write: false,
        format: 'iife',
        platform: 'browser',
        define: {
            'process.env.NODE_ENV': '"production"'
        }
    });
    return result.outputFiles[0].text;
};

for (const kind of ['app', 'network']) {
    test(`${kind} router works inside srcdoc without rewriting the URL`, async ({ page }) => {
        const errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('console', (message) => {
            if (message.type() === 'error') {
                errors.push(message.text());
            }
        });
        const bundle = await bundleRouter(kind);
        await page.route(`${host}/router-test.js`, (route) => route.fulfill({
            contentType: 'text/javascript',
            body: bundle
        }));
        await page.goto(host);
        await page.evaluate((url) => {
            const iframe = document.createElement('iframe');
            iframe.srcdoc = `<base href="${url}/dist/tabContent.html"><div id="app"></div><script src="${url}/router-test.js"></script>`;
            document.body.append(iframe);
        }, host);

        await expect(page.frameLocator('iframe').locator('#mounted')).toBeVisible();
        const frame = page.frames().find((item) => item.url() === 'about:srcdoc');
        expect(frame).toBeTruthy();
        await frame.evaluate(() => window.testRouter.router.isReady());
        expect(await frame.evaluate(() => window.testRouter.router.currentRoute.value.path)).toBe('/');
        await frame.evaluate(() => window.testRouter.open());
        expect(await frame.evaluate(() => window.testRouter.router.currentRoute.value.path)).toBe(kind === 'app' ? '/report' : '/request/test-id');
        expect(frame.url()).toBe('about:srcdoc');
        expect(errors).toEqual([]);
    });
}

test('normal report page still uses hash deep links', async ({ page }) => {
    const bundle = await bundleRouter('app');
    await page.route(`${host}/router-test.js`, (route) => route.fulfill({
        contentType: 'text/javascript',
        body: bundle
    }));
    await page.goto(host);
    await page.setContent(`<div id="app"></div><script src="${host}/router-test.js"></script>`);
    await expect(page.locator('#mounted')).toBeVisible();
    await page.evaluate(() => window.testRouter.router.isReady());
    await page.evaluate(() => window.testRouter.open());
    await expect(page).toHaveURL(`${host}/#/report`);

    await page.reload();
    await page.setContent(`<div id="app"></div><script src="${host}/router-test.js"></script>`);
    await expect(page.locator('#mounted')).toBeVisible();
    await page.evaluate(() => window.testRouter.router.isReady());
    expect(await page.evaluate(() => window.testRouter.router.currentRoute.value.path)).toBe('/report');
});
