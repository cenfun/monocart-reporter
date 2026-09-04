import { Util } from 'turbogrid';
import * as Shared from '../../shared/index.js';

const CommonUtil = {
    ... Util,
    ... Shared,

    isTouchDevice: function() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
    }

};

export default CommonUtil;
