const { test, expect } = require('@playwright/test');

test.describe('two tests', () => {
    test('one', async () => {
        // ...
    });

    test.describe('two tests', () => {
        test('one', async () => {
            // ...
        });

        test('failed case', () => {


            console.error('stderr: failed case error');

            expect('passed').toBe('failed');
        });

        test('fail - not yet ready', () => {
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

    test('timeout case', () => {
        test.setTimeout(3000);
    });

    test('two', async () => {
        // ...
    });
});


test('after describe', () => {

});
