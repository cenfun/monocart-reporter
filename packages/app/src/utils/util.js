import { saveAs, CommonUtil } from '../common/common.js';

const Util = {
    ... CommonUtil,

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

    copyText: (text) => {
        return new Promise((resolve) => {
            let err;
            try {
                navigator.clipboard.writeText(text);
            } catch (e) {
                err = e;
            }
            if (err) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    },

    getMetadataList: (metadata) => {
        const metadataList = [];
        if (!metadata) {
            return metadataList;
        }
        Object.keys(metadata).map((k) => {

            const it = {
                icon: 'item-arrow',
                name: k
            };

            const v = metadata[k];
            if (typeof v === 'object' && v) {
                if (Object.keys(v).length > 0) {
                    it.isObject = true;
                    it.value = v;
                } else {
                    it.value = JSON.stringify(v);
                }
            } else {
                const str = `${v}`.trim();
                if (str.startsWith('http://') || str.startsWith('https://')) {
                    it.isLink = true;
                }
                it.value = str;
            }

            metadataList.push(it);
        });
        return metadataList;
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
