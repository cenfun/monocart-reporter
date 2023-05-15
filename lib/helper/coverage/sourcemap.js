
const {
    convertSourceMap, traceMapping, axios
} = require('../../runtime/monocart-coverage.js');

const Concurrency = require('../../platform/concurrency.js');
const PositionMapping = require('./position-mapping.js');

const Util = require('../../utils/util.js');

const {
    TraceMap,
    originalPositionFor,
    generatedPositionFor,
    sourceContentFor,
    GREATEST_LOWER_BOUND, LEAST_UPPER_BOUND
} = traceMapping;

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

const getSourcemapUrl = (content, url) => {

    const m = content.match(convertSourceMap.mapFileCommentRegex);
    if (!m) {
        return;
    }

    const comment = m.pop();
    const r = convertSourceMap.mapFileCommentRegex.exec(comment);
    // for some odd reason //# .. captures in 1 and /* .. */ in 2
    const filename = r[1] || r[2];

    const mapUrl = new URL(filename, Util.getUrl(url));

    return mapUrl.toString();
};


const collectSourcemaps = async (v8list) => {
    const concurrency = new Concurrency();
    for (const item of v8list) {
        const source = item.source;
        const converter = convertSourceMap.fromSource(source);
        if (converter) {
            item.sourceMap = converter.sourcemap;
            continue;
        }
        const sourceMapUrl = getSourcemapUrl(source, item.url);
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
            item.sourceMap = res.data;
        }
    });
};

const filterSourcemaps = (v8list) => {
    const sourcemaps = [];
    const positions = [];

    v8list.forEach((item, i) => {
        const sourceMap = item.sourceMap;
        if (!sourceMap) {
            return;
        }

        const { sources, sourcesContent } = sourceMap;
        if (!sources || !sourcesContent) {
            return;
        }

        const withSourceMap = {

            type: item.type,

            // https://playwright.dev/docs/api/class-coverage
            url: item.url,
            source: item.source,
            // js: url, scriptId, source, functions
            functions: item.functions,
            // css: url, text, ranges
            ranges: item.ranges,

            sourceMapUrl: item.sourceMapUrl,
            sourceMap
        };

        sourcemaps.push(withSourceMap);

        positions.push(i);

    });

    if (!sourcemaps.length) {
        return;
    }

    positions.sort((a, b) => b - a);
    positions.forEach((i) => {
        v8list.splice(i, 1);
    });

    return sourcemaps;
};

// =========================================================================================================

const getOriginalPosition = (sourceMap, line, column, sides) => {
    const bias = {
        left: GREATEST_LOWER_BOUND,
        right: LEAST_UPPER_BOUND
    };
    let original;
    for (const side of sides) {
        original = originalPositionFor(sourceMap, {
            line,
            column,
            bias: bias[side]
        });
        if (original.source !== null) {
            break;
        }
    }
    if (original && original.source !== null) {
        return original;
    }
};

const getOriginalStartPosition = (sourceMap, line, column) => {
    return getOriginalPosition(sourceMap, line, column, ['right', 'left']);
};

const getOriginalEndPosition = (sourceMap, line, column) => {

    // before end column
    column -= 1;

    const beforeEnd = getOriginalPosition(sourceMap, line, column, ['left', 'right']);
    if (!beforeEnd) {
        return;
    }

    const afterEndMapping = generatedPositionFor(sourceMap, {
        source: beforeEnd.source,
        line: beforeEnd.line,
        column: beforeEnd.column + 1,
        bias: LEAST_UPPER_BOUND
    });

    if (afterEndMapping.line === null) {
        return {
            source: beforeEnd.source,
            line: beforeEnd.line,
            column: Infinity
        };
    }

    const mapping = originalPositionFor(sourceMap, afterEndMapping);
    if (mapping.line !== beforeEnd.line) {
        return {
            source: beforeEnd.source,
            line: beforeEnd.line,
            column: Infinity
        };
    }

    return mapping;
};

// =========================================================================================================

const unpackCssSourcemap = async (item, v8list, options) => {

};

// =========================================================================================================

const addRange = (currentBlockMap, currentSource, block, range, originalStart, originalEnd) => {

    let currentBlock = currentBlockMap[currentSource];
    if (!currentBlock) {
        currentBlock = {
            ... block,
            ranges: []
        };
        currentBlockMap[currentSource] = currentBlock;
    }

    currentBlock.ranges.push({
        ... range,
        startOffset: originalStart,
        endOffset: originalEnd
    });
};

const addBlock = (currentBlockMap, originalMappings) => {
    Object.keys(currentBlockMap).forEach((currentSource) => {
        const currentBlock = currentBlockMap[currentSource];
        const originalMapping = originalMappings.get(currentSource);
        originalMapping.functions.push(currentBlock);
    });
};

// keep functions for istanbul
const dedupeRanges = (functions) => {

    // { startOffset: 0, endOffset: 6, count: 0 },
    // { startOffset: 0, endOffset: 6, count: 0 },
    // { startOffset: 0, endOffset: 6, count: 1 },
    // { startOffset: 0, endOffset: 297, count: 1 }

    // already sort by startOffset, endOffset, count
    const flatRanges = Util.getFlatRanges(functions);

    if (flatRanges.length < 2) {
        return functions;
    }

    flatRanges.reduce((lastRange, range) => {
        if (range.startOffset === lastRange.startOffset && range.endOffset === lastRange.endOffset) {
            range.dedupe = true;
            lastRange.count += range.count;
            return lastRange;
        }
        return range;
    });

    // remove dedupe from last to first
    const fIndexes = [];
    functions.forEach((f, i) => {
        const rIndexes = [];
        const ranges = f.ranges;
        ranges.forEach((r, j) => {
            if (r.dedupe) {
                rIndexes.push(j);
            }
        });

        if (rIndexes.length === ranges.length) {
            fIndexes.push(i);
        } else {
            rIndexes.reverse();
            rIndexes.forEach((index) => {
                ranges.splice(index, 1);
            });
        }
    });
    fIndexes.reverse();
    fIndexes.forEach((index) => {
        functions.splice(index, 1);
    });

    return functions;
};

const unpackJsSourcemap = async (item, v8list, options) => {
    // sourceMap, source, functions
    // console.log(item.url, item.sourceMapUrl);

    const tracer = await new TraceMap(item.sourceMap);

    // content mapping
    const originalMappings = new Map();

    let sourceList = tracer.resolvedSources;
    if (typeof options.sourceFilter === 'function') {
        sourceList = sourceList.filter((k) => {
            return options.sourceFilter(k);
        });
    }
    sourceList.forEach((k, i) => {
        // console.log(`add source: ${k}`);
        const content = sourceContentFor(tracer, k);
        if (content) {
            originalMappings.set(k, new PositionMapping(content));
        }
    });

    const generatedMapping = new PositionMapping(item.source);

    // console.log('source length and lines', item.source.length, generatedMapping.lines.length);


    item.functions.forEach((block) => {

        const currentBlockMap = {};

        block.ranges.forEach((range) => {
            const { startOffset, endOffset } = range;
            const sLoc = generatedMapping.offsetToLocation(startOffset);
            const oSLoc = getOriginalStartPosition(tracer, sLoc.line, sLoc.column);
            if (!oSLoc) {
                return;
            }

            const currentSource = oSLoc.source;
            const originalMapping = originalMappings.get(currentSource);
            if (!originalMapping) {
                // console.log(`not found source: ${currentSource}`);
                return;
            }

            const originalStart = originalMapping.locationToOffset(oSLoc);

            const eLoc = generatedMapping.offsetToLocation(endOffset);
            const oELoc = getOriginalEndPosition(tracer, eLoc.line, eLoc.column);

            // if (currentSource.endsWith('const.js')) {
            //     console.log('---------------------------------------------');
            //     console.log(currentSource, `(lines: ${originalMapping.lines.length} length: ${originalMapping.source.length})`);
            //     console.log('start', range);
            //     console.log(sLoc, eLoc);
            //     console.log(oSLoc, oELoc);
            //     console.log('---------------------------------------------');
            // }

            if (!oELoc) {

                // out of the file
                const originalMaxEnd = originalMapping.source.length;
                addRange(currentBlockMap, currentSource, block, range, originalStart, originalMaxEnd);

                return;
            }

            if (oSLoc.source !== oELoc.source) {
                return;
            }

            const originalEnd = originalMapping.locationToOffset(oELoc);
            if (originalEnd <= originalStart) {
                return;
            }

            addRange(currentBlockMap, currentSource, block, range, originalStart, originalEnd);

        });

        addBlock(currentBlockMap, originalMappings);

    });

    // collect new v8list
    // url, scriptId, source, functions } ]
    originalMappings.forEach((originalMapping, currentSource) => {

        const functions = dedupeRanges(originalMapping.functions);
        // console.log(functions);

        // if (currentSource.endsWith('const.js')) {
        //     console.log('//////////////////////////////////////////////////');
        //     originalMapping.functions.forEach((f) => {
        //         console.log(f);
        //     });
        //     console.log('///////////////////////');
        //     functions.forEach((f) => {
        //         console.log(f);
        //     });
        //     console.log('//////////////////////////////////////////////////');
        // }

        // from source map parent
        const parent = item.sourceMap.file || item.filename;

        v8list.push({
            url: currentSource,
            scriptId: v8list.length,
            parent,
            source: originalMapping.source,
            functions
        });

    });
};

// =========================================================================================================

const unpackSourcemaps = async (v8list, options) => {

    if (!options.sourceMap) {
        return;
    }

    await collectSourcemaps(v8list);

    const sourcemaps = filterSourcemaps(v8list);
    if (!sourcemaps) {
        // nothing to unpack
        return;
    }
    // console.log(sourcemaps);
    for (const item of sourcemaps) {
        if (item.type === 'css') {
            await unpackCssSourcemap(item, v8list, options);
        } else {
            await unpackJsSourcemap(item, v8list, options);
        }
    }
};


module.exports = {
    unpackSourcemaps
};
