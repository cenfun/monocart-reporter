const EC = require('eight-colors');
const { traceMapping } = require('../../../runtime/monocart-coverage.js');

const PositionMapping = require('./position-mapping.js');
const { dedupeCountRanges } = require('./dedupe.js');
const { collectSourceMaps } = require('../coverage-utils.js');

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


const filterSourceMapList = (v8list, options) => {
    const sourceMapList = [];
    const positions = [];

    v8list.forEach((item, i) => {
        const sourceMap = item.sourceMap;
        if (!sourceMap) {
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

const addOriginalRange = (originalMapping, start, end, count) => {
    originalMapping.ranges.push({
        start,
        end,
        count
    });
};


const addOriginalFileRange = (range, originalMappings) => {
    // TODO
    // const { startOffset, endOffset } = range;
};

const getOriginalMappings = (generatedTracer, generatedMapping, options) => {

    // source filter
    let sourceList = generatedTracer.resolvedSources;
    if (typeof options.sourceFilter === 'function') {
        sourceList = sourceList.filter((sourceName) => {
            return options.sourceFilter(sourceName);
        });
    }

    // create original content mappings
    const originalMappings = new Map();
    for (const sourceName of sourceList) {
        // console.log(`add source: ${k}`);
        const content = sourceContentFor(generatedTracer, sourceName);
        if (typeof content !== 'string') {
            EC.logRed(`[MCR] not found source content: ${sourceName}`);
            continue;
        }
        const mapping = new PositionMapping(content);
        originalMappings.set(sourceName, mapping);
    }

    // add all original source mappings
    eachMapping(generatedTracer, (m) => {
        // only filtered sources
        const originalMapping = originalMappings.get(m.source);
        if (originalMapping) {
            // generated order
            originalMapping.addMapping(m);
        }
    });

    // calculate source file start and end
    originalMappings.forEach((mapping) => {
        mapping.calculateFileRange(generatedMapping);
    });

    return originalMappings;
};


const unpackJsSourceMap = async (item, v8list, options) => {

    const generatedMapping = new PositionMapping(item.source);
    const generatedTracer = await new TraceMap(item.sourceMap);
    const originalMappings = getOriginalMappings(generatedTracer, generatedMapping, options);

    // generated ranges to original ranges
    item.ranges.forEach((range) => {
        const sLoc = generatedMapping.offsetToLocation(range.start);
        const oSLoc = getOriginalStartPosition(generatedTracer, sLoc.line, sLoc.column);
        if (!oSLoc) {
            addOriginalFileRange(range, originalMappings);
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

        const eLoc = generatedMapping.offsetToLocation(range.end);
        const oELoc = getOriginalEndPosition(generatedTracer, eLoc.line, eLoc.column);

        if (!oELoc) {

            // out of the file
            const originalMaxEnd = originalMapping.source.length;
            addOriginalRange(originalMapping, originalStart, originalMaxEnd, range.count);

            return;
        }

        if (oSLoc.source !== oELoc.source) {
            EC.logRed('ERROR: range crossed source file', range, oSLoc.source, oELoc.source);
            return;
        }

        const originalEnd = originalMapping.locationToOffset(oELoc);
        if (originalEnd < originalStart) {
            EC.logRed('ERROR: range start greater than end', range, originalStart, originalEnd);
            return;
        }

        addOriginalRange(originalMapping, originalStart, originalEnd, range.count);

    });

    // collect new v8list
    originalMappings.forEach((originalMapping, currentSource) => {

        // TODO dedupe ranges, not css ranges, requires handle count

        v8list.push({
            url: currentSource,
            type: item.type,
            distFile: item.sourceMap.file,
            ranges: dedupeCountRanges(originalMapping.ranges),
            source: originalMapping.source
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
