import { Util as GridUtil } from 'turbogrid';
import decompress from 'lz-utils/lib/decompress.js';
import Share from '../../../../lib/utils/share.js';

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
        list.push(Util.NF(transferSize));
        list.push(`(Headers: ${Util.NF(headersSize)}, Body: ${Util.NF(bodySize)})`);
        return list.join(' ');
    }
};

export default Util;
