import { createApp } from 'vue';
import { setIcons } from 'vine-ui';

import App from './app.vue';
import router from './router.js';
import { decodeIcons } from './common/common.js';

const iconModules = import.meta.glob('./images/icons/*.svg', {
    eager: true,
    query: '?raw',
    import: 'default'
});
setIcons(decodeIcons(iconModules));

const app = createApp(App);
app.use(router);
app.mount('body');
