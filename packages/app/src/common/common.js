import { microtask, debounce } from 'async-tick';
import inflate from 'lz-utils/inflate';
import niceTicks from 'nice-ticks';
import { saveAs } from 'file-saver';

import hash from './hash.js';
import store from './store.js';

import decodeIcons from './icons.js';
import faviconIcon from '../images/icons/monocart.svg';

// const context = require.context('./images/icons', true, /\.svg$/);
// const icons = decodeIcons(context);

const setFavicon = () => {
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) {
        favicon.href = faviconIcon;
    }
};

import CommonUtil from './util.js';

export {
    microtask,
    debounce,
    inflate,
    niceTicks,
    saveAs,

    hash,
    store,

    decodeIcons,
    setFavicon,

    CommonUtil
};
