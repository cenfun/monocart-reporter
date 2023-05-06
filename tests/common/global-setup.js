const { chromium } = require('@playwright/test');
const dotenv = require('dotenv');
module.exports = async (config) => {

    // https://github.com/motdotla/dotenv
    dotenv.config();

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
