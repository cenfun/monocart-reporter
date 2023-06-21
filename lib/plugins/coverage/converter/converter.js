// const fs = require('fs');
// const path = require('path');
// const EC = require('eight-colors');
const { SourceMapConsumer } = require('source-map');

const { format, Mapping } = require('../../../runtime/monocart-formatter-node.js');

const Util = require('../../../utils/util.js');

const { convertFunctionsToRanges, initSourceMapRootAndUrl } = require('../coverage-utils.js');
// const { unpackSourceMaps } = require('./v8/source-map.js');

const { saveIstanbulReport } = require('../istanbul/istanbul.js');

const InfoLine = require('./info-line.js');
const InfoBranch = require('./info-branch.js');
const InfoFunction = require('./info-function.js');

// ========================================================================================================

const formatSource = (source, type, formatting = true) => {

    // TODO DEBUG
    formatting = false;

    if (formatting) {
        return format(source, type);
    }

    // no formatting but replace all \r\n with \n

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

// ========================================================================================================

/**
 * * `path` - the file path for which coverage is being tracked
 * * `statementMap` - map of statement locations keyed by statement index
 * * `fnMap` - map of function metadata keyed by function index
 * * `branchMap` - map of branch metadata keyed by branch index
 * * `s` - hit counts for statements
 * * `f` - hit count for functions
 * * `b` - hit count for branches
 */
const getFileCoverage = (sourcePath, lines, functions, branches) => {

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

const convertFunctionsToCoverage = (item, state) => {

    const lines = [];
    const functions = [];
    const branches = [];

    // position source mapping
    const mapping = state.mapping;

    const {
        formattedLines, commentedLines, blankLines
    } = mapping;

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

    item.functions.forEach((block) => {

        const {
            isBlockCoverage, functionName, ranges
        } = block;

        ranges.forEach((range, i) => {
            const {
                startOffset, endOffset, count
            } = range;

            const skipIndent = true;
            const sLoc = mapping.getFormattedLocation(startOffset, skipIndent);
            const eLoc = mapping.getFormattedLocation(endOffset, skipIndent);

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

    state.coverage = getFileCoverage(item.sourcePath, lines, functions, branches);

};

// ========================================================================================================

const unpackDistSource = (item, state, options) => {

    const { toIstanbul } = options;

    convertFunctionsToCoverage(item, state);

    if (!toIstanbul) {
        state.ranges = convertFunctionsToRanges(item.functions);
    }

};

const unpackDistFile = (item, state, options) => {

    if (state.consumer) {
        if (options.debug) {
            // js self
            unpackDistSource(item, state, options);
        } else {
            item.dedupe = true;
        }

        // unpack sourceMap


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

    // map for istanbul
    const map = new Map();
    const fileUrls = {};
    const fileSources = {};
    const coverageData = {};

    for (const item of jsList) {
        // console.log([item.id]);

        const {
            type, source, sourcePath, sourceMap
        } = item;

        // disableFormatting could be added in entryFilter
        const formatting = !item.disableFormatting;

        const { content, mapping } = await formatSource(source, type, formatting);

        // update source
        fileSources[sourcePath] = content;
        // TODO
        // item.source = content;

        const parseLines = true;
        const state = {
            mapping: new Mapping(content, mapping, parseLines)
        };

        if (sourceMap) {
            initSourceMapRootAndUrl(sourceMap, fileUrls, fileSources);
            state.consumer = await new SourceMapConsumer(sourceMap);
        }

        map.set(item.id, state);

        await unpackDistFile(item, state, options);

        // clean
        if (state.consumer) {
            state.consumer.destroy();
            state.consumer = null;
        }

        if (state.coverage) {
            coverageData[sourcePath] = state.coverage;
        }

    }

    map.clear();

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
