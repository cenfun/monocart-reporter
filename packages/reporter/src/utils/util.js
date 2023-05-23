import { Util as GridUtil } from 'turbogrid';
import { saveAs } from 'file-saver';
import Share from '../../../../lib/platform/share.js';
import * as Hash from '../common/hash.js';

const Util = {
    ... GridUtil,

    ... Share,
    ... Hash,

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

    loadJsonp(jsonpPath, callbackName = 'callback') {
        return new Promise((resolve) => {
            let data;
            window[callbackName] = (v) => {
                data = v;
            };
            const script = document.createElement('script');
            const onLoad = () => {
                script.remove();
                window[callbackName] = null;
                resolve(data);
            };
            script.onload = onLoad;
            script.onerror = onLoad;
            script.src = jsonpPath;
            document.body.appendChild(script);
        });
    }

};

export default Util;
