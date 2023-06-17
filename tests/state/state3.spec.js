const { test } = require('@playwright/test');
const { useState } = require('monocart-reporter');

test('state test 31', async () => {

    // wrong port
    const state = useState({
        port: 8080
    });

    const count = await state.get('count').catch((e) => {
        console.log(e);
    });
    console.log(count);


});
