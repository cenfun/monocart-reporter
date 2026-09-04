const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const sharp = require('sharp');
const { chromium } = require('playwright');

const rootDir = path.resolve(__dirname, '..');

const width = 810;
const height = 800;
const reportPath = path.resolve(rootDir, process.argv[2] || '.temp/monocart/index.html');
const outputPath = path.resolve(rootDir, process.argv[3] || 'docs/report.gif');

// The recording workflow is intentionally linear so its timing remains easy to tune.
// eslint-disable-next-line complexity
const generate = async () => {
    if (!fs.existsSync(reportPath)) {
        throw new Error(`Report not found: ${reportPath}\nRun the report tests first to generate it.`);
    }

    const browser = await chromium.launch({
        headless: true
    });
    const page = await browser.newPage({
        viewport: {
            width,
            height
        },
        deviceScaleFactor: 1
    });

    const frames = [];
    const delays = [];
    const browserErrors = [];

    page.on('console', (message) => {
        if (message.type() === 'error') {
            browserErrors.push(message.text());
        }
    });
    page.on('pageerror', (error) => {
        browserErrors.push(error.message);
    });

    const capture = async (delay) => {
        frames.push(await page.screenshot({
            type: 'png',
            animations: 'allow'
        }));
        delays.push(delay);
    };

    const captureTransition = async (count, interval, finalDelay) => {
        for (let i = 0; i < count; i++) {
            await capture(interval);
            await page.waitForTimeout(interval);
        }
        await capture(finalDelay);
    };

    try {
        await page.goto(pathToFileURL(reportPath).href, {
            waitUntil: 'load'
        });
        await page.waitForSelector('.mcr-search input', {
            timeout: 15000
        });
        await page.waitForTimeout(800);
        await capture(1200);

        // Open the report summary from the menu in the upper-right corner.
        const menuButton = page.locator('.mcr-header > .vui-icon-label').last();
        await menuButton.click();
        await captureTransition(5, 100, 1200);

        // Close the summary before demonstrating keyword search.
        const closeButton = page.locator('.mcr-flyover-header .vui-icon-label:visible').last();
        await closeButton.click();
        await captureTransition(4, 100, 700);

        const search = page.locator('.mcr-search input');
        await search.focus();
        const keyword = '@sanity';
        for (let i = 1; i <= keyword.length; i++) {
            await search.fill(keyword.slice(0, i));
            await capture(100);
        }
        await page.waitForTimeout(350);
        await capture(600);

        // Hide search suggestions and leave the filtered result visible at the end.
        await search.evaluate((element) => element.blur());
        await page.waitForTimeout(300);
        await capture(1500);
    } finally {
        await browser.close();
    }

    if (browserErrors.length) {
        throw new Error(`Browser errors:\n${browserErrors.join('\n')}`);
    }

    // Sharp represents an animation as vertically stacked raw frames. pageHeight
    // marks the height of each individual frame.
    const rawFrames = [];
    for (const frame of frames) {
        const { data, info } = await sharp(frame).removeAlpha().raw().toBuffer({
            resolveWithObject: true
        });
        if (info.width !== width || info.height !== height || info.channels !== 3) {
            throw new Error(`Unexpected frame: ${info.width}x${info.height}, ${info.channels} channels`);
        }
        rawFrames.push(data);
    }

    fs.mkdirSync(path.dirname(outputPath), {
        recursive: true
    });

    await sharp(Buffer.concat(rawFrames), {
        raw: {
            width,
            height: height * rawFrames.length,
            channels: 3,
            pageHeight: height
        },
        limitInputPixels: false
    }).gif({
        loop: 0,
        delay: delays,
        colours: 128,
        effort: 10,
        dither: 0.5,
        interFrameMaxError: 6,
        interPaletteMaxError: 6
    }).toFile(outputPath);

    const metadata = await sharp(outputPath, {
        animated: true
    }).metadata();
    const outputDelays = metadata.delay || delays;
    const duration = outputDelays.reduce((total, delay) => total + delay, 0);
    const size = fs.statSync(outputPath).size;
    console.log(`Generated ${path.relative(rootDir, outputPath)}`);
    console.log(`${width}x${height}, ${metadata.pages} frames, ${(duration / 1000).toFixed(2)}s, ${(size / 1024).toFixed(1)} KB`);
};

generate().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
