const { expect } = require('@playwright/test');
const Util = require('../common/util.js');

class HomePage {

    constructor(page, context, config) {
        this.page = page;
        this.context = context;
        this.config = config;
        console.log('config', config);
    }

    async init() {
        // for client script
        console.log(`addInitScript: ${this.config.clientPath}`);
        await this.context.addInitScript({
            path: this.config.clientPath
        });
        await Util.delay(500);
    }

    async goto() {
        const url = this.config.url;
        console.log(`goto: ${url}`);
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

}


module.exports = HomePage;
