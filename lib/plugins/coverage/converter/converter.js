const path = require('path');

const Util = require('../../../utils/util.js');
const decodeMappings = require('../../../utils/decode-mappings.js');

// position mapping for conversion between offset and line/column
const PositionMapping = require('./position-mapping.js');
const findOriginalRange = require('./find-original-range.js');

const { dedupeCountRanges } = require('./dedupe.js');
const { getSourceType, initSourceMapSourcePath } = require('./source-path.js');

const InfoLine = require('./info-line.js');
const InfoBranch = require('./info-branch.js');
const InfoFunction = require('./info-function.js');

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
        lines, functions, branches, ranges
    } = inputData;

    // v8 ranges
    inputData.ranges = dedupeCountRanges(ranges);

    // istanbul coverage
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

    // sometimes column > length
    if (sLoc.column <= sLoc.indent && eLoc.column >= eLoc.length) {
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

const initFileCoverage = (positionMapping, count) => {

    // istanbul
    const lines = [];
    const functions = [];
    const branches = [];
    // v8
    const ranges = [];

    // add all lines
    const lineMap = {};

    const { commentedLines, blankLines } = positionMapping;
    positionMapping.lines.forEach((it) => {
        // exclude comments and blanks
        if (commentedLines.includes(it.line) || blankLines.includes(it.line)) {
            return;
        }
        // line 1-base
        const line = it.line + 1;
        const lineInfo = new InfoLine(line, it.length, count);
        lineMap[line] = lineInfo;
        lines.push(lineInfo);
    });

    return {
        lines, functions, branches, ranges, lineMap
    };
};


// https://github.com/demurgos/v8-coverage
/**
 * @ranges is always non-empty. The first range is called the "root range".
 * @isBlockCoverage indicates if the function has block coverage information
 *   @false means that there is a single range and its count is the number of times the function was called.
 *   @true means that the ranges form a tree of blocks representing how many times each statement or expression inside was executed.
 *        It detects skipped or repeated statements. The root range counts the number of function calls.
 *
 * @functionName can be an empty string. This is common for the FunctionCov representing the whole module.
 */
const addJsCoverage = (coverage, block, range, index, positionMapping) => {

    const {
        functions, branches, ranges, lineMap
    } = coverage;

    const { isBlockCoverage, functionName } = block;
    const {
        startOffset, endOffset, count
    } = range;

    ranges.push({
        start: startOffset,
        end: endOffset,
        count
    });

    const sLoc = positionMapping.offsetToLocation(startOffset);
    const eLoc = positionMapping.offsetToLocation(endOffset);

    // line, column
    updateLinesCount(lineMap, sLoc, eLoc, count);

    if (isBlockCoverage) {
        if (index === 0) {
            // The root range counts the number of function calls
            functions.push(new InfoFunction(sLoc, eLoc, count, functionName));
        }

        // index 0 not really a branch, but for covered whole function
        branches.push(new InfoBranch(sLoc, eLoc, count));

    } else {
        functions.push(new InfoFunction(sLoc, eLoc, count, functionName));

        // possible have branches in the function but no information for it

    }
};

const addCssCoverage = (coverage, range, positionMapping) => {
    const { lineMap } = coverage;

    const { start, end } = range;

    const sLoc = positionMapping.offsetToLocation(start);
    const eLoc = positionMapping.offsetToLocation(end);

    // line, column
    updateLinesCount(lineMap, sLoc, eLoc, 1);

};

// ========================================================================================================

const getDistCoverage = (item, state) => {
    const positionMapping = state.positionMapping;
    if (item.type === 'js') {
        const coverage = initFileCoverage(positionMapping, 1);
        item.functions.forEach((block) => {
            block.ranges.forEach((range, index) => {
                addJsCoverage(coverage, block, range, index, positionMapping);
            });
        });
        return coverage;
    }

    const coverage = initFileCoverage(positionMapping, 0);
    item.ranges.forEach((range) => {
        addCssCoverage(coverage, range, positionMapping);
    });
    return coverage;
};

const unpackDistSource = (item, state) => {
    const coverage = getDistCoverage(item, state);
    const sourcePath = item.sourcePath;
    state.coverageData[sourcePath] = getFileCoverage(sourcePath, coverage);
    // after dedupe
    item.ranges = coverage.ranges;
};

// ========================================================================================================

const decodeSourceMappings = async (sourceMap, generatedPositionMapping) => {

    const decodedList = await decodeMappings(sourceMap.mappings);

    const originalIndexMap = new Map();
    sourceMap.sources.forEach((item, i) => {
        originalIndexMap.set(i, []);
    });

    const allDecodedMappings = [];
    let generatedIndex = 0;
    decodedList.forEach((segments, generatedLine) => {
        let item = null;
        segments.forEach((segment) => {
            const [generatedColumn, sourceIndex, originalLine, originalColumn] = segment;
            const generatedOffset = generatedPositionMapping.locationToOffset({
                // 1-base
                line: generatedLine + 1,
                column: generatedColumn
            });

            item = {
                generatedOffset,
                generatedLine,
                generatedColumn,
                generatedIndex,

                sourceIndex,
                originalLine,
                originalColumn
            };

            allDecodedMappings.push(item);
            generatedIndex += 1;

            if (typeof sourceIndex === 'undefined') {
                return;
            }

            originalIndexMap.get(sourceIndex).push(item);

        });

        // line last one
        if (item) {
            const line = generatedPositionMapping.getLine(item.generatedLine + 1);
            // last column
            item.generatedEndOffset = item.generatedOffset + (line.length - item.generatedColumn);
        }

    });

    // defaults to sort by generated offset, not need sort
    // allDecodedMappings.sort((a, b) => {
    //     return a.generatedOffset - b.generatedOffset;
    // });

    return {
        allDecodedMappings,
        originalIndexMap
    };

};

const getOriginalDecodedMappings = (originalIndexMap, sourceIndex, positionMapping) => {
    // all mappings for the original file sorted
    const decodedMappings = originalIndexMap.get(sourceIndex);

    if (!decodeMappings) {
        return [];
    }

    // sort by original line/column
    decodedMappings.sort((a, b) => {
        if (a.originalLine === b.originalLine) {
            return a.originalColumn - b.originalColumn;
        }
        return a.originalLine - b.originalLine;
    });

    // add offset and index
    decodedMappings.forEach((item, i) => {
        item.originalIndex = i;
        item.originalOffset = positionMapping.locationToOffset({
            line: item.originalLine + 1,
            column: item.originalColumn
        });
    });

    return decodedMappings;
};

const initOriginalList = (sourceMap, originalIndexMap, fileSources, options) => {

    // source filter
    const { sources, sourcesContent } = sourceMap;

    let sourceFilter = options.sourceFilter;
    if (typeof sourceFilter !== 'function') {
        sourceFilter = () => true;
    }

    // create original content mappings
    const map = new Map();

    sources.forEach((sourcePath, sourceIndex) => {

        // filter
        if (!sourceFilter(sourcePath)) {
            return;
        }

        // console.log(`add source: ${k}`);
        const sourceContent = sourcesContent[sourceIndex];
        if (typeof sourceContent !== 'string') {
            Util.logError(`not found source content: ${sourcePath}`);
            return;
        }

        // keep original formatted content
        fileSources[sourcePath] = sourceContent;

        const positionMapping = new PositionMapping(sourceContent);

        const decodedMappings = getOriginalDecodedMappings(originalIndexMap, sourceIndex, positionMapping);

        const coverage = initFileCoverage(positionMapping, 1);

        const type = getSourceType(sourcePath);

        const originalState = {
            source: sourceContent,
            type,
            sourcePath,
            positionMapping,
            decodedMappings,
            coverage
        };

        map.set(sourceIndex, originalState);
    });

    return map;
};

const unpackSourceMap = async (item, state, options) => {
    const sourceMap = item.sourceMap;
    const generatedPositionMapping = state.positionMapping;
    const distFile = sourceMap.file || path.basename(item.sourcePath);

    // keep original urls
    const fileUrls = {};
    initSourceMapSourcePath(sourceMap, fileUrls, options.sourcePath);

    // decode mappings for each original file
    const time_start_decode = Date.now();
    const { allDecodedMappings, originalIndexMap } = await decodeSourceMappings(sourceMap, generatedPositionMapping);
    // only debug level
    Util.logTime(`decode source mappings ${distFile}`, time_start_decode);

    // filter original list and init list
    const fileSources = state.fileSources;
    const originalMap = initOriginalList(sourceMap, originalIndexMap, fileSources, options);

    originalIndexMap.clear();

    const generatedState = {
        decodedMappings: allDecodedMappings,
        positionMapping: generatedPositionMapping
    };

    // const time_start_mapping = Date.now();
    item.functions.forEach((block) => {
        block.ranges.forEach((range, index) => {

            const result = findOriginalRange(range, generatedState, originalMap);
            if (!result) {
                return;
            }

            const { originalRange, originalState } = result;
            const { coverage, positionMapping } = originalState;
            addJsCoverage(coverage, block, originalRange, index, positionMapping);

        });
    });

    // collect original files
    const sourceList = [];
    originalMap.forEach((originalState) => {
        const {
            source, type, sourcePath, coverage
        } = originalState;

        // generate coverage
        state.coverageData[sourcePath] = getFileCoverage(sourcePath, coverage);
        const ranges = coverage.ranges;

        // add file item
        const url = fileUrls[sourcePath] || sourcePath;
        const id = Util.calculateSha1(url + source);

        const sourceItem = {
            url,
            id,
            type,
            sourcePath,
            distFile,
            ranges,
            source
        };

        sourceList.push(sourceItem);
    });

    state.sourceList = sourceList;

};

// ========================================================================================================

const unpackDistFile = async (item, state, options) => {

    if (item.sourceMap) {
        if (Util.loggingType === 'debug') {
            // js self
            unpackDistSource(item, state, options);
        } else {
            item.dedupe = true;
        }

        // unpack source map
        await unpackSourceMap(item, state, options);

        // remove sourceMap
        delete item.sourceMap;

    } else {

        // css/js self
        unpackDistSource(item, state, options);

    }

    // clean after all
    delete item.functions;

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

    // global file sources and coverage data
    const fileSources = {};
    const coverageData = {};
    let sourceList = [];

    for (const item of v8list) {
        // console.log([item.id]);

        const { source, sourcePath } = item;

        const positionMapping = new PositionMapping(source);

        // append file source
        fileSources[sourcePath] = source;

        // current file and it's sources from sourceMap
        const state = {
            fileSources: {},
            coverageData: {},
            positionMapping
        };

        await unpackDistFile(item, state, options);

        // merge state
        Object.assign(fileSources, state.fileSources);
        Object.assign(coverageData, state.coverageData);
        if (state.sourceList) {
            sourceList = sourceList.concat(state.sourceList);
        }

    }

    // dedupe
    dedupeV8List(v8list);

    // add all sources
    if (sourceList.length) {
        sourceList.forEach((item) => {
            v8list.push(item);
        });
    }

    return {
        fileSources,
        coverageData
    };

};

module.exports = {
    convertV8List
};
