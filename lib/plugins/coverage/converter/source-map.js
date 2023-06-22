const fs = require('fs');
const { SourceMapConsumer } = require('source-map');
const Concurrency = require('../../../platform/concurrency.js');
const { convertSourceMap, axios } = require('../../../runtime/monocart-coverage.js');
const Util = require('../../../utils/util.js');

// SourceMapConsumer.GREATEST_LOWER_BOUND = 1;
// SourceMapConsumer.LEAST_UPPER_BOUND = 2;
const BIAS = {
    left: SourceMapConsumer.GREATEST_LOWER_BOUND,
    right: SourceMapConsumer.LEAST_UPPER_BOUND
};

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

                // source map comments is inline source map, remove it because it is big
                item.source = convertSourceMap.removeComments(source);

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

            // source map comments is a link, no need remove

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

// ========================================================================================================

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
    return findOriginalPosition(consumer, line + 1, column, ['right', 'left']);
};

const findOriginalEndInRange = (consumer, generatedPositionMapping, start, end) => {
    // from -2 (already -1)
    // > start (no need equal)
    for (let i = end - 2; i > start; i--) {
        const loc = generatedPositionMapping.offsetToLocation(i);
        const op = findOriginalPosition(consumer, loc.line + 1, loc.column, ['left', 'right']);
        if (op) {
            return op;
        }
    }
};

const findOriginalEndPosition = (consumer, eLoc, generatedPositionMapping, start, end) => {
    const { line, column } = eLoc;

    // before end column must be >= 0
    const currentColumn = Math.max(column - 1, 0);

    let ep = findOriginalPosition(consumer, line + 1, currentColumn, ['left', 'right']);
    if (!ep) {
        ep = findOriginalEndInRange(consumer, generatedPositionMapping, start, end);
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

const getOriginalRange = (consumer, range, generatedPositionMapping, originalMap) => {
    const { startOffset, endOffset } = range;
    // find start location
    const sLoc = generatedPositionMapping.offsetToLocation(startOffset);
    const oSLoc = findOriginalStartPosition(consumer, sLoc);
    if (!oSLoc) {
        // not found start
        return;
    }

    // if source excluded
    const sourcePath = oSLoc.source;
    const originalState = originalMap.get(sourcePath);
    if (!originalState) {
        // possible this source has been filtered
        // console.log(`not found source: ${currentSource}`);
        return;
    }

    const originalStart = originalState.positionMapping.locationToOffset(oSLoc);

    // find end location
    const eLoc = generatedPositionMapping.offsetToLocation(endOffset);
    const oELoc = findOriginalEndPosition(consumer, eLoc, generatedPositionMapping, startOffset, endOffset);
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

    const originalEnd = originalState.positionMapping.locationToOffset(oELoc);

    const res = {
        originalState,
        // for debug
        sourcePath,
        sLoc,
        eLoc,
        oSLoc,
        oELoc,
        // original offset
        originalStart,
        originalEnd
    };

    // switch the start and end sometimes
    if (originalEnd < originalStart) {
        // range start greater than end
        res.originalStart = originalEnd;
        res.originalEnd = originalStart;
    }

    return res;
};

module.exports = {
    collectSourceMaps,
    getOriginalRange
};
