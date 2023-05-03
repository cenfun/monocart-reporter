import { Util as GridUtil } from 'turbogrid';
import { decompress } from 'lz-utils';
import Share from '../../../../lib/platform/share.js';

const Util = {
    ... GridUtil,

    ... Share,

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
