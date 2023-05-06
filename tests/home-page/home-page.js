const { expect } = require('@playwright/test');
const Util = require('../common/util.js');

const mockPageGoto = async (page, url) => {
    await page.setContent(`
        <html>
        <head>
            <title>monocart-reporter - npm</title>
        </head>
        <body>
            <h3>this is mock page</h3>
            <div>${url}</div>

            <div>
                <label>Mock Search</label>
                <input type="search" name="search" value="">
            </div>

            <div>
                <label>Mock Password</label>
                <input type="password" name="password" value="">
            </div>

        </body>
        </html>
    `);
};

class HomePage {

    static mockPageGoto = mockPageGoto;

    constructor(page, context, metadata) {
        this.page = page;
        this.context = context;
        this.metadata = metadata;
        console.log('metadata', metadata);
    }

    async init() {

        const url = this.metadata.url;
        console.log(`goto: ${url}`);

        /**
         * rewrite title
         * @title Open my home page and delay 1s
         */
        await mockPageGoto(this.page, url);
        await Util.delay(1000);

        // for client script
        // console.log(`addInitScript: ${this.metadata.clientPath}`);

        /**
         * rewrite title
         * @title Add Init Script
         */
        // await this.page.addInitScript({
        //     path: this.metadata.clientPath
        // });
        // await Util.delay(500);
    }

    // async checkClientScript() {
    //     // page.setContent does not run the init scripts
    //     const hasClientLib = await this.page.evaluate(async () => {
    //         await window.delay(100);
    //         await window.ready(() => {
    //             return document.querySelector('body');
    //         });
    //         return true;
    //     });
    //     await expect(hasClientLib).toBeTruthy();
    // }

    async checkName() {
        const $dom = await this.page.$('title');
        expect($dom).toBeTruthy();

        const text = await $dom.textContent();
        expect(text.trim()).toBe('monocart-reporter - npm');
    }

    async checkWithError() {
        const $dom = await this.page.$('title');
        const text = await $dom.textContent();
        expect(text.trim()).toBe('');
    }

}


module.exports = HomePage;
