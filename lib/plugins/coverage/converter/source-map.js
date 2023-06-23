const fs = require('fs');

const Concurrency = require('../../../platform/concurrency.js');

const {
    convertSourceMap,
    axios,
    originalPositionFor,
    generatedPositionFor,
    BIAS
} = require('../../../runtime/monocart-coverage.js');

const Util = require('../../../utils/util.js');

// ========================================================================================================

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

const findOriginalPosition = (tracer, line, column, direction) => {
    const original = originalPositionFor(tracer, {
        line,
        column,
        bias: BIAS[direction]
    });
    if (original && original.source !== null) {
        return original;
    }
};

// ==========================================================================

// start
const findOriginalStartPosition = (tracer, sLoc, generatedPositionMapping, end) => {
    const { line, column } = sLoc;
    const sp = findOriginalPosition(tracer, line + 1, column, 'right');


    // if (end === 62192) {
    //     console.log('============================================================');
    //     console.log(sLoc);
    //     console.log(sp);
    // }


    // if (sp) {
    //     // check offset if start > end
    //     // ()=>r, o=
    //     // start to end: "()=>r", but found start is: "o" that great than end "r"

    //     const gp = generatedPositionFor(tracer, sp);
    //     if (gp.line !== null) {
    //         const so = generatedPositionMapping.locationToOffset(gp);
    //         // sometimes when start no found will find right position but already out of end offset
    //         if (so > end) {
    //             // if (sp.source.endsWith('coverage/src/index.js')) {
    //             //     console.log('===================================================================');
    //             //     console.log(sLoc, sp);
    //             //     console.log(so, end);
    //             // }
    //             return;
    //         }
    //     }
    // }

    return sp;
};

// ==========================================================================

// end
const findOriginalEndPosition = (tracer, eLoc, generatedPositionMapping, start, end) => {
    const { line, column } = eLoc;

    // before end column must be >= 0
    const currentColumn = Math.max(column - 1, 0);

    let ep = findOriginalPosition(tracer, line + 1, currentColumn, 'left');
    if (!ep) {
        ep = findOriginalEndInRange(tracer, generatedPositionMapping, start, end);
        if (!ep) {
            return;
        }
    }

    const afterEndMapping = generatedPositionFor(tracer, {
        source: ep.source,
        line: ep.line,
        column: ep.column + 1
    });

    if (afterEndMapping.line === null) {
        return {
            source: ep.source,
            line: ep.line,
            column: Infinity
        };
    }

    const mapping = originalPositionFor(tracer, afterEndMapping);
    if (mapping.line !== ep.line) {
        return {
            source: ep.source,
            line: ep.line,
            column: Infinity
        };
    }

    return mapping;
};

const findOriginalEndInRange = (tracer, generatedPositionMapping, start, end) => {
    // from -2 (already -1)
    // > start (no need equal)
    for (let i = end - 2; i > start; i--) {
        const loc = generatedPositionMapping.offsetToLocation(i);
        const op = findOriginalPosition(tracer, loc.line + 1, loc.column, 'left');
        if (op) {
            return op;
        }
    }
};

// ==========================================================================

const getOriginalRange = (tracer, range, generatedPositionMapping, originalMap) => {
    const { startOffset, endOffset } = range;
    // find start location
    const sLoc = generatedPositionMapping.offsetToLocation(startOffset);
    const oSLoc = findOriginalStartPosition(tracer, sLoc, generatedPositionMapping, endOffset);
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
    const oELoc = findOriginalEndPosition(tracer, eLoc, generatedPositionMapping, startOffset, endOffset);
    if (!oELoc) {

        // console.log(EC.red('not found end'));
        // console.log(item.url);
        // console.log(originalMapping.sourceName);
        // console.log('generated start', sLoc.line, sLoc.column, 'original start', oSLoc.line, oSLoc.column);
        // console.log('generated end', eLoc.line, eLoc.column);

        // can NOT use file end

        return;
    }

    // crossed source ?
    if (oSLoc.source !== oELoc.source) {
        // console.log('ERROR: range crossed source file', range, oSLoc.source, oELoc.source);
        return;
    }

    const originalEnd = originalState.positionMapping.locationToOffset(oELoc);

    // range start greater than end
    if (originalEnd <= originalStart) {
        // console.log('--------------------------------------------------');
        // console.log({
        //     sourcePath,
        //     sLoc,
        //     eLoc,
        //     oSLoc,
        //     oELoc,
        //     originalStart,
        //     originalEnd
        // });

        return;
    }


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

    return res;
};

module.exports = {
    collectSourceMaps,
    getOriginalRange
};
