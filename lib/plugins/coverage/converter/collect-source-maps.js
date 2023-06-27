const fs = require('fs');
const EC = require('eight-colors');
const { fileURLToPath } = require('url');
const Concurrency = require('../../../platform/concurrency.js');
const { convertSourceMap, axios } = require('../../../runtime/monocart-coverage.js');

const Util = require('../../../utils/util.js');

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

const loadSourceMap = async (url = '') => {

    if (url.startsWith('file://')) {
        const p = fileURLToPath(url);
        const json = Util.readJSONSync(p);
        if (!json) {
            Util.logDebug(EC.red(`failed to load sourcemap ${p}`));
            return;
        }
        return json;
    }

    const [err, res] = await request({
        url
    });

    if (err) {
        Util.logDebug(EC.red(`${err.message} ${url}`));
        return;
    }

    return res.data;
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
        Util.logDebug(EC.red(`${e.message} ${filename} ${url}`));
    }
    if (mapUrl) {
        return mapUrl.toString();
    }
};

const resolveSourceMap = (data) => {
    if (data) {
        const {
            sources, sourcesContent, mappings
        } = data;
        if (!sources || !sourcesContent || !mappings) {
            return;
        }
        return data;
    }
};

const collectInlineSourceMaps = async (v8list) => {
    let count = 0;
    const concurrency = new Concurrency();
    for (const item of v8list) {

        const { type, source } = item;

        // only for js
        if (type === 'js') {
            const converter = convertSourceMap.fromSource(source);
            if (converter) {
                item.sourceMap = resolveSourceMap(converter.sourcemap);
                count += 1;
                // source map comments is inline source map, remove it because it is big
                item.source = convertSourceMap.removeComments(source);

                continue;
            }
            const sourceMapUrl = getSourceMapUrl(source, item.url);
            if (sourceMapUrl) {
                // console.log('========================', sourceMapUrl);
                item.sourceMapUrl = sourceMapUrl;
                concurrency.addItem(item);
            }
        }
    }
    await concurrency.start(async (item) => {
        const data = await loadSourceMap(item.sourceMapUrl);
        if (data) {
            item.sourceMap = resolveSourceMap(data);
            count += 1;
            // source map comments is a link, no need remove
        }
    });

    return count;
};

const collectFileSourceMaps = async (v8list, options) => {
    let count = 0;
    const concurrency = new Concurrency();
    for (const item of v8list) {

        const {
            type, url, source, id
        } = item;

        // remove source just keep functions to reduce artifacts size
        delete item.source;

        const sourcePath = Util.resolveArtifactSourcePath(options.artifactsDir, id);
        if (fs.existsSync(sourcePath)) {
            continue;
        }

        const sourceData = {
            url,
            id,
            source: convertSourceMap.removeComments(source)
        };

        // only for js
        if (type === 'js') {
            const converter = convertSourceMap.fromSource(source);
            if (converter) {
                sourceData.sourceMap = resolveSourceMap(converter.sourcemap);
                count += 1;
                await saveSourceFile(sourcePath, sourceData);
                continue;
            }
            const sourceMapUrl = getSourceMapUrl(source, item.url);
            if (sourceMapUrl) {
                concurrency.addItem({
                    sourceMapUrl,
                    sourcePath,
                    sourceData
                });
                continue;
            }
        }

        await saveSourceFile(sourcePath, sourceData);

    }

    await concurrency.start(async (item) => {
        const sourceData = item.sourceData;
        const data = await loadSourceMap(item.sourceMapUrl);
        if (data) {
            sourceData.sourceMap = resolveSourceMap(data);
            count += 1;
        }
        await saveSourceFile(item.sourcePath, sourceData);
    });

    return count;
};

const saveSourceFile = async (filePath, data) => {
    await Util.writeFile(filePath, JSON.stringify(data));
};

const collectSourceMaps = (v8list, options, inlineSourceMap) => {

    if (inlineSourceMap) {
        return collectInlineSourceMaps(v8list);
    }

    return collectFileSourceMaps(v8list, options);

};

module.exports = collectSourceMaps;
