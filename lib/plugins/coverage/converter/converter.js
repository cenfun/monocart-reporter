const path = require('path');
const EC = require('eight-colors');
const { SourceMapConsumer } = require('source-map');

const Util = require('../../../utils/util.js');

const { format, Mapping } = require('../../../runtime/monocart-formatter-node.js');
const PositionMapping = require('./position-mapping.js');

const { dedupeCountRanges } = require('./dedupe.js');
const { getOriginalRange } = require('./source-map.js');
const { initSourceMapSourcePath } = require('./source-path.js');

const InfoLine = require('./info-line.js');
const InfoBranch = require('./info-branch.js');
const InfoFunction = require('./info-function.js');

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

    //  DEBUG
    // formatting = false;

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

    // istanbul
    const lines = [];
    const functions = [];
    const branches = [];
    // v8
    const ranges = [];

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
        lines, functions, branches, ranges, lineMap
    };
};

const addCoverage = (coverage, block, range, index, formatMapping) => {

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

    const skipIndent = true;
    const sLoc = formatMapping.getFormattedLocation(startOffset, skipIndent);
    const eLoc = formatMapping.getFormattedLocation(endOffset, skipIndent);

    // line, column
    updateLinesCount(lineMap, sLoc, eLoc, count);

    if (isBlockCoverage) {
        branches.push(new InfoBranch(sLoc, eLoc, count));
        if (functionName && index === 0) {
            functions.push(new InfoFunction(sLoc, eLoc, count, functionName));
        }
    } else if (functionName) {
        functions.push(new InfoFunction(sLoc, eLoc, count, functionName));
    }
};

// ========================================================================================================

const unpackDistSource = (item, state, options) => {

    const formatMapping = state.formatMapping;
    const coverage = initFileCoverage(formatMapping);

    item.functions.forEach((block) => {
        block.ranges.forEach((range, index) => {
            addCoverage(coverage, block, range, index, formatMapping);
        });
    });

    const sourcePath = item.sourcePath;
    state.coverageData[sourcePath] = getFileCoverage(sourcePath, coverage);
    item.ranges = coverage.ranges;

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
            source: sourceContent,
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
    initSourceMapSourcePath(sourceMap, fileUrls, fileSources, options.sourcePath);

    const generatedMapping = new PositionMapping(item.source);
    const consumer = await new SourceMapConsumer(sourceMap);
    const originalMap = initOriginalList(consumer, options);

    item.functions.forEach((block) => {
        block.ranges.forEach((range, index) => {
            const { startOffset, endOffset } = range;
            const originalInfo = getOriginalRange(consumer, startOffset, endOffset, generatedMapping, originalMap);
            if (!originalInfo) {
                return;
            }

            const {
                sourcePath, originalStart, originalEnd
            } = originalInfo;
            const originalState = originalMap.get(sourcePath);
            if (!originalState) {
                return;
            }

            const { coverage, formatMapping } = originalState;
            const originalRange = {
                ... range,
                startOffset: originalStart,
                endOffset: originalEnd
            };

            addCoverage(coverage, block, originalRange, index, formatMapping);

        });
    });

    // clear
    consumer.destroy();

    // collect original files
    const sourceList = [];
    originalMap.forEach((originalState) => {
        const {
            source, sourcePath, coverage
        } = originalState;

        // generate coverage
        state.coverageData[sourcePath] = getFileCoverage(sourcePath, coverage);
        const ranges = coverage.ranges;

        // add file item
        const url = fileUrls[sourcePath] || sourcePath;
        const id = Util.calculateSha1(url + source);

        let ext = path.extname(sourcePath);
        let type = '';
        if (ext) {
            ext = ext.slice(1);
            const reg = /^[a-z0-9]+$/;
            if (reg.test(ext)) {
                type = ext;
            }
        }

        const distFile = sourceMap.file || path.basename(item.sourcePath);

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

    // TODO DEBUG
    options.debug = true;

    // TODO not css for now
    const jsList = v8list.filter((it) => it.type === 'js');

    // global file sources and coverage data
    const fileSources = {};
    const coverageData = {};
    let sourceList = [];

    for (const item of jsList) {
        // console.log([item.id]);

        const {
            type, source, sourcePath
        } = item;

        // disableFormatting could be added in entryFilter
        const formatting = !item.disableFormatting;

        const { content, mapping } = await formatSource(source, type, formatting);

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
        if (state.sourceList) {
            sourceList = sourceList.concat(state.sourceList);
        }

        // update formatted source
        // update global source
        fileSources[sourcePath] = content;

        // TODO requires ranges update too
        // item.source = content;

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
