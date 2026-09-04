import { Util } from 'turbogrid';
import Share from 'monocart-platform-share';

const CommonUtil = {
    ... Util,
    ... Share,

    isTouchDevice: function() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
    }

};

export default CommonUtil;
