const Util = require('../../utils/util.js');
const Concurrency = require('../../platform/concurrency.js');
const { convertSourceMap, axios } = require('../../runtime/monocart-coverage.js');

const sortRanges = (ranges) => {
    ranges.sort((a, b) => {
        if (a.start === b.start) {
            return a.end - b.end;
        }
        return a.start - b.start;
    });
};

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

// ================================================================================================

const request = async (options) => {
    if (typeof options === 'string') {
        options = {
            url: options
        };
    }
    let err;
    const res = await axios(options).catch((e) => {
        err = e;
    });
    return [err, res];
};

const getSourceMapUrl = (content, url) => {

    const m = content.match(convertSourceMap.mapFileCommentRegex);
    if (!m) {
        return;
    }

    const comment = m.pop();
    const r = convertSourceMap.mapFileCommentRegex.exec(comment);
    // for some odd reason //# .. captures in 1 and /* .. */ in 2
    const filename = r[1] || r[2];

    let mapUrl;

    try {
        mapUrl = new URL(filename, url);
    } catch (e) {
        // console.log(e)
    }
    if (mapUrl) {
        return mapUrl.toString();
    }
};

const resolveSourceMap = (data) => {
    if (data) {
        const { sources, sourcesContent } = data;
        if (!sources || !sourcesContent) {
            return;
        }
        return data;
    }
};

const collectSourceMaps = async (v8list) => {
    const concurrency = new Concurrency();
    for (const item of v8list) {
        // useless for css
        if (item.type === 'css') {
            continue;
        }

        const source = item.source;
        const converter = convertSourceMap.fromSource(source);
        if (converter) {
            item.sourceMap = resolveSourceMap(converter.sourcemap);
            continue;
        }
        const sourceMapUrl = getSourceMapUrl(source, item.url);
        if (sourceMapUrl) {
            item.sourceMapUrl = sourceMapUrl;
            concurrency.addItem(item);
        }
    }
    await concurrency.start(async (item) => {
        const [err, res] = await request({
            url: item.sourceMapUrl
        });
        if (!err && res) {
            item.sourceMap = resolveSourceMap(res.data);
        }
    });
};


module.exports = {
    sortRanges,
    getSourcePath,
    collectSourceMaps
};
