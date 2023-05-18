import { Util as GridUtil } from 'turbogrid';
import Share from '../../../../lib/platform/share.js';
import * as Hash from '../../../app/src/common/hash.js';

const Util = {
    ... GridUtil,

    ... Share,
    ... Hash,

    isTouchDevice: function() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
    }
};

export default Util;
