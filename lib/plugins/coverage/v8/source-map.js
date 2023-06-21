const fs = require('fs');
const path = require('path');
const EC = require('eight-colors');

const { SourceMapConsumer } = require('source-map');

const PositionMapping = require('./position-mapping.js');
const { dedupeCountRanges } = require('./dedupe.js');
const { initSourceMapRootAndUrl } = require('../coverage-utils.js');

const Concurrency = require('../../../platform/concurrency.js');
const { convertSourceMap, axios } = require('../../../runtime/monocart-coverage.js');
const Util = require('../../../utils/util.js');

// SourceMapConsumer.GREATEST_LOWER_BOUND = 1;
// SourceMapConsumer.LEAST_UPPER_BOUND = 2;
const BIAS = {
    left: SourceMapConsumer.GREATEST_LOWER_BOUND,
    right: SourceMapConsumer.LEAST_UPPER_BOUND
};

// =========================================================================================================

const findOriginalPosition = (consumer, line, column, sides) => {
    let original;
    for (const side of sides) {
        original = consumer.originalPositionFor({
            line,
            column,
            bias: BIAS[side]
        });
        if (original.source !== null) {
            break;
        }
    }
    if (original && original.source !== null) {
        return original;
    }
};

const findOriginalStartPosition = (consumer, sLoc) => {
    const { line, column } = sLoc;
    return findOriginalPosition(consumer, line, column, ['right', 'left']);
};

const findOriginalEndInRange = (consumer, generatedMapping, range) => {
    const { start, end } = range;
    // from -2 (already -1)
    // > start (no need equal)
    for (let i = end - 2; i > start; i--) {
        const loc = generatedMapping.offsetToLocation(i);
        const op = findOriginalPosition(consumer, loc.line, loc.column, ['left', 'right']);
        if (op) {
            return op;
        }
    }
};

const findOriginalEndPosition = (consumer, eLoc, generatedMapping, range) => {
    const { line, column } = eLoc;

    // before end column must be >= 0
    const currentColumn = Math.max(column - 1, 0);

    let ep = findOriginalPosition(consumer, line, currentColumn, ['left', 'right']);
    if (!ep) {
        ep = findOriginalEndInRange(consumer, generatedMapping, range);
        if (!ep) {
            return;
        }
    }

    const afterEndMapping = consumer.generatedPositionFor({
        source: ep.source,
        line: ep.line,
        column: ep.column + 1,
        bias: BIAS.right
    });

    if (afterEndMapping.line === null) {
        return {
            source: ep.source,
            line: ep.line,
            column: Infinity
        };
    }

    const mapping = consumer.originalPositionFor(afterEndMapping);
    if (mapping.line !== ep.line) {
        return {
            source: ep.source,
            line: ep.line,
            column: Infinity
        };
    }

    return mapping;
};

// =========================================================================================================

const getOriginalMappings = (consumer, options) => {

    // source filter
    let sourceList = consumer.sources;
    if (typeof options.sourceFilter === 'function') {
        sourceList = sourceList.filter((sourcePath) => {
            return options.sourceFilter(sourcePath);
        });
    }

    // create original content mappings
    const originalMappings = new Map();
    for (const sourcePath of sourceList) {
        // console.log(`add source: ${k}`);
        const sourceContent = consumer.sourceContentFor(sourcePath);
        if (typeof sourceContent !== 'string') {
            EC.logRed(`[MCR] not found source content: ${sourcePath}`);
            continue;
        }

        const mapping = new PositionMapping(sourceContent, sourcePath);
        originalMappings.set(sourcePath, mapping);
    }

    return originalMappings;
};

// =========================================================================================================

const addOriginalRange = (originalMapping, start, end, count) => {
    originalMapping.ranges.push({
        start,
        end,
        count
    });
};

// =========================================================================================================


const unpackJsSourceMap = async (item, v8list, options) => {
    // console.log('------------------------------------------------------');
    // console.log(item.type, item.url);
    // console.log(Object.keys(item));

    const sourceMap = item.sourceMap;

    const fileUrls = {};
    const fileSources = {};
    initSourceMapRootAndUrl(sourceMap, fileUrls, fileSources, options.sourcePath);

    const generatedMapping = new PositionMapping(item.source);
    const consumer = await new SourceMapConsumer(sourceMap);
    const originalMappings = getOriginalMappings(consumer, options);

    // generated ranges to original ranges
    item.ranges.forEach((range) => {

        // find start location
        const sLoc = generatedMapping.offsetToLocation(range.start);
        const oSLoc = findOriginalStartPosition(consumer, sLoc);
        if (!oSLoc) {
            // not found start
            return;
        }

        // if source excluded
        const currentSource = oSLoc.source;
        const originalMapping = originalMappings.get(currentSource);
        if (!originalMapping) {
            // possible this source has been filtered
            // console.log(`not found source: ${currentSource}`);
            return;
        }

        const originalStart = originalMapping.locationToOffset(oSLoc);

        // find end location
        const eLoc = generatedMapping.offsetToLocation(range.end);
        const oELoc = findOriginalEndPosition(consumer, eLoc, generatedMapping, range);
        if (!oELoc) {

            // console.log(EC.red('not found end'));
            // console.log(item.url);
            // console.log(originalMapping.sourceName);
            // console.log('generated start', sLoc.line, sLoc.column, 'original start', oSLoc.line, oSLoc.column);
            // console.log('generated end', eLoc.line, eLoc.column);

            // can NOT use file end

            return;
        }

        if (oSLoc.source !== oELoc.source) {
            // console.log('ERROR: range crossed source file', range, oSLoc.source, oELoc.source);
            return;
        }

        const originalEnd = originalMapping.locationToOffset(oELoc);
        if (originalEnd < originalStart) {
            // range start greater than end
            addOriginalRange(originalMapping, originalEnd, originalStart, range.count);
            return;
        }

        addOriginalRange(originalMapping, originalStart, originalEnd, range.count);

    });

    consumer.destroy();

    // append to v8list
    originalMappings.forEach((originalMapping, currentSource) => {

        const url = fileUrls[currentSource] || currentSource;
        const ranges = dedupeCountRanges(originalMapping.ranges);

        //  console.log('add source url', url);

        // original source and id
        const source = originalMapping.source;
        const id = Util.calculateSha1(url + source);

        let ext = path.extname(currentSource);
        let type = '';
        if (ext) {
            ext = ext.slice(1);
            const reg = /^[a-z0-9]+$/;
            if (reg.test(ext)) {
                type = ext;
            }
        }


        v8list.push({
            url,
            id,
            type,
            sourcePath: currentSource,
            distFile: item.sourceMap.file,
            ranges,
            source
        });

    });
};

// =========================================================================================================

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

const collectInlineSourceMaps = async (v8list) => {
    const concurrency = new Concurrency();
    for (const item of v8list) {

        const { type, source } = item;

        // only for js
        if (type === 'js') {
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

const collectFileSourceMaps = async (v8list, options) => {
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
        const [err, res] = await request({
            url: item.sourceMapUrl
        });
        const sourceData = item.sourceData;
        if (!err && res) {
            sourceData.sourceMap = resolveSourceMap(res.data);
        }
        await saveSourceFile(item.sourcePath, sourceData);
    });
};

const saveSourceFile = async (filePath, data) => {
    await Util.writeFile(filePath, JSON.stringify(data));
};

const collectSourceMaps = async (v8list, options, inlineSourceMap) => {

    if (inlineSourceMap) {
        await collectInlineSourceMaps(v8list);
        return;
    }

    await collectFileSourceMaps(v8list, options);

};

// =========================================================================================================
const filterSourceMapList = (v8list, options) => {
    const sourceMapList = [];
    const indexes = [];

    v8list.forEach((item, i) => {
        const sourceMap = item.sourceMap;
        if (!sourceMap) {
            return;
        }
        sourceMapList.push(item);
        indexes.push(i);
    });

    if (!sourceMapList.length) {
        return;
    }

    // do not remove in debug mode
    if (!options.debug) {
        // remove dist file if found sourceMap
        indexes.reverse();
        indexes.forEach((i) => {
            v8list.splice(i, 1);
        });
    }

    return sourceMapList;
};

// requires ranges before unpack
const unpackSourceMaps = async (v8list, options) => {

    const sourceMapList = filterSourceMapList(v8list, options);
    if (!sourceMapList) {
        // nothing to unpack
        return;
    }

    // console.log(sourceMapList);

    // only js
    for (const item of sourceMapList) {
        await unpackJsSourceMap(item, v8list, options);
    }
};


module.exports = {
    collectSourceMaps,
    unpackSourceMaps
};
