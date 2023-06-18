const { test } = require('@playwright/test');
const { useState } = require('monocart-reporter');

test('state test hang up', async () => {

    console.log('should failed');

    // wrong port
    const state = useState({
        port: 8031
    });

    const count = await state.get('count');
    console.log('count', count);

});
