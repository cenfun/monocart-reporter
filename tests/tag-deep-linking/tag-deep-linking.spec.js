const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

/**
 * Tests URL query support for restoring the complete search keywords.
 *
 * NOTE: These tests require a pre-generated report at .temp/monocart/index.html
 * Run `npm run test-example` first to generate the report, then run these tests.
 */

const reportPath = path.resolve(__dirname, '../../.temp/monocart/index.html');
const reportUrl = `file://${reportPath}`;
const reportExists = fs.existsSync(reportPath);

const getReportUrl = (query, route = '/') => {
    const search = new URLSearchParams(query).toString();
    return `${reportUrl}#${route}${search ? `?${search}` : ''}`;
};

const getRouteQuery = (page) => {
    const hash = new URL(page.url()).hash;
    const index = hash.indexOf('?');
    return new URLSearchParams(index === -1 ? '' : hash.slice(index + 1));
};

test.describe('Keyword Deep Linking', () => {

    test.beforeAll(() => {
        if (!reportExists) {
            test.skip();
        }
    });

    test('should initialize a regular keyword from the route', async ({ page }) => {
        await page.goto(getReportUrl({
            keywords: 'login failed'
        }));
        await page.waitForSelector('.mcr-search input');

        await expect(page.locator('.mcr-search input')).toHaveValue('login failed');
        expect(getRouteQuery(page).get('keywords')).toBe('login failed');
    });

    test('should initialize tag keywords from the route', async ({ page }) => {
        await page.goto(getReportUrl({
            keywords: '@smoke @slow'
        }));
        await page.waitForSelector('.mcr-search input');

        await expect(page.locator('.mcr-search input')).toHaveValue('@smoke @slow');
        expect(getRouteQuery(page).get('keywords')).toBe('@smoke @slow');
    });

    test('should restore mixed tags and regular text', async ({ page }) => {
        const keywords = '@smoke login failed @critical';
        await page.goto(getReportUrl({
            keywords
        }));
        await page.waitForSelector('.mcr-search input');

        await expect(page.locator('.mcr-search input')).toHaveValue(keywords);
    });

    test('should work together with the caseType filter', async ({ page }) => {
        await page.goto(getReportUrl({
            caseType: 'failed',
            keywords: '@sanity login'
        }));
        await page.waitForSelector('.mcr-search input');

        await expect(page.locator('.mcr-search input')).toHaveValue('@sanity login');
        const query = getRouteQuery(page);
        expect(query.get('caseType')).toBe('failed');
        expect(query.get('keywords')).toBe('@sanity login');
    });

    test('should sync the complete search input to the route', async ({ page }) => {
        await page.goto(reportUrl);
        await page.waitForSelector('.mcr-search input');

        const keywords = '@smoke regular-text @critical';
        await page.locator('.mcr-search input').fill(keywords);
        await page.waitForTimeout(300);

        expect(getRouteQuery(page).get('keywords')).toBe(keywords);
        expect(page.url()).not.toContain('tags=');
    });

    test('should remove keywords from the route when search is cleared', async ({ page }) => {
        await page.goto(getReportUrl({
            keywords: '@smoke login'
        }));
        await page.waitForSelector('.mcr-search input');

        await page.locator('.mcr-search input').clear();
        await page.waitForTimeout(300);

        expect(getRouteQuery(page).has('keywords')).toBe(false);
    });

    test('should restore keywords with browser back and forward', async ({ page }) => {
        await page.goto(getReportUrl({
            keywords: '@smoke first'
        }));
        await page.waitForSelector('.mcr-search input');
        await expect(page.locator('.mcr-search input')).toHaveValue('@smoke first');

        await page.goto(getReportUrl({
            keywords: '@slow second'
        }));
        await expect(page.locator('.mcr-search input')).toHaveValue('@slow second');

        await page.goBack();
        await expect(page.locator('.mcr-search input')).toHaveValue('@smoke first');

        await page.goForward();
        await expect(page.locator('.mcr-search input')).toHaveValue('@slow second');
    });

    test('should preserve special characters', async ({ page }) => {
        const keywords = '@some-tag login & "quoted" / path';
        await page.goto(getReportUrl({
            keywords
        }));
        await page.waitForSelector('.mcr-search input');

        await expect(page.locator('.mcr-search input')).toHaveValue(keywords);
        expect(getRouteQuery(page).get('keywords')).toBe(keywords);
    });

    test('should handle a non-existent keyword gracefully', async ({ page }) => {
        await page.goto(getReportUrl({
            keywords: 'nonexistent999'
        }));
        await page.waitForSelector('.mcr-search input');

        await expect(page.locator('.mcr-search input')).toHaveValue('nonexistent999');
        await expect(page.locator('.mcr-no-results')).toBeVisible();
    });

    test('should preserve keywords on the report route', async ({ page }) => {
        await page.goto(getReportUrl({
            keywords: '@smoke report'
        }, '/report'));
        await page.waitForSelector('.mcr-search input');

        await expect(page.locator('.mcr-search input')).toHaveValue('@smoke report');
        expect(new URL(page.url()).hash).toContain('#/report?');
        expect(getRouteQuery(page).get('keywords')).toBe('@smoke report');
    });
});
