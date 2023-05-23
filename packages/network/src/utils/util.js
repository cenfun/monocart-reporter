import { CommonUtil } from 'monocart-common';

const Util = {
    ... CommonUtil,

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
