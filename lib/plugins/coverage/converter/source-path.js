const path = require('path');
const Util = require('../../../utils/util.js');

const resolveUrl = (input) => {
    let url;
    try {
        url = new URL(input);
    } catch (e) {
        // console.error('error url', input);
        return;
    }
    return url;
};

const filterPath = (str) => {
    str = decodeURI(str);
    // remove / of start, end or double, ./ ../
    const ls = str.split('/').map((it) => {
        it = it.trim();
        // remove illegal characters except /
        it = it.replace(/[\\:*?"<>|]/g, '');
        // space
        it = it.replace(/\s+/g, '-');
        return it;
    }).filter((item) => {
        if (!item || item === '.' || item === '..') {
            return false;
        }
        return true;
    });
    return ls.join('/');
};

const getSourcePath = (url, index = '', type = '') => {

    if (!url) {
        // anonymous scripts will have __playwright_evaluation_script__ as their URL.
        url = ['file://anonymous', index ? `-${index}` : '', type ? `.${type}` : ''].join('');
    }

    const u = resolveUrl(url);
    if (u) {
        const host = [u.hostname, u.port].filter((it) => it).join('-');
        // always start with '/'
        const pathname = u.pathname;

        let p = host + pathname;
        // webpack://monocart-v8/packages/v8/src/app.vue?5cc4
        if (u.search) {
            p += `/${u.search}`;
        }

        return filterPath(p);
    }

    const relPath = Util.relativePath(url);
    return filterPath(relPath);
};

const getSourceType = (sourcePath) => {
    let ext = path.extname(sourcePath);
    let type = '';
    if (ext) {
        ext = ext.slice(1);
        const reg = /^[a-z0-9]+$/;
        if (reg.test(ext)) {
            type = ext;
        }
    }
    return type;
};

// ========================================================================================================

const initIstanbulSourcePath = (coverageData, fileSources, sourcePathHandler) => {
    if (typeof sourcePathHandler !== 'function') {
        return coverageData;
    }

    const newCoverage = {};
    Object.keys(coverageData).forEach((sourcePath) => {
        // previous coverage and source
        const item = coverageData[sourcePath];
        const source = fileSources[sourcePath];

        // new source path, second is source url
        const newSourcePath = sourcePathHandler(sourcePath, '');
        if (typeof newSourcePath === 'string' && newSourcePath) {
            sourcePath = newSourcePath;
        }

        // update source path
        item.path = sourcePath;
        newCoverage[sourcePath] = item;
        // update source for the new path
        if (source) {
            fileSources[sourcePath] = source;
        }
    });

    return newCoverage;
};

// ========================================================================================================

const mergeSourceRoot = (sourceRoot, sourceName) => {
    if (sourceName.startsWith(sourceRoot)) {
        return sourceName;
    }
    return sourceRoot + sourceName;
};

const initSourceMapSourcePath = (sourceMap, fileUrls, sourcePathHandler) => {
    // reset sourceRoot
    const sourceRoot = sourceMap.sourceRoot || '';
    sourceMap.sourceRoot = '';

    sourceMap.sources = sourceMap.sources.map((sourceName, i) => {
        const sourceUrl = mergeSourceRoot(sourceRoot, sourceName);

        let sourcePath = getSourcePath(sourceUrl, i + 1);
        if (typeof sourcePathHandler === 'function') {
            const newSourcePath = sourcePathHandler(sourcePath, sourceUrl);
            if (typeof newSourcePath === 'string' && newSourcePath) {
                sourcePath = newSourcePath;
            }
        }

        fileUrls[sourcePath] = sourceUrl;
        return sourcePath;
    });

};

module.exports = {
    getSourcePath,
    getSourceType,
    initIstanbulSourcePath,
    initSourceMapSourcePath
};
