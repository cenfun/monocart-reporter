import { Util as GridUtil } from 'turbogrid';
import { saveAs } from 'file-saver';

import Share from '../../../../lib/utils/share.js';

const Util = {
    ... GridUtil,

    ... Share,

    findBetween: function(list, callback) {
        const end = list.length - 1;
        if (end < 1) {
            return;
        }
        for (let i = 0; i < end; i++) {
            const res = callback(list[i], list[i + 1]);
            if (res) {
                return res;
            }
        }
    },

    isTouchDevice: function() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
    },

    quoteAttr: (s) => {
        return `${s}`
            // This MUST be the 1st replacement.
            .replace(/&/g, '&amp;')
            // The 4 other predefined entities, required.
            .replace(/'/g, '&apos;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    },

    getTypeIcon: (subType, type) => {
        const icons = {
            suite: 'suite',
            project: 'project',
            file: 'file',
            shard: 'shard',
            case: 'case',
            step: 'step'
        };
        return icons[subType] || icons[type];
    },

    exportJson(json, name) {
        if (!json) {
            console.log('Not found json to export');
            return;
        }
        const string = JSON.stringify(json, null, 4);
        const blob = new Blob([string], {
            type: 'text/plain;charset=utf-8'
        });
        saveAs(blob, `${name}.json`);
    },

    // =============================================================================
    // hash
    getHash(key) {
        let hash = {};
        const h = location.hash.slice(1);
        if (h) {
            const usp = new URLSearchParams(h);
            hash = Object.fromEntries(usp);
        }
        if (key) {
            return hash[key];
        }
        return hash;
    },

    setHash(key, value) {
        if (!key) {
            return;
        }
        let obj = key;
        if (arguments.length === 2) {
            obj = {};
            obj[key] = value;
        }
        const hash = Util.getHash();
        Object.keys(obj).forEach((k) => {
            hash[k] = obj[k];
        });
        const usp = new URLSearchParams(hash);
        location.hash = usp.toString();
    },

    delHash(key) {
        if (!key) {
            location.hash = '';
            return;
        }
        let list = key;
        if (!Array.isArray(key)) {
            list = [key];
        }
        const hash = Util.getHash();
        list.forEach((k) => {
            delete hash[k];
        });
        const usp = new URLSearchParams(hash);
        location.hash = usp.toString();
    }

};

export default Util;
