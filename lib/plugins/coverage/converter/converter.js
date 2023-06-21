// const fs = require('fs');
// const path = require('path');
const EC = require('eight-colors');
const { SourceMapConsumer } = require('source-map');

const { format, Mapping } = require('../../../runtime/monocart-formatter-node.js');
const PositionMapping = require('../v8/position-mapping.js');

const Util = require('../../../utils/util.js');

const { convertFunctionsToRanges, initSourceMapRootAndUrl } = require('../coverage-utils.js');
// const { unpackSourceMaps } = require('./v8/source-map.js');

const { saveIstanbulReport } = require('../istanbul/istanbul.js');

const InfoLine = require('./info-line.js');
const InfoBranch = require('./info-branch.js');
const InfoFunction = require('./info-function.js');

// SourceMapConsumer.GREATEST_LOWER_BOUND = 1;
// SourceMapConsumer.LEAST_UPPER_BOUND = 2;
const BIAS = {
    left: SourceMapConsumer.GREATEST_LOWER_BOUND,
    right: SourceMapConsumer.LEAST_UPPER_BOUND
};

// ========================================================================================================

const getSourceAndMapping = (source) => {
    // codemirror will replace all \r\n with \n, so end position will be mismatched
    // just replace all \r\n with \n
    const formattedContent = source.replace(Util.lineBreakPattern, '\n');

    const mapping = Mapping.generate(source, formattedContent);
    // console.log(mapping);

    return {
        content: formattedContent,
        mapping
    };
};

const formatSource = (source, type, formatting = true) => {

    // TODO DEBUG
    formatting = false;

    if (formatting) {
        return format(source, type);
    }

    // no formatting but replace all \r\n with \n
    return getSourceAndMapping(source);

};

// ========================================================================================================

// istanbul coverage format
/**
 * * `path` - the file path for which coverage is being tracked
 * * `statementMap` - map of statement locations keyed by statement index
 * * `fnMap` - map of function metadata keyed by function index
 * * `branchMap` - map of branch metadata keyed by branch index
 * * `s` - hit counts for statements
 * * `f` - hit count for functions
 * * `b` - hit count for branches
 */
const getFileCoverage = (sourcePath, inputData) => {

    const {
        lines, functions, branches
    } = inputData;

    const coverage = {
        path: sourcePath,

        statementMap: {},
        s: {},

        fnMap: {},
        f: {},

        branchMap: {},
        b: {}
    };

    lines.forEach((line, index) => {
        coverage.statementMap[`${index}`] = line.generate();
        coverage.s[`${index}`] = line.count;
    });

    functions.forEach((fn, index) => {
        coverage.fnMap[`${index}`] = fn.generate();
        coverage.f[`${index}`] = fn.count;
    });

    branches.forEach((branch, index) => {
        coverage.branchMap[`${index}`] = branch.generate();
        coverage.b[`${index}`] = [branch.count];
    });

    return coverage;
};

// ========================================================================================================

const setLineCount = (lineMap, line, count) => {
    const lineInfo = lineMap[line];
    if (lineInfo) {
        lineInfo.count = count;
    }
};

const setSingleLineCount = (lineMap, sLoc, eLoc, count) => {
    // nothing between
    if (sLoc.column >= eLoc.column) {
        return;
    }

    if (sLoc.column === sLoc.indent && eLoc.column === eLoc.length) {
        // console.log('single', sLoc.line);
        setLineCount(lineMap, sLoc.line, count);
    }

};

const updateLinesCount = (lineMap, sLoc, eLoc, count) => {

    // single line
    if (sLoc.line === eLoc.line) {
        setSingleLineCount(lineMap, sLoc, eLoc, count);
        return;
    }

    const firstELoc = {
        ... sLoc,
        column: sLoc.length
    };
    setSingleLineCount(lineMap, sLoc, firstELoc, count);

    for (let i = sLoc.line + 1; i < eLoc.line; i++) {
        setLineCount(lineMap, i, count);
    }

    const lastSLoc = {
        ... eLoc,
        column: eLoc.indent
    };
    setSingleLineCount(lineMap, lastSLoc, eLoc, count);


};

const initFileCoverage = (formatMapping) => {
    const {
        formattedLines, commentedLines, blankLines
    } = formatMapping;

    const lines = [];
    const functions = [];
    const branches = [];

    // add all lines
    const lineMap = {};
    formattedLines.forEach((it) => {
        // exclude comments and blanks
        if (commentedLines.includes(it.line) || blankLines.includes(it.line)) {
            return;
        }
        // line 1-base
        const lineInfo = new InfoLine(it.line + 1, it.length);
        lineMap[it.line] = lineInfo;
        lines.push(lineInfo);
    });

    return {
        lines, functions, branches, lineMap
    };
};

const convertFunctionsToCoverage = (item, state) => {

    const formatMapping = state.formatMapping;
    const coverage = initFileCoverage(formatMapping);

    const {
        functions, branches, lineMap
    } = coverage;

    item.functions.forEach((block) => {

        const {
            isBlockCoverage, functionName, ranges
        } = block;

        ranges.forEach((range, i) => {
            const {
                startOffset, endOffset, count
            } = range;

            const skipIndent = true;
            const sLoc = formatMapping.getFormattedLocation(startOffset, skipIndent);
            const eLoc = formatMapping.getFormattedLocation(endOffset, skipIndent);

            // line, column
            updateLinesCount(lineMap, sLoc, eLoc, count);

            if (isBlockCoverage) {
                branches.push(new InfoBranch(sLoc, eLoc, count));
                if (functionName && i === 0) {
                    functions.push(new InfoFunction(sLoc, eLoc, count, functionName));
                }
            } else if (functionName) {
                functions.push(new InfoFunction(sLoc, eLoc, count, functionName));
            }
        });
    });

    const sourcePath = item.sourcePath;
    state.coverageData[sourcePath] = getFileCoverage(sourcePath, coverage);

};

// ========================================================================================================

const unpackDistSource = (item, state, options) => {

    const { toIstanbul } = options;

    convertFunctionsToCoverage(item, state);

    if (!toIstanbul) {
        state.ranges = convertFunctionsToRanges(item.functions);
    }

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
    return findOriginalPosition(consumer, line, column, ['right', 'left']);
};

const findOriginalEndInRange = (consumer, generatedMapping, start, end) => {
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

const findOriginalEndPosition = (consumer, eLoc, generatedMapping, start, end) => {
    const { line, column } = eLoc;

    // before end column must be >= 0
    const currentColumn = Math.max(column - 1, 0);

    let ep = findOriginalPosition(consumer, line, currentColumn, ['left', 'right']);
    if (!ep) {
        ep = findOriginalEndInRange(consumer, generatedMapping, start, end);
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

const getOriginalRange = (consumer, startOffset, endOffset, generatedMapping, originalMap) => {

    // find start location
    const sLoc = generatedMapping.offsetToLocation(startOffset);
    const oSLoc = findOriginalStartPosition(consumer, sLoc);
    if (!oSLoc) {
        // not found start
        return;
    }

    // if source excluded
    const sourcePath = oSLoc.source;
    const state = originalMap.get(sourcePath);
    if (!state) {
        // possible this source has been filtered
        // console.log(`not found source: ${currentSource}`);
        return;
    }

    const { positionMapping } = state;

    const originalStart = positionMapping.locationToOffset(oSLoc);

    // find end location
    const eLoc = generatedMapping.offsetToLocation(endOffset);
    const oELoc = findOriginalEndPosition(consumer, eLoc, generatedMapping, startOffset, endOffset);
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

    const originalEnd = positionMapping.locationToOffset(oELoc);
    if (originalEnd < originalStart) {
        // range start greater than end
        return {
            sourcePath,
            originalStart: originalEnd,
            originalEnd: originalStart
        };
    }

    return {
        sourcePath,
        originalStart,
        originalEnd
    };
};

// ========================================================================================================

const initOriginalList = (consumer, options) => {

    // source filter
    let sourceList = consumer.sources;
    if (typeof options.sourceFilter === 'function') {
        sourceList = sourceList.filter((sourcePath) => {
            return options.sourceFilter(sourcePath);
        });
    }

    // create original content mappings
    const map = new Map();
    for (const sourcePath of sourceList) {
        // console.log(`add source: ${k}`);
        const sourceContent = consumer.sourceContentFor(sourcePath);
        if (typeof sourceContent !== 'string') {
            EC.logRed(`[MCR] not found source content: ${sourcePath}`);
            continue;
        }

        const { content, mapping } = getSourceAndMapping(sourceContent);

        const skipIndent = true;
        const formatMapping = new Mapping(content, mapping, skipIndent);

        const positionMapping = new PositionMapping(sourceContent);

        const coverage = initFileCoverage(formatMapping);

        const state = {
            sourcePath,
            formatMapping,
            positionMapping,
            coverage
        };

        map.set(sourcePath, state);
    }

    return map;
};


const unpackSourceMap = async (item, state, options) => {
    const sourceMap = item.sourceMap;
    const fileUrls = {};
    const fileSources = state.fileSources;
    initSourceMapRootAndUrl(sourceMap, fileUrls, fileSources, options.sourcePath);

    const generatedMapping = new PositionMapping(item.source);
    const consumer = await new SourceMapConsumer(sourceMap);
    const originalMap = initOriginalList(consumer, options);

    item.functions.forEach((block) => {

        const {
            isBlockCoverage, functionName, ranges
        } = block;

        ranges.forEach((range, i) => {

            const {
                startOffset, endOffset, count
            } = range;

            const originalInfo = getOriginalRange(consumer, startOffset, endOffset, generatedMapping, originalMap);
            if (!originalInfo) {
                return;
            }

            const {
                sourcePath, originalStart, originalEnd
            } = originalInfo;

            // mapping to original position

            const originalState = originalMap.get(sourcePath);
            if (!originalState) {
                return;
            }
            const formatMapping = originalState.formatMapping;
            const {
                functions, branches, lineMap
            } = originalState.coverage;

            const skipIndent = true;
            const sLoc = formatMapping.getFormattedLocation(originalStart, skipIndent);
            const eLoc = formatMapping.getFormattedLocation(originalEnd, skipIndent);

            // line, column
            updateLinesCount(lineMap, sLoc, eLoc, count);

            if (isBlockCoverage) {
                branches.push(new InfoBranch(sLoc, eLoc, count));
                if (functionName && i === 0) {
                    functions.push(new InfoFunction(sLoc, eLoc, count, functionName));
                }
            } else if (functionName) {
                functions.push(new InfoFunction(sLoc, eLoc, count, functionName));
            }

        });
    });

    consumer.destroy();

    // collect original coverages

    originalMap.forEach((originalState) => {
        const sourcePath = originalState.sourcePath;
        state.coverageData[sourcePath] = getFileCoverage(sourcePath, originalState.coverage);
    });

};

// ========================================================================================================

const unpackDistFile = async (item, state, options) => {

    if (item.sourceMap) {
        if (options.debug) {
            // js self
            unpackDistSource(item, state, options);
        } else {
            item.dedupe = true;
        }

        // unpack source map
        await unpackSourceMap(item, state, options);

    } else {

        // js self
        unpackDistSource(item, state, options);

    }

};

// ========================================================================================================

const dedupeV8List = (v8list) => {
    const indexes = [];
    v8list.forEach((item, i) => {
        if (item.dedupe) {
            indexes.push(i);
        }
    });
    if (indexes.length) {
        indexes.reverse();
        indexes.forEach((i) => {
            v8list.splice(i, 1);
        });
    }
};


const convertV8List = async (v8list, options) => {

    // TODO
    options.debug = true;

    // TODO not css for now
    const jsList = v8list.filter((it) => it.type === 'js');

    // global file sources and coverage data
    const fileSources = {};
    const coverageData = {};

    for (const item of jsList) {
        // console.log([item.id]);

        const {
            type, source, sourcePath
        } = item;

        // disableFormatting could be added in entryFilter
        const formatting = !item.disableFormatting;

        const { content, mapping } = await formatSource(source, type, formatting);

        // update global source
        fileSources[sourcePath] = content;

        // TODO
        // item.source = content;

        const parseLines = true;

        // current file and it's sources from sourceMap
        const state = {
            fileSources: {},
            coverageData: {},
            formatMapping: new Mapping(content, mapping, parseLines)
        };

        await unpackDistFile(item, state, options);

        // merge state
        Object.assign(fileSources, state.fileSources);
        Object.assign(coverageData, state.coverageData);

    }

    // dedupe
    dedupeV8List(v8list);

    // DEBUG
    await saveIstanbulReport(coverageData, fileSources, {
        title: options.title,
        lcov: true,
        htmlDir: `${options.htmlDir}-new`
    });

};

module.exports = {
    convertV8List
};
