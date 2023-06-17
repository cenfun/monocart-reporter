const { test } = require('@playwright/test');
const { useState } = require('monocart-reporter');

const state = useState();

test('state test 11', async () => {

    const count = await state.get('count');
    console.log('count', count);
    await state.set('count', count + 1);

    await state.remove('removeKey');
});

test('state test 12', async () => {

    const count = await state.get('count');
    console.log('count', count);
    await state.set('count', count + 1);
});
