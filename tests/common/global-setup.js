import { chromium } from '@playwright/test';

async function globalSetup(config) {
    const { baseURL } = config.projects[0].use;
    if (baseURL) {
        const browser = await chromium.launch();
        const page = await browser.newPage();
        await page.goto(baseURL);
    }
}

export default globalSetup;
