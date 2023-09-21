const { chromium } = require('@playwright/test');
const dotenv = require('dotenv');
const { useState } = require('monocart-reporter');
const state = useState();
module.exports = async (config) => {

    // https://github.com/motdotla/dotenv
    dotenv.config();

    // console.log(process.env);

    await state.set({
        login: 'login-user',
        group: 'QA Team',
        npm_package_name: process.env.npm_package_name
    }).catch((err) => {
        console.error(err);
    });

    const metadata = config.metadata;

    // if (metadata.baseURL) {
    //     const browser = await chromium.launch();
    //     const page = await browser.newPage();
    //     await page.goto(metadata.baseURL);
    // }

    // collect data in global setup and save to metadata
    const browser = await chromium.launch();
    const chromiumVersion = await browser.version();
    console.log('chromiumVersion', chromiumVersion);
    metadata.chromiumVersion = chromiumVersion;

    // await state.send({
    //     reportName: 'My new report name'
    // });

};
