import { chromium } from '@playwright/test';
export default async (config) => {
    const metadata = config.metadata;

    // if (metadata.baseURL) {
    //     const browser = await chromium.launch();
    //     const page = await browser.newPage();
    //     await page.goto(metadata.baseURL);
    // }

    // collect data in global setup and save to metadata
    const browser = await chromium.launch();
    const chromiumVersion = await browser.version();
    console.log(chromiumVersion);
    metadata.chromiumVersion = chromiumVersion;

};
