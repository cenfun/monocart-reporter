const { test, expect } = require('@playwright/test');
const Util = require('../common/util.js');

/**
 * @owner Kevin
 * @jira Epic #16888
 */
test('case before suite', () => {

});

/**
 * @owner Mark
 * @jira Story #16900
 */
test.describe('suite group 1', () => {

    // https://playwright.dev/docs/test-fixtures
    // First argument must use the object destructuring pattern: fixtures
    /**
     * @owner Mark
     * @jira Task #16933
     */
    test('case info', ({ browserName }, testInfo) => {

        expect(testInfo).toBe(test.info());

    });

    test('case steps', async () => {

        const result1 = await test.step('step 1', () => {
            return 'result';
        });

        const result2 = await test.step('step 2', () => {
            return 'result';
        });

        expect(result1).toBe(result2);

        // @owner Steve
        await test.step('step slow (500ms)', () => {
            return new Promise((resolve) => {
                setTimeout(resolve, 500);
            });
        });

        test.step('step soft assertion failed', () => {
            expect.soft(1).toBe(2);
        });

    });

    test.describe('suite sub group', () => {
        test('case first', async () => {
            // ...
        });

        // https://playwright.dev/docs/test-annotations#custom-annotations
        /**
         * @annotations issue [link](https://github.com/cenfun/monocart-reporter)
         * @jira Task #16933
         */
        test('case custom annotations', () => {

        });

        /**
         * @owner Mark
         * @jira Task #16936
         */
        test('case failed', () => {

            console.log('stdout: failed case log');

            console.error('stderr: failed case error');

            expect('passed').toBe('failed');
        });

        test('case fail - not yet ready', () => {

            test.fail();
            console.log('failed');
        });

        test('case fixme - not yet ready', () => {
            test.fixme();
            console.log('fixme');
        });

        test('case last', async () => {
            // ...
        });
    });

    test('case skipped by test.skip()', () => {
        test.skip();
        console.log('skipped');
    });

    test.skip('case skipped case', () => {
        expect('skipped').toBe('skipped');
    });

    test('case two', async () => {
        // ...
    });
});

test.describe('suite group 2', () => {

    test('case flaky', ({ browserName }, testInfo) => {

        console.log(`retry: ${testInfo.retry}`);
        expect(testInfo.retry).toBe(1);

    });

    test('case timeout 3000', async () => {
        test.setTimeout(3000);
        await Util.delay(10 * 1000);
    });

    test('case one', async () => {
        // ...
    });

    test('case two', async () => {
        // ...
    });
});


test('case after suite', () => {

});
