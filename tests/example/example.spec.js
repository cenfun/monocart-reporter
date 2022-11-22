const { test, expect } = require('@playwright/test');
const Util = require('../common/util.js');

test('before describe', () => {

    // test() can only be called in a test file
    // no test in test
    // test('inside', () => {
    // });

});


test('flaky case', ({ browserName }, testInfo) => {

    console.log(`retry: ${testInfo.retry}`);
    expect(testInfo.retry).toBe(1);

});

// https://playwright.dev/docs/test-annotations#custom-annotations
test('test custom annotations', () => {
    test.info().annotations.push({
        type: 'issue',
        description: `## see github issues
- [monocart-reporter/issues](https://github.com/cenfun/monocart-reporter/issues)
- [playwright/custom-annotations](https://playwright.dev/docs/test-annotations#custom-annotations)
`
    });

    test.info().annotations.push({
        type: 'other',
        description: `## stats
- ![npm](https://img.shields.io/npm/v/monocart-reporter)
- ![npm](https://img.shields.io/npm/dt/monocart-reporter)
`
    });
});

test.describe('two tests @Elon_Musk', () => {


    test('one', () => {
        // ...

        test.info().annotations.push({
            owner: 'Elon Musk',
            story: '#16888'
        });

    });

    test.describe('two tests #16889', () => {
        test('one', async () => {
            // ...
        });

        test('failed case', () => {

            console.log('stdout: failed case log');

            console.error('stderr: failed case error');

            expect('passed').toBe('failed');
        });

        test('fail - not yet ready', () => {
            test.info().annotations.push({
                owner: 'Elon Musk',
                story: '#16900'
            });

            test.fail();
            console.log('failed');
        });

        test('fixme - not yet ready', () => {
            test.fixme();
            console.log('fixme');
        });

        test('two', async () => {
            // ...
        });
    });

    test('skipped test', () => {
        test.skip();
        console.log('skipped');
    });

    test.skip('skipped case', () => {
        expect('skipped').toBe('skipped');
    });

    test('two', async () => {
        // ...
    });
});

test.describe('two tests1', () => {
    test('one', async () => {
        // ...
    });

    test('timeout case', async () => {
        test.setTimeout(3000);
        await Util.delay(10 * 1000);
    });

    test('two', async () => {
        // ...
    });
});


test('after describe', () => {

});
