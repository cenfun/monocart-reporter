// Usage: npm run docs-og-image
// Install Chromium if needed: npx playwright install chromium
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('@playwright/test');

const main = async () => {
    const template = await fs.readFile(path.join(__dirname, 'og-image.html'), 'utf8');
    const logo = await fs.readFile(path.resolve(__dirname, '../../src/app/images/icons/monocart.svg'));
    const playwrightLogo = await fs.readFile(path.resolve(__dirname, '../../src/app/images/icons/playwright.svg'));
    const linkIcon = await fs.readFile(path.resolve(__dirname, '../../src/app/images/icons/link.svg'), 'utf8');
    const html = template
        .replace('{placeholder_logo}', `data:image/svg+xml;base64,${logo.toString('base64')}`)
        .replace('{placeholder_playwright_logo}', `data:image/svg+xml;base64,${playwrightLogo.toString('base64')}`)
        .replace('{placeholder_link_icon}', linkIcon);
    const outputPath = path.resolve(__dirname, '../../assets/og-image.png');
    await fs.mkdir(path.dirname(outputPath), {
        recursive: true
    });

    const browser = await chromium.launch();
    try {
        const page = await browser.newPage({
            viewport: {
                width: 1200,
                height: 630
            },
            deviceScaleFactor: 1
        });
        await page.setContent(html, {
            waitUntil: 'load'
        });
        await page.evaluate(async () => {
            await document.fonts.ready;
            await Promise.all(Array.from(document.images, (img) => img.decode()));
        });
        await page.screenshot({
            path: outputPath,
            type: 'png'
        });
        console.log(`saved ${outputPath} (1200x630)`);
    } finally {
        await browser.close();
    }
};

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
