const EC = require('eight-colors');

const { SourceMapConsumer } = require('source-map');

const PositionMapping = require('./position-mapping.js');
const { dedupeCountRanges } = require('./dedupe.js');
const { collectSourceMaps } = require('../coverage-utils.js');

const BIAS = {
    left: SourceMapConsumer.GREATEST_LOWER_BOUND,
    right: SourceMapConsumer.LEAST_UPPER_BOUND
};

// =========================================================================================================

const getOriginalPosition = (consumer, line, column, sides) => {
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

const getOriginalStartPosition = (consumer, line, column) => {
    return getOriginalPosition(consumer, line, column, ['right', 'left']);
};

const getOriginalEndPosition = (consumer, line, column) => {

    // before end column must be >= 0
    if (column > 0) {
        column -= 1;
    }

    const beforeEnd = getOriginalPosition(consumer, line, column, ['left', 'right']);
    if (!beforeEnd) {
        return;
    }

    const afterEndMapping = consumer.generatedPositionFor({
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

    const mapping = consumer.originalPositionFor(afterEndMapping);
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

const getOriginalFileStart = (consumer, sourceName, lines) => {
    const len = lines.length;
    for (let i = 0; i < len; i++) {
        const list = consumer.allGeneratedPositionsFor({
            source: sourceName,
            line: i + 1
        });
        if (list.length) {
            return list[0];
        }
    }
};

const getOriginalFileEnd = (consumer, sourceName, lines) => {
    const len = lines.length;
    for (let i = len - 1; i >= 0; i--) {
        const list = consumer.allGeneratedPositionsFor({
            source: sourceName,
            line: i + 1
        });
        if (list.length) {
            return list[list.length - 1];
        }
    }
};

const calculateOriginalFileRange = (generatedMapping, consumer, originalMapping) => {
    const { sourceName, lines } = originalMapping;

    // consumer.computeColumnSpans();

    const gs = getOriginalFileStart(consumer, sourceName, lines);
    const ge = getOriginalFileEnd(consumer, sourceName, lines);

    // console.log('file range', sourceName, sLoc, eLoc);

    if (!gs || !ge) {
        // console.log('failed to get file range', sourceName, sLoc, eLoc);
        return;
    }

    const generatedStart = generatedMapping.locationToOffset({
        line: gs.line,
        column: gs.column
    });
    const generatedEnd = generatedMapping.locationToOffset({
        line: ge.line,
        column: ge.column
    });

    const os = consumer.originalPositionFor({
        line: gs.line,
        column: gs.column
    });
    const oe = consumer.originalPositionFor({
        line: ge.line,
        column: ge.column
    });
    const originalStart = originalMapping.locationToOffset({
        line: os.line,
        column: os.column
    });
    const originalEnd = originalMapping.locationToOffset({
        line: oe.line,
        column: oe.column
    });

    const range = {
        generatedStart,
        generatedEnd,
        originalStart,
        originalEnd
    };

    if (generatedStart > generatedEnd) {
        range.generatedStart = generatedEnd;
        range.generatedEnd = generatedStart;
    }

    if (originalStart > originalEnd) {
        range.originalStart = originalEnd;
        range.originalEnd = originalStart;
    }

    originalMapping.range = range;

    // console.log('file range', sourceName, range);

    // EC.logCyan(JSON.stringify(generatedMapping.getSlice(range.start, range.end)));

};

const getOriginalMappings = (generatedMapping, consumer, options) => {

    // source filter
    let sourceList = consumer.sources;
    if (typeof options.sourceFilter === 'function') {
        sourceList = sourceList.filter((sourceName) => {
            return options.sourceFilter(sourceName);
        });
    }

    // create original content mappings
    const originalMappings = new Map();
    for (const sourceName of sourceList) {
        // console.log(`add source: ${k}`);
        const sourceContent = consumer.sourceContentFor(sourceName);
        if (typeof sourceContent !== 'string') {
            EC.logRed(`[MCR] not found source content: ${sourceName}`);
            continue;
        }

        const mapping = new PositionMapping(sourceContent, sourceName);
        calculateOriginalFileRange(generatedMapping, consumer, mapping);
        originalMappings.set(sourceName, mapping);
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

    const generatedMapping = new PositionMapping(item.source);
    const consumer = await new SourceMapConsumer(item.sourceMap);
    const originalMappings = getOriginalMappings(generatedMapping, consumer, options);

    // generated ranges to original ranges
    item.ranges.forEach((range) => {
        const sLoc = generatedMapping.offsetToLocation(range.start);
        const oSLoc = getOriginalStartPosition(consumer, sLoc.line, sLoc.column);
        if (!oSLoc) {
            return;
        }

        const currentSource = oSLoc.source;
        const originalMapping = originalMappings.get(currentSource);
        if (!originalMapping) {
            // possible this source has been filtered
            // console.log(`not found source: ${currentSource}`);
            return;
        }

        const originalStart = originalMapping.locationToOffset(oSLoc);

        const eLoc = generatedMapping.offsetToLocation(range.end);
        const oELoc = getOriginalEndPosition(consumer, eLoc.line, eLoc.column);

        if (!oELoc) {

            // console.log('not found end', originalMapping.sourceName, eLoc);

            // to original end
            const originalEnd = originalMapping.range.originalEnd;
            addOriginalRange(originalMapping, originalStart, originalEnd, range.count);

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

        const ranges = dedupeCountRanges(originalMapping.ranges);

        v8list.push({
            url: currentSource,
            type: item.type,
            distFile: item.sourceMap.file,
            ranges,
            source: originalMapping.source
        });

    });
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

    if (options.excludeDistFile) {
        indexes.reverse();
        indexes.forEach((i) => {
            v8list.splice(i, 1);
        });
    }

    return sourceMapList;
};

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
        await unpackJsSourceMap(item, v8list, options);
    }
};


module.exports = {
    unpackSourceMaps
};
