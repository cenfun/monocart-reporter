const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');
const { createHash } = require('crypto');
const FormData = require('form-data');
const axios = require('axios');
const EC = require('eight-colors');
const { delay } = require('../common/util.js');

module.exports = async (reportData, capability) => {

    // do not store your webhook url in the source code, but pass your webhook url from environment variables
    const url = `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${process.env.WEIXIN_WEBHOOK_KEY}`;

    const {
        name, dateH, durationH, summary, htmlPath
    } = reportData;

    // take a screenshot image
    const browser = await chromium.launch({
        // headless: false
    });
    const page = await browser.newPage();
    await page.setViewportSize({
        width: 860,
        height: 1060
    });
    await page.goto(path.resolve(htmlPath));
    await page.evaluate(() => {
        location.hash = 'page=report';
        window.postMessage({
            flyoverWidth: '100%'
        });
    });
    await delay(500);
    const screenshot = await page.screenshot({
        fullPage: true
    });
    await page.close();
    await browser.close();


    // // send image
    const hash = createHash('md5');
    hash.update(screenshot);
    const md5 = hash.copy().digest('hex');

    const imageData = {
        'msgtype': 'image',
        'image': {
            'base64': screenshot.toString('base64'),
            'md5': md5
        }
    };

    const ImageRes = await axios.post(url, imageData).catch((err) => {
        // console.log(err);
        EC.logRed(err.message);
        EC.logRed('[weixin] failed to post image');
    });

    if (!ImageRes) {
        return;
    }

    // upload file
    const uploadUrl = `https://qyapi.weixin.qq.com/cgi-bin/webhook/upload_media?type=file&key=${process.env.WEIXIN_WEBHOOK_KEY}`;
    const form = new FormData();
    form.append('media', fs.createReadStream(path.resolve(htmlPath)), {
        filename: path.basename(htmlPath),
        contentType: 'text/html'
    });

    const uploadRes = await axios.post(uploadUrl, form).catch((err) => {
        // console.log(err);
        EC.logRed(err.message);
        EC.logRed('[weixin] failed to upload file');
    });

    if (!uploadRes) {
        return;
    }

    const { media_id } = uploadRes.data;

    const mediaData = {
        'msgtype': 'file',
        'file': {
            'media_id': media_id
        }
    };

    await axios.post(url, mediaData).catch((err) => {
        // console.log(err);
        EC.logRed(err.message);
        EC.logRed('[weixin] failed to post file message');
    });

    // send markdown
    const lines = [`## ${name}`, `${dateH} (${durationH})`];

    ['tests', 'passed', 'flaky', 'skipped', 'failed'].forEach((k) => {
        const item = summary[k];
        const percent = item.percent ? ` (${item.percent})` : '';
        lines.push(`- **${item.name}** ${item.value} ${percent}`);
    });

    lines.push('\n  ');

    if (summary.passed.value === summary.tests.value) {
        lines.push('✔ Congratulations! All tests passed.');
    } else if (summary.failed.value > 0) {
        // @owners of all failed cases
        const owners = [];
        capability.forEach((item) => {
            if (item.type === 'case' && item.caseType === 'failed' && item.owner) {
                owners.push(`@${item.owner}`);
            }
        });
        if (owners.length) {
            lines.push(`Hey ${owners.join(' ')}, please fix the failed cases and run test again.`);
        }
    }

    const data = {
        'msgtype': 'markdown',
        'markdown': {
            'content': lines.join('\n')
        }
    };

    await axios.post(url, data).catch((err) => {
        // console.log(err);
        EC.logRed(err.message);
        EC.logRed('[weixin] failed to post message');
    });

};
