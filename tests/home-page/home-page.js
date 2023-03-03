const { expect } = require('@playwright/test');
const Util = require('../common/util.js');

class HomePage {

    constructor(page, context, use) {
        this.page = page;
        this.context = context;
        this.use = use;
        console.log('use', use);
    }

    async init() {
        // for client script
        console.log(`addInitScript: ${this.use.clientPath}`);

        /**
         * override title
         * @title Add Init Script
         */
        await this.context.addInitScript({
            path: this.use.clientPath
        });
        await Util.delay(500);
    }

    async goto() {
        const url = this.use.url;
        console.log(`goto: ${url}`);

        /**
         * override title
         * @title Open my home page and delay 1s
         */
        await this.page.goto(url);
        await Util.delay(1000);
    }

    async checkClientScript() {
        const hasClientLib = await this.page.evaluate(async () => {
            await window.delay(100);
            await window.ready(() => {
                return document.querySelector('body');
            });
            return true;
        });
        await expect(hasClientLib).toBeTruthy();
    }

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
