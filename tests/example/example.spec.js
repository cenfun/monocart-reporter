/**
 * add extra information for file
 * @owner FO
 */

const { test, expect } = require('@playwright/test');
const { delay } = require('../common/util.js');
const Util = require('../../lib/utils/util.js');

test.describe('@util group', () => {

    /**
 * add extra information for case
 * @owner Kevin
 * @jira MCR-16888
 * @testrail 2125
 * @zephyr MON-T1
 * @xray MON-2
 */
    test('@util time format', () => {

        const TF = Util.TF;

        // @title expect(TF(0)).toBe('0ms');
        expect(TF(0)).toBe('0ms');
        expect(TF(100)).toBe('100ms');

        expect(TF(1000)).toBe('1s');
        expect(TF(1001)).toBe('1s');
        expect(TF(1011)).toBe('1s');
        expect(TF(1051)).toBe('1.1s');
        expect(TF(1100)).toBe('1.1s');
        expect(TF(5121)).toBe('5.1s');

        // @title expect(TF(21100)).toBe('21.1s');
        expect(TF(21100)).toBe('21.1s');

        expect(TF(61100)).toBe('1m 1s');

        expect(TF(125100)).toBe('2m 5s');

        expect(TF(3600100)).toBe('1h 0m 0s');
        expect(TF(3601000)).toBe('1h 0m 1s');
        expect(TF(3700100)).toBe('1h 1m 40s');

        // @title expect(TF(12 * 3601000)).toBe('12h 0m 12s');
        expect(TF(12 * 3601000)).toBe('12h 0m 12s');

        expect(TF(24 * 3601000)).toBe('1d 0h 0m 24s');
        expect(TF(60 * 24 * 3601000)).toBe('60d 0h 24m 0s');

        expect(new Date(60 * 24 * 3601000).toISOString()).toBe('1970-03-02T00:24:00.000Z');
    });

    /**
     * @zephyr MON-T2
     *
     *
     */
    test('@util parseComments', () => {
        const str = `/**

    * add extra information * for case 
    // @single single line value
    * @comments multiple lines comments
    multiple lines comments @user_name Mark
    * @owner Kevin * Tom 
    * @jira MCR-16888 MCR-16889 
    ** @testrail 2125
    **/`;

        const parsed = Util.parseComments(str);

        // @title parsed comments length 6
        expect(Object.keys(parsed).length).toBe(6);

        expect(parsed.single).toBe('single line value');

        // @title multiple lines comments
        expect(parsed.comments).toBe('multiple lines comments\n    multiple lines comments');
        expect(parsed.user_name).toBe('Mark');
        expect(parsed.owner).toBe('Kevin * Tom');
        expect(parsed.jira).toBe('MCR-16888 MCR-16889');
        expect(parsed.testrail).toBe('2125');

    });

    /**
     * @zephyr MON-T3
     *
     */
    test('@util forEach', () => {
        const list = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, {
            toString: () => 10,
            subs: [11, 12, 13]
        }];

        const forEach = Util.forEach;

        let count = 0;
        let res = [];
        forEach(list, (item) => {
            count += 1;
            res.push(item);
        });
        expect(count).toBe(14);
        expect(res.join('')).toBe('012345678910111213');

        count = 0;
        res = [];
        forEach(list, (item) => {
            count += 1;
            if (item === 3) {
                return 'break';
            }
            res.push(item);
        });
        // @title break with return "break"
        expect(count).toBe(4);
        expect(res.join('')).toBe('012');

        count = 0;
        res = [];
        forEach(list, (item) => {
            count += 1;
            if (item === 6) {
                return false;
            }
            res.push(item);
        });
        // @title break with return false
        expect(count).toBe(7);
        expect(res.join('')).toBe('012345');

        count = 0;
        res = [];
        forEach(list, (item) => {
            count += 1;
            if (item === 6) {
                return;
            }
            res.push(item);
        });
        expect(count).toBe(14);
        expect(res.join('')).toBe('01234578910111213');

    });

});


/**
 * @testrail 2126
 * @xray MON-3
 */
test('Test login page @fast', () => {
    expect(Math.random()).toBeLessThan(0.5);
});

/**
 * @testrail 2127
 * @xray MON-4
 */
test('@smoke Test full report', () => {
    expect(Math.random()).toBeLessThan(0.5);
});

/**
 * add extra information for suite
 * @owner Mark
 * @jira MCR-16900
 */
test.describe('suite group 1 @beta', () => {

    // https://playwright.dev/docs/test-fixtures
    // First argument must use the object destructuring pattern: fixtures
    /**
     * @owner Mark
     * @jira MCR-16933
     * @testrail 2128
     */
    test('@smoke case info', () => {

        /**
         * rewrite assert step title "expect.toBe" to
         * @title my custom assert step title
         * @annotations important
         */
        expect(test.info()).toBeTruthy();

    });

    /**
     * @testrail 2129
     */
    test('@sanity case steps @slow', async () => {

        const result1 = await test.step('step 1', async () => {

            await test.step('sub step', async () => {

                await test.step('sub step', () => {

                });

            });

            return 'result';
        });

        const result2 = await test.step('step 2', () => {
            return 'result';
        });

        expect(result1).toBe(result2);

        // @owner Steve
        await test.step('step @slow (500ms)', () => {
            return new Promise((resolve) => {
                setTimeout(resolve, 500);
            });
        });

        test.step('step soft assertion failed', () => {
            expect.soft(1).toBe(2);
        });

    });

    test.describe('suite sub group @beta', () => {

        test.beforeEach(async () => {
            console.log('beforeEach delay 10');
            await delay(10);
        });

        test('@smoke case first', async () => {
            // ...
        });

        // https://playwright.dev/docs/test-annotations#custom-annotations
        test('@critical annotations', () => {
            test.info().annotations.push({
                type: 'issues',
                description: ['MCR-666', 'MCR-888']
            });
            test.info().annotations.push({
                type: 'markdown',
                description: '[monocart-reporter/issues](https://github.com/cenfun/monocart-reporter/issues)'
            });
        });

        /**
         * @description It's also possible to add custom metadata in the form of annotations to your tests. Annotations are key/value pairs accessible via test.info().annotations. Many reporters show annotations, for example 'html'.
Playwright Test supports test annotations to deal with failures, flakiness, skip, focus and tag tests:
- test.skip() marks the test as irrelevant. Playwright Test does not run such a test. Use this annotation when the test is not applicable in some configuration.
- test.fail() marks the test as failing. Playwright Test will run this test and ensure it does indeed fail. If the test does not fail, Playwright Test will complain.
- test.fixme() marks the test as failing. Playwright Test will not run this test, as opposed to the fail annotation. Use fixme when running the test is slow or crashes.
- test.slow() marks the test as slow and triples the test timeout.
         */
        test('@todo skipped test annotations', () => {
            test.info().annotations.push({
                type: 'issue', description: '#123'
            });
            test.info().annotations.push({
                type: 'issue', description: '[#456](https://github.com/cenfun/monocart-reporter)'
            });
            test.info().annotations.push({
                type: 'issue', description: 'https://github.com/cenfun/monocart-reporter'
            });
            test.info().annotations.push({
                type: 'issue'
            });
            test.info().annotations.push({
                type: 'empty'
            });
            test.skip(true, 'I am not interested in this test');
        });

        /**
         * @annotations issue [link](https://github.com/cenfun/monocart-reporter)
         * @jira MCR-16933
         */

        test('comment annotations @alpha', () => {

        });

        /**
         * @owner Mark
         * @jira MCR-16936
         */


        test('@sanity case failed', () => {

            console.log('console.log');
            console.error('console.error');
            console.warn('console.warn');
            console.debug('console.debug (next empty line)');
            console.log('');
            console.info('console.info');

            console.log(test.info().config.reporter);

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

        test('case last', () => {
            expect(Math.random()).toBeLessThan(0.5);
        });
    });

    test('case skipped by test.skip()', () => {
        test.skip();
        console.log('skipped');
    });

    test.skip('case skipped case', () => {
        expect('skipped').toBe('skipped');
    });

    test('case two', () => {
        expect(Math.random()).toBeLessThan(0.5);
    });
});

test.describe('suite group 2', () => {

    test('flaky @todo', () => {
        const testInfo = test.info();
        console.log(`retry: ${testInfo.retry}`);
        expect(testInfo.retry).toBe(1);

    });

    test('test timeout 1000', async () => {
        test.setTimeout(1000);
        await delay(2000);
    });

    test('random @passed or @failed or @flaky', () => {
        expect(Math.random()).toBeLessThan(0.5);
    });

    test('random @passed or @flaky', () => {
        expect(test.info().retry).toBe(Math.random() > 0.5 ? 1 : 0);
    });

    test('random @passed or @skipped', () => {
        if (Math.random() > 0.5) {
            test.skip();
        }
    });

    test('@smoke @fast one', () => {
        expect(Math.random()).toBeLessThan(0.5);
    });

    test('@sanity @critical two', () => {
        expect(Math.random()).toBeLessThan(0.5);
    });

    test('same title', () => {
        expect(Math.random()).toBeLessThan(0.5);
    });

});

test('same title', () => {
    expect(Math.random()).toBeLessThan(0.5);
});

test('@smoke case after suite', () => {
    expect(Math.random()).toBeLessThan(0.5);
});
