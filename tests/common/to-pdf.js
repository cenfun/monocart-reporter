const path = require('path');
const { chromium } = require('@playwright/test');
const { delay } = require('../common/util.js');
module.exports = async (reportData) => {

    const { outputDir, htmlPath } = reportData;

    const browser = await chromium.launch({
        // headless: false
    });
    const page = await browser.newPage();

    const url = path.resolve(htmlPath);
    await page.goto(url);
    // change layout for pdf
    await page.evaluate(() => {
        location.hash = 'page=report';
        window.postMessage({
            flyoverWidth: '100%'
        });
    });

    // wait for content display
    await delay(1000);

    await page.pdf({
        path: path.resolve(outputDir, 'report.pdf'),
        width: 850,
        printBackground: true
    });

    // await delay(1000 * 60 * 5);

    await page.close();
    await browser.close();
};
