const path = require('path');
const { chromium } = require('@playwright/test');
const FormData = require('form-data');
const axios = require('axios');
const EC = require('eight-colors');
const { delay } = require('../common/util.js');

module.exports = async (reportData, capability) => {

    // https://open.feishu.cn/document/ukTMukTMukTM/ucTM5YjL3ETO24yNxkjN

    // do not store your webhook url in the source code, but pass your webhook url from environment variables
    const url = process.env.FEISHU_WEBHOOK;

    const {
        name, dateH, durationH, summary, htmlPath
    } = reportData;


    // get token for uploading image
    // https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM
    const tokenRes = await axios.post('https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal', {
        app_id: process.env.FEISHU_APP_ID,
        app_secret: process.env.FEISHU_APP_SECRET
    }).catch((err) => {
        EC.logRed(err.message);
        EC.logRed('[feishu] failed to get access token');
    });
    if (!tokenRes) {
        return;
    }

    const { tenant_access_token } = tokenRes.data;
    // console.log(tenant_access_token);

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

    // upload image
    // https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/image/create
    const imageForm = new FormData();
    imageForm.append('image_type', 'message');
    imageForm.append('image', screenshot, {
        filename: 'screenshot.png',
        contentType: 'image/png'
    });

    // console.log(imageForm);

    // requires [im:resource:upload, im:resource] permission
    const imageRes = await axios.post('https://open.feishu.cn/open-apis/im/v1/images', imageForm, {
        headers: {
            Authorization: `Bearer ${tenant_access_token}`
        }
    }).catch((err) => {
        EC.logRed(err.message);
        EC.logRed('[feishu] failed to upload image');
    });
    if (!imageRes) {
        return;
    }

    // console.log(imageRes.data);

    const imageData = imageRes.data.data;
    const { image_key } = imageData;
    console.log('image_key', image_key);

    // send message
    // https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/im-v1/message/create_json
    const title = `${name} ${dateH} (${durationH})`;

    const content = [];

    content.push([{
        'tag': 'img',
        'image_key': image_key
    }]);

    ['tests', 'passed', 'flaky', 'skipped', 'failed'].forEach((k) => {
        const item = summary[k];
        const percent = item.percent ? ` (${item.percent})` : '';
        content.push([{
            'tag': 'text',
            'text': `${item.name}: ${item.value} ${percent}`
        }]);
    });


    if (summary.passed.value === summary.tests.value) {
        content.push([{
            'tag': 'text',
            'text': '✔ Congratulations! All tests passed.'
        }]);
    } else if (summary.failed.value > 0) {
        // @owners of all failed cases
        const owners = [];
        capability.forEach((item) => {
            if (item.type === 'case' && item.caseType === 'failed' && item.owner) {
                owners.push(`@${item.owner}`);
            }
        });
        if (owners.length) {
            content.push([{
                'tag': 'text',
                'text': `Hey ${owners.join(' ')}, please fix the failed cases and run test again.`
            }]);
        }
    }

    const data = {
        'msg_type': 'post',
        'content': {
            'post': {
                'zh_cn': {
                    'title': title,
                    'content': content
                }
            }
        }
    };

    const res = await axios.post(url, data).catch((err) => {
        // console.log(err);
        EC.logRed(err.message);
        EC.logRed('[feishu] failed to post message');
    });

    if (res && res.code) {
        console.log(res.data);
    }

};
