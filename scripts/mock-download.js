const fs = require('fs');
const path = require('path');
const EC = require('eight-colors');
const { chromium } = require('@playwright/test');

const delay = function(ms) {
    return new Promise((resolve) => {
        if (ms) {
            setTimeout(resolve, ms);
        } else {
            setImmediate(resolve);
        }
    });
};

const download = async (item, outputDir) => {
    const itemDir = path.resolve(outputDir, item.name);
    if (fs.existsSync(itemDir)) {
        EC.logYellow(`exists: ${item.name}`);
        return;
    }

    fs.mkdirSync(itemDir, {
        recursive: true
    });

    console.log(`start download: ${item.name}`);
    const browser = await chromium.launch();
    const page = await browser.newPage();

    const pageUrl = new URL(item.url);
    page.on('requestfinished', async (req) => {
        const res = await req.response();
        if (!res) {
            return;
        }

        const url = res.url();

        const status = res.status();
        if ((status >= 300) && (status <= 399)) {
            EC.logYellow('Redirect from', url, 'to', res.headers().location);
            return;
        }

        console.log('file url:', url);

        const resUrl = new URL(url);

        if (resUrl.host !== pageUrl.host) {
            return;
        }

        // buf
        const body = await res.body();

        console.log(resUrl.pathname, pageUrl.pathname);

        const pathname = resUrl.pathname;
        if (pathname === pageUrl.pathname) {
            // save index
            const filePath = path.resolve(itemDir, 'index.html');

            let content = body.toString('utf-8');
            content = content.replace(/src="\//g, 'src="');
            content = content.replace(/href="\//g, 'href="');

            fs.writeFileSync(filePath, content);
            console.log(`file saved: ${EC.green(filePath)}`);
            return;
        }


        // console.log(pathname);
        const dirname = path.dirname(pathname).slice(1);
        // console.log('dirname', dirname);
        const fileDir = path.resolve(itemDir, dirname);
        fs.mkdirSync(fileDir, {
            recursive: true
        });

        // console.log(body.length);
        const filePath = path.resolve(fileDir, path.basename(resUrl.pathname));
        fs.writeFileSync(filePath, body);
        console.log(`file saved: ${EC.green(filePath)}`);

    });

    console.log(`go to: ${item.url}`);
    await page.goto(item.url, {
        waitUntil: 'networkidle'
    });

    await delay(2000);

    console.log('close all');
    await page.close();
    await browser.close();

};

const copyDir = (fromDir, toDir) => {
    if (!fs.existsSync(toDir)) {
        fs.mkdirSync(toDir, {
            recursive: true
        });
    }

    fs.readdirSync(fromDir, {
        withFileTypes: true
    }).forEach((it) => {

        if (it.isFile()) {
            const fromFile = path.resolve(fromDir, it.name);
            const toFile = path.resolve(toDir, it.name);
            // do not copy previous
            if (!fs.existsSync(toFile)) {
                fs.cpSync(fromFile, toFile);
            }
            return;
        }

        if (it.isDirectory()) {
            fromDir = path.resolve(fromDir, it.name);
            toDir = path.resolve(toDir, it.name);
            copyDir(fromDir, toDir);
        }
    });
};

const main = async () => {

    const outputDir = path.resolve(__dirname, '../.temp/mock');
    if (!fs.existsSync) {
        fs.mkdirSync(outputDir, {
            recursive: true
        });
    }

    const sites = [{
        name: 'playwright.dev',
        url: 'https://playwright.dev/docs/api/class-coverage'
    }, {
        name: 'youtube.com',
        url: 'https://www.youtube.com/'
    }];

    for (const item of sites) {
        await download(item, outputDir);
    }

    // copy istanbul folder
    copyDir(
        path.resolve(__dirname, '../../monocart-reporter-examples/packages/coverage/public'),
        path.resolve(outputDir, 'istanbul')
    );


};

main();
