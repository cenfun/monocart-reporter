import { Util as GridUtil } from 'turbogrid';
import decompress from 'lz-utils/lib/decompress.js';
import Share from '../../../../lib/utils/share.js';

const Util = {
    ... GridUtil,

    ... Share,

    pageTimings: [{
        key: 'onContentLoad',
        name: 'DOM Content Loaded',
        color: '#1a1aa6'
    }, {
        key: 'onLoad',
        name: 'Page Loaded',
        color: '#c80000'
    }],

    timings: [{
        key: 'blocked',
        name: 'Blocking',
        color: '#858585'
    }, {
        key: 'dns',
        name: 'DNS Lookup',
        color: '#009688'
    }, {
        key: 'connect',
        name: 'Connecting',
        color: '#b52dcd'
    }, {
        key: 'send',
        name: 'Sending',
        color: '#74979a'
    }, {
        key: 'wait',
        name: 'Waiting',
        color: '#00a846'
    }, {
        key: 'receive',
        name: 'Receiving',
        color: '#0299de'
    }],

    decompress,

    isTouchDevice: function() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
    },

    getTransferSize: function(item) {
        let { headersSize, bodySize } = item;
        headersSize = Math.max(headersSize, 0);
        bodySize = Math.max(bodySize, 0);
        const transferSize = headersSize + bodySize;
        const list = [];
        list.push(`${Util.NF(transferSize)} Bytes`);
        list.push(`(Headers: ${Util.NF(headersSize)} Bytes, Body: ${Util.NF(bodySize)} Bytes)`);
        return list.join(' ');
    }
};

export default Util;
