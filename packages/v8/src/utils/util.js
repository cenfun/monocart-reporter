import { Util as GridUtil } from 'turbogrid';
import Share from '../../../../lib/platform/share.js';

const Util = {
    ... GridUtil,

    ... Share,

    isTouchDevice: function() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
    }
};

export default Util;
