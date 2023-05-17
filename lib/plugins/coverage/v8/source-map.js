const {
    convertSourceMap, traceMapping, axios
} = require('../../../runtime/monocart-coverage.js');

const Concurrency = require('../../../platform/concurrency.js');
const PositionMapping = require('./position-mapping.js');
const { dedupeFunctions } = require('./dedupe.js');

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
            item.sourceMap = converter.sourcemap;
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
            item.sourceMap = res.data;
        }
    });
};

const filterSourceMapList = (v8list, options) => {
    const sourceMapList = [];
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
        sourceMapList.push(item);
        positions.push(i);
    });

    if (!sourceMapList.length) {
        return;
    }

    if (options.excludeDistFile) {
        positions.sort((a, b) => b - a);
        positions.forEach((i) => {
            v8list.splice(i, 1);
        });
    }

    return sourceMapList;
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

    // before end column must be >= 0
    if (column > 0) {
        column -= 1;
    }

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
const initSourceMapping = async (item, options) => {
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

    return {
        tracer,
        originalMappings,
        generatedMapping
    };
};

// =========================================================================================================

const addJsRange = (currentBlockMap, currentSource, block, range, originalStart, originalEnd) => {

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

const addJsFunction = (currentBlockMap, originalMappings) => {
    Object.keys(currentBlockMap).forEach((currentSource) => {
        const currentBlock = currentBlockMap[currentSource];
        const originalMapping = originalMappings.get(currentSource);
        originalMapping.list.push(currentBlock);
    });
};


const unpackJsSourceMap = async (item, v8list, options) => {
    // sourceMap, source, functions
    // console.log(item.url, item.sourceMapUrl);
    // console.log('source length and lines', item.source.length, generatedMapping.lines.length);

    const {
        tracer,
        originalMappings,
        generatedMapping
    } = await initSourceMapping(item, options);

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
                addJsRange(currentBlockMap, currentSource, block, range, originalStart, originalMaxEnd);

                return;
            }

            if (oSLoc.source !== oELoc.source) {
                return;
            }

            const originalEnd = originalMapping.locationToOffset(oELoc);
            if (originalEnd <= originalStart) {
                return;
            }

            addJsRange(currentBlockMap, currentSource, block, range, originalStart, originalEnd);

        });

        addJsFunction(currentBlockMap, originalMappings);

    });

    // collect new v8list
    // url, scriptId, source, functions } ]
    originalMappings.forEach((originalMapping, currentSource) => {

        const functions = dedupeFunctions(originalMapping.list);
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
        const distFile = item.sourceMap.file || item.filename;

        v8list.push({
            url: currentSource,
            type: item.type,
            distFile,
            source: originalMapping.source,
            functions
        });

    });
};

// =========================================================================================================

const unpackSourceMaps = async (v8list, options) => {

    if (!options.unpackSourceMap) {
        return;
    }

    await collectSourceMaps(v8list);

    const sourceMapList = filterSourceMapList(v8list, options);
    if (!sourceMapList) {
        // nothing to unpack
        return;
    }

    // console.log(sourceMapList);

    // only js
    for (const item of sourceMapList) {

        // console.log('------------------------------------------------------');
        // console.log(item.type, item.url);
        // console.log(Object.keys(item));

        await unpackJsSourceMap(item, v8list, options);

    }
};


module.exports = {
    unpackSourceMaps
};
