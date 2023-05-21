const EC = require('eight-colors');
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
    eachMapping,
    GREATEST_LOWER_BOUND,
    LEAST_UPPER_BOUND
} = traceMapping;
// } = require('@jridgewell/trace-mapping');

const BIAS = {
    left: GREATEST_LOWER_BOUND,
    right: LEAST_UPPER_BOUND
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

const getOriginalPosition = (tracer, line, column, sides) => {
    let original;
    for (const side of sides) {
        original = originalPositionFor(tracer, {
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

const getOriginalStartPosition = (tracer, line, column) => {
    return getOriginalPosition(tracer, line, column, ['right', 'left']);
};

const getOriginalEndPosition = (tracer, line, column) => {

    // before end column must be >= 0
    if (column > 0) {
        column -= 1;
    }

    const beforeEnd = getOriginalPosition(tracer, line, column, ['left', 'right']);
    if (!beforeEnd) {
        return;
    }

    const afterEndMapping = generatedPositionFor(tracer, {
        source: beforeEnd.source,
        line: beforeEnd.line,
        column: beforeEnd.column + 1,
        bias: BIAS.right
    });

    if (afterEndMapping.line === null) {
        return {
            source: beforeEnd.source,
            line: beforeEnd.line,
            column: Infinity
        };
    }

    const mapping = originalPositionFor(tracer, afterEndMapping);
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

    const generatedMapping = new PositionMapping(item.source);

    const generatedTracer = await new TraceMap(item.sourceMap);
    // content mapping
    const originalMappings = new Map();

    let sourceList = generatedTracer.resolvedSources;
    if (typeof options.sourceFilter === 'function') {
        sourceList = sourceList.filter((sourceName) => {
            return options.sourceFilter(sourceName);
        });
    }

    for (const sourceName of sourceList) {
        // console.log(`add source: ${k}`);
        const content = sourceContentFor(generatedTracer, sourceName);
        if (!content) {
            EC.logRed(`[MCR] not found source content: ${sourceName}`);
            continue;
        }
        const mapping = new PositionMapping(content);
        originalMappings.set(sourceName, mapping);
    }

    return {
        generatedMapping,
        generatedTracer,
        originalMappings
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


const addFileRange = (originalMappings, range) => {
    // TODO
    // const { startOffset, endOffset } = range;
};

const unpackJsSourceMap = async (item, v8list, options) => {
    // sourceMap, source, functions
    // console.log(item.url, item.sourceMapUrl);
    // console.log('source length and lines', item.source.length, generatedMapping.lines.length);

    const {
        generatedMapping,
        generatedTracer,
        originalMappings
    } = await initSourceMapping(item, options);

    eachMapping(generatedTracer, (m) => {
        // only filtered sources
        const originalMapping = originalMappings.get(m.source);
        if (originalMapping) {
            // generated order
            originalMapping.addMapping(m);
        }
    });
    // calculate source start and end
    originalMappings.forEach((mapping) => {
        mapping.calculateFileRange(generatedMapping);
    });


    item.functions.forEach((block) => {

        const currentBlockMap = {};

        block.ranges.forEach((range) => {
            const { startOffset, endOffset } = range;
            const sLoc = generatedMapping.offsetToLocation(startOffset);
            const oSLoc = getOriginalStartPosition(generatedTracer, sLoc.line, sLoc.column);
            if (!oSLoc) {
                addFileRange(originalMappings, range);
                return;
            }

            const currentSource = oSLoc.source;
            const originalMapping = originalMappings.get(currentSource);
            if (!originalMapping) {
                // possible filtered
                // console.log(`not found source: ${currentSource}`);
                return;
            }

            const originalStart = originalMapping.locationToOffset(oSLoc);

            const eLoc = generatedMapping.offsetToLocation(endOffset);
            const oELoc = getOriginalEndPosition(generatedTracer, eLoc.line, eLoc.column);

            if (!oELoc) {

                // out of the file
                const originalMaxEnd = originalMapping.source.length;
                addJsRange(currentBlockMap, currentSource, block, range, originalStart, originalMaxEnd);

                return;
            }

            if (oSLoc.source !== oELoc.source) {
                EC.logRed('range crossed source file', range, oSLoc.source, oELoc.source);
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

    //
    // rangeList.forEach((range) => {
    //     if (range.count > 0) {
    //         console.log('not found start location', range);
    //         EC.logCyan(item.source.slice(range.startOffset, range.endOffset));
    //     }
    // });

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

    // console.log(v8list.map((it) => it.url).join(', '));

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
