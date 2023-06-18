const { test } = require('@playwright/test');
const { useState } = require('monocart-reporter');

test('state test 21', async ({ browserName }) => {
    const state = useState();
    const count = await state.get('count');
    console.log('count', count);
    await state.set('count', count + 1);

    await state.set({
        browser: browserName,
        someKey: 'some value'
    });

    const [browser, someKey] = await state.get('browser', 'someKey');
    console.log(browser, someKey);

    await state.remove('someKey');

    const all = await state.get();
    console.log(all);

});

test('state test 22', async () => {
    const state = useState();
    const count = await state.get('count');
    console.log('count', count);
    await state.set('count', count + 1);
});
