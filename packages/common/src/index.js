import { Grid, Util } from 'turbogrid';
import { microtask, debounce } from 'async-tick';
import inflate from 'lz-utils/inflate';

import hash from './hash.js';
import store from './store.js';

import decodeIcons from './icons.js';

import Share from '../../../lib/platform/share.js';

const CommonUtil = {
    ... Util,
    ... Share
};

const context = require.context('./icons', true, /\.svg$/);
const icons = decodeIcons(context);

export {
    Grid,
    microtask,
    debounce,
    inflate,

    hash,
    store,

    icons,
    decodeIcons,

    CommonUtil
};
