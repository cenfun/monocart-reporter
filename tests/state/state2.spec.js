const { test } = require('@playwright/test');
const { useState } = require('monocart-reporter');

test('state test 21', async ({ browserName }) => {
    const state = useState();
    const count = await state.get('count');
    console.log('count', count);
    await state.set('count', count + 1);

    await state.set('browserName', browserName);
});

test('state test 22', async () => {
    const state = useState();
    const count = await state.get('count');
    console.log('count', count);
    await state.set('count', count + 1);

    console.log(await state.get());

    await state.remove('removeKey');

    console.log(await state.get());

});
