/**
 * add extra information for file
 * @owner FO
 * @description
```mermaid
gantt
dateFormat  YYYY-MM-DD
title Gantt diagram for Monocart Reporter
excludes weekdays 2014-01-10
section A section
Completed task            :done,    des1, 2014-01-06,2014-01-08
Active task               :active,  des2, 2014-01-09, 3d
Future task               :         des3, after des2, 5d
Future task2               :         des4, after des3, 5d
```
 */

const { test, expect } = require('@playwright/test');
const Util = require('../../lib/utils/util.js');

test.describe('group', () => {

    /**
 * add extra information for case
 * @owner Kevin
 * @jira MCR-16888
 */
    test('@util time format', () => {

        const TF = Util.TF;

        // @title expect(TF(0)).toBe('0ms');
        expect(TF(0), '0 to be 0ms').toBe('0ms');
        expect(TF(100), 'time format 100 to be 100ms').toBe('100ms');

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

    test('@util parseComments', () => {
        const str = `/**

    * add extra information * for case 
    // @single single line value
    * @comments multiple lines comments
    multiple lines comments @user_name Mark
    * @owner Kevin * Tom 
    * @jira MCR-16888 MCR-16889 
    ** @someId 2125
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
        expect(parsed.someId).toBe('2125');

    });

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
        expect(count, 'count to be 14').toBe(14);
        expect(res.join(''), 'results to be 01234578910111213').toBe('01234578910111213');

    });

    test('@util getDuration', () => {
        let ranges = [
            {
                start: 1,
                end: 2
            }
        ];
        expect(Util.getDuration(ranges)).toBe(1);
        expect(Util.getDuration(ranges, 'exclude-idle')).toBe(1);

        ranges = [
            {
                start: 1,
                end: 6
            },
            {
                start: 8,
                end: 16
            },
            {
                start: 1,
                end: 3
            }
        ];
        expect(Util.getDuration(ranges)).toBe(15);
        expect(Util.getDuration(ranges, 'exclude-idle')).toBe(13);

        ranges = [
            {
                start: 1,
                end: 6
            },
            {
                start: 8,
                end: 16
            },
            {
                start: 2,
                end: 24
            }
        ];
        expect(Util.getDuration(ranges)).toBe(23);
        expect(Util.getDuration(ranges, 'exclude-idle')).toBe(23);

    });
});

test('@smoke Test full report', () => {

});

/**
 * add extra information for suite
 * @owner Mark
 * @jira MCR-16900
 */
test.describe('parent group', () => {

    // https://playwright.dev/docs/test-fixtures
    // First argument must use the object destructuring pattern: fixtures
    /**
     * @owner Mark
     * @jira MCR-16933
     */
    test('@smoke case info', () => {

        /**
         * rewrite assert step title "expect.toBe" to
         * @title my custom assert step title
         * @annotations important
         */
        expect(test.info(), 'info to be truthy').toBeTruthy();

    });

    /**
     * @verify failed
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

    test.describe('child group', () => {

        test.beforeEach(async () => {
            console.log('beforeEach delay 10');
            await new Promise((resolve) => {
                setTimeout(resolve, 10);
            });
        });

        /**
         * @description Sequence diagram for Monocart Reporter
```mermaid
flowchart LR

A[Hard] -->|Text| B(Round)
B --> C{Decision}
C -->|One| D[Result 1]
C -->|Two| E[Result 2]
```
```js
const a = 1;
console.log(a);
// default mermaid cdn: https://cdn.jsdelivr.net/npm/mermaid@latest/dist/mermaid.min.js
```
         */
        test('@markdown Description with mermaid', async () => {

        });

        /**
         * @description Description Title <br/>
description item 1 <br/>
description item 2 <br/>
description item 3
         */
        test('@smoke case first', async () => {
            // ...
        });

        // https://playwright.dev/docs/test-annotations#custom-annotations

        /**
         * @description ### Description Title [link](https://playwright.dev/)
- description item 1
- description item 2
- description item 3
         */
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
         * @verify failed
         */


        test('@sanity case failed', () => {

            console.log('console.log');
            console.error('console.error');
            console.warn('console.warn');
            console.debug('console.debug (next empty line)');
            console.log('');
            console.info('console.info');

            // console.log(test.info().config.reporter);

            expect('passed').toBe('failed');
        });

        /**
         * @verify failed
         */
        test('throw string error', () => {
            // eslint-disable-next-line no-throw-literal
            throw 'Invalid error';
        });

        /**
         * @verify failed
         */
        test('case fail - not yet ready', () => {

            test.fail();
            console.log('failed');
        });

        /**
         * @verify failed
         */
        test('title 中文', () => {
            test.fail();
        });

        test('case fixme - not yet ready', () => {
            test.fixme();
            console.log('fixme');
        });

        test('case last', () => {

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

    });
});

test.describe('next group', () => {

    /**
     * @verify flaky
     */
    test('flaky @todo', () => {
        const testInfo = test.info();
        console.log(`retry: ${testInfo.retry}`);
        expect(testInfo.retry).toBe(1);

    });

    /**
     * @verify failed
     */
    test('test timeout 1000', async () => {
        test.setTimeout(1000);
        await new Promise((resolve) => {
            setTimeout(resolve, 2000);
        });
    });

    /**
     * @verify random
     */
    test('random @passed    @failed@flaky', () => {
        expect(Math.random()).toBeLessThan(0.5);
    });

    /**
     * @verify random
     */
    test('random @passed or @flaky', () => {
        expect(test.info().retry).toBe(Math.random() > 0.5 ? 1 : 0);
    });

    /**
     * @verify random
     */
    test('random @passed or @skipped', () => {
        if (Math.random() > 0.5) {
            test.skip();
        }
    });

    test('@smoke @fast one', () => {

    });

    test('@sanity @critical two', () => {

    });

    test('same title', () => {

    });

});

test.describe('new syntax for tag and annotation in playwright v1.42.0', {
    // tag all tests in a group
    tag: '@report',
    // annotate all tests in a group
    annotation: {
        type: 'category', description: 'report'
    }
}, () => {

    // Note that tags must start with @ symbol.
    test('test @inline tag', {
        tag: '@fast'
    }, () => {});

    test('test @inline tags', {
        tag: ['@slow', '@new']
    }, () => {});

    // Annotate tests
    test('test annotation', {
        annotation: {
            type: 'issue', description: 'https://github.com/microsoft/playwright/issues/23180'
        }
    }, ({ page, browser }) => {
        // Runtime annotations
        test.info().annotations.push({
            type: 'browser version',
            description: browser.version()
        });

    });

    test('test annotations', {
        annotation: [{
            type: 'issue', description: 'https://github.com/microsoft/playwright/issues/23180'
        }, {
            type: 'performance', description: 'very slow test!'
        }]
    }, () => {});

});

test('same title', () => {

});

test('@smoke case after suite', () => {

});
