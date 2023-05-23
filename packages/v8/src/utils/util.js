import { CommonUtil } from 'monocart-common';

const Util = {
    ... CommonUtil,

    isTouchDevice: function() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
    }
};

export default Util;
