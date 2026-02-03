const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

/**
 * Test suite for tag deep linking feature
 * Tests URL hash parameter support for filtering by tags
 * 
 * NOTE: These tests require a pre-generated report at .temp/monocart/index.html
 * Run `npm run test-example` first to generate the report, then run these tests
 */

// Path to the generated test report
const reportPath = path.resolve(__dirname, '../../.temp/monocart/index.html');
const reportUrl = `file://${reportPath}`;

// Check if report exists before running tests
const reportExists = fs.existsSync(reportPath);

test.describe('Tag Deep Linking', () => {

    test.beforeAll(() => {
        if (!reportExists) {
            test.skip();
        }
    });

    test('should initialize keywords from tags hash parameter - single tag', async ({ page }) => {
        // Navigate to report with tags hash
        await page.goto(`${reportUrl}#tags=smoke`);

        // Wait for the report to load
        await page.waitForSelector('.mcr-search input', { timeout: 5000 });

        // Check that search box contains @smoke
        const searchInput = page.locator('.mcr-search input');
        await expect(searchInput).toHaveValue('@smoke');

        // Verify hash is still in URL
        const url = page.url();
        expect(url).toContain('#tags=smoke');
    });

    test('should initialize keywords from tags hash parameter - multiple tags', async ({ page }) => {
        // Navigate to report with multiple tags
        await page.goto(`${reportUrl}#tags=smoke,slow`);

        await page.waitForSelector('.mcr-search input', { timeout: 5000 });

        // Check that search box contains @smoke @slow
        const searchInput = page.locator('.mcr-search input');
        await expect(searchInput).toHaveValue('@smoke @slow');

        // Verify hash contains both tags
        const url = page.url();
        expect(url).toContain('#tags=smoke,slow');
    });

    test('should work with caseType filter combination', async ({ page }) => {
        // Navigate with both caseType and tags
        await page.goto(`${reportUrl}#caseType=failed&tags=sanity`);

        await page.waitForSelector('.mcr-search input', { timeout: 5000 });

        // Check search box has tag
        const searchInput = page.locator('.mcr-search input');
        await expect(searchInput).toHaveValue('@sanity');

        // Verify hash contains both parameters
        const url = page.url();
        expect(url).toContain('caseType=failed');
        expect(url).toContain('tags=sanity');
    });

    test('should sync keywords to hash when typing tags', async ({ page }) => {
        // Navigate to report without hash
        await page.goto(reportUrl);

        await page.waitForSelector('.mcr-search input', { timeout: 5000 });

        // Type tags in search box
        const searchInput = page.locator('.mcr-search input');
        await searchInput.fill('@smoke @critical');

        // Wait a bit for debounced sync
        await page.waitForTimeout(500);

        // Verify hash was updated (commas may be URL-encoded as %2C)
        const url = page.url();
        expect(url).toMatch(/#tags=smoke(%2C|,)critical/);
    });

    test('should remove tags from hash when search is cleared', async ({ page }) => {
        // Start with tags in hash
        await page.goto(`${reportUrl}#tags=smoke`);

        await page.waitForSelector('.mcr-search input', { timeout: 5000 });

        // Clear the search box
        const searchInput = page.locator('.mcr-search input');
        await searchInput.clear();

        // Wait for sync
        await page.waitForTimeout(500);

        // Verify tags removed from hash
        const url = page.url();
        expect(url).not.toContain('tags=');
    });

    test('should handle browser back/forward navigation', async ({ page }) => {
        // Start with one tag
        await page.goto(`${reportUrl}#tags=smoke`);
        await page.waitForSelector('.mcr-search input', { timeout: 5000 });

        let searchInput = page.locator('.mcr-search input');
        await expect(searchInput).toHaveValue('@smoke');

        // Navigate to different tag
        await page.goto(`${reportUrl}#tags=slow`);
        await page.waitForTimeout(300);

        searchInput = page.locator('.mcr-search input');
        await expect(searchInput).toHaveValue('@slow');

        // Go back
        await page.goBack();
        await page.waitForTimeout(300);

        // Should restore @smoke
        searchInput = page.locator('.mcr-search input');
        await expect(searchInput).toHaveValue('@smoke');

        // Go forward
        await page.goForward();
        await page.waitForTimeout(300);

        // Should restore @slow
        searchInput = page.locator('.mcr-search input');
        await expect(searchInput).toHaveValue('@slow');
    });

    test('should handle invalid/non-existent tags gracefully', async ({ page }) => {
        // Navigate with non-existent tag
        await page.goto(`${reportUrl}#tags=nonexistent999`);

        await page.waitForSelector('.mcr-search input', { timeout: 5000 });

        // Check that search box shows the tag even if it doesn't exist
        const searchInput = page.locator('.mcr-search input');
        await expect(searchInput).toHaveValue('@nonexistent999');

        // Should show "No Results" message
        const noResults = page.locator('.mcr-no-results');
        await expect(noResults).toBeVisible();
    });

    test('should handle tags with dashes', async ({ page }) => {
        // Navigate with tag containing dash
        await page.goto(`${reportUrl}#tags=some-tag`);

        await page.waitForSelector('.mcr-search input', { timeout: 5000 });

        // Check that it's parsed correctly
        const searchInput = page.locator('.mcr-search input');
        await expect(searchInput).toHaveValue('@some-tag');
    });

    test('should only sync @tag patterns to hash, not other keywords', async ({ page }) => {
        // Navigate to report
        await page.goto(reportUrl);

        await page.waitForSelector('.mcr-search input', { timeout: 5000 });

        // Type mixed content: tags and regular text
        const searchInput = page.locator('.mcr-search input');
        await searchInput.fill('@smoke regular-text');

        // Wait for sync
        await page.waitForTimeout(500);

        // Verify only tag is in hash
        const url = page.url();
        expect(url).toContain('#tags=smoke');
        expect(url).not.toContain('regular-text');
    });

    test('should extract multiple tags from mixed keywords', async ({ page }) => {
        // Navigate to report
        await page.goto(reportUrl);

        await page.waitForSelector('.mcr-search input', { timeout: 5000 });

        // Type multiple tags with other text
        const searchInput = page.locator('.mcr-search input');
        await searchInput.fill('@smoke some text @slow more text @critical');

        // Wait for sync
        await page.waitForTimeout(500);

        // Verify all tags are in hash (commas may be URL-encoded as %2C)
        const url = page.url();
        expect(url).toMatch(/#tags=smoke(%2C|,)slow(%2C|,)critical/);
    });

    test('should handle URL encoding for tags', async ({ page }) => {
        // Navigate with tags that might need encoding
        await page.goto(`${reportUrl}#tags=smoke,slow`);

        await page.waitForSelector('.mcr-search input', { timeout: 5000 });

        // Verify tags are parsed correctly
        const searchInput = page.locator('.mcr-search input');
        await expect(searchInput).toHaveValue('@smoke @slow');
    });

    test('should persist tags when changing caseType filter', async ({ page }) => {
        // Start with tags and failed filter
        await page.goto(`${reportUrl}#caseType=failed&tags=smoke`);

        await page.waitForSelector('.mcr-search input', { timeout: 5000 });

        // Verify initial state
        const searchInput = page.locator('.mcr-search input');
        await expect(searchInput).toHaveValue('@smoke');

        // Verify both parameters present
        const url = page.url();
        expect(url).toContain('tags=smoke');
        expect(url).toContain('caseType=failed');
    });
});
