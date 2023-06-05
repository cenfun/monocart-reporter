const EC = require('eight-colors');

const { SourceMapConsumer } = require('source-map');

const PositionMapping = require('./position-mapping.js');
const { dedupeCountRanges } = require('./dedupe.js');
const {
    getSourcePath, mergeSourceRoot, collectSourceMaps
} = require('../coverage-utils.js');

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

    const sourceMap = item.sourceMap;

    // reset sourceRoot
    const sourceRoot = sourceMap.sourceRoot || '';
    sourceMap.sourceRoot = '';

    const urlMap = {};
    sourceMap.sources = sourceMap.sources.map((sourceName, i) => {
        const sourceUrl = mergeSourceRoot(sourceRoot, sourceName);
        const newSourceName = getSourcePath(sourceUrl, i + 1);
        urlMap[newSourceName] = sourceUrl;
        return newSourceName;
    });

    const generatedMapping = new PositionMapping(item.source);
    const consumer = await new SourceMapConsumer(sourceMap);
    const originalMappings = getOriginalMappings(generatedMapping, consumer, options);

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

        const url = urlMap[currentSource] || currentSource;
        const ranges = dedupeCountRanges(originalMapping.ranges);

        //  console.log('add source url', url);

        v8list.push({
            url,
            type: item.type,
            sourcePath: currentSource,
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
