const { test, expect } = require('@playwright/test');
const { useState } = require('monocart-reporter');

/**
 * @verify failed
 */
test('state test hang up', async () => {

    const state = useState();
    const count = await state.get('count');
    console.log('count', count);
    expect(count).toBeGreaterThanOrEqual(0);

});

test('state test send message', async () => {

    const state = useState();

    // send message and receive response from a test (child process)
    const response = await state.send({
        testId: test.info().testId,
        data: 'my test data'
    });

    console.log('receive response on client', response);

});
