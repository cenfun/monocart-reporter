const { expect } = require('@playwright/test');

const mockPageGoto = async (page, url) => {
    await page.setContent(`
        <html>
        <head>
            <title>monocart-reporter - npm</title>
            <style>
            body {
                background-size: 100px 100px;
                background-image:
                    linear-gradient(to right, grey 1px, transparent 1px),
                    linear-gradient(to bottom, grey 1px, transparent 1px);
            }
            table {
                border-collapse: collapse;
                min-width: 500px;
            }
            td, th {
                padding: 5px 8px;
            }
            th {
                background: #f5f5f5;
            }
            </style>
        </head>
        <body>
            <h3>this is mock page</h3>
            <p class="page-url">${url}</p>

            <p>
                <label>Search</label>
                <input type="search" name="search" value="">
            </p>

            <p>
                <label>Password</label>
                <input type="password" name="password" value="">
            </p>

            <p>
                <button>Button</button>
            </p>

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
        // console.log('metadata', metadata);
    }

    async init() {

        const url = this.metadata.url;
        console.log(`goto: ${url}`);

        /**
         * rewrite title
         * @title Open my home page and delay 1s
         */
        await mockPageGoto(this.page, url);

        // for client script
        // console.log(`addInitScript: ${this.metadata.clientPath}`);

        /**
         * rewrite title
         * @title Add Init Script
         */
        // await this.page.addInitScript({
        //     path: this.metadata.clientPath
        // });
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
