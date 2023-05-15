
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
        const source = item.source || item.text;
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

        // https://v8.dev/blog/javascript-code-coverage
        // https://playwright.dev/docs/api/class-coverage#coverage-start-js-coverage
        // url, scriptId, source, functions:[ {functionName, isBlockCoverage, ranges: [{startOffset, endOffset, count}] } ]
        sourcemaps.push({
            sourceMap,
            source: item.source || item.text,
            functions: item.functions,
            url: item.url,
            sourceMapUrl: item.sourceMapUrl
        });

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


const extractSourcemap = async (item, v8list, options) => {
    // sourceMap, source, functions

    const generatedMapping = new PositionMapping(item.source);

    const sourceMap = item.sourceMap;

    // console.log(item.url, item.sourceMapUrl);

    const tracer = await new TraceMap(sourceMap);

    // content mapping
    const originalMappings = new Map();
    tracer.resolvedSources.filter((k) => {
        return options.sourceFilter(k);
    }).forEach((k, i) => {
        // console.log(`add source: ${k}`);
        const content = sourceContentFor(tracer, k);
        if (content) {
            originalMappings.set(k, new PositionMapping(content));
        }
    });

    // console.log('generated source length and lines', item.source.length, generatedMapping.lines.length);

    // debug
    // const offsetList = [
    //     // 6666
    //     // 1055
    //     //   6094, 6122, 6134, 6787
    // ];
    // item.functions = item.functions.filter((f) => {
    //     return f.ranges.find((r) => {
    //         if (!offsetList.length) {
    //             return true;
    //         }
    //         return offsetList.includes(r.startOffset);
    //     });
    // });

    item.functions.forEach((block) => {

        const currentBlockMap = {};

        block.ranges.forEach((range) => {
            const { startOffset, endOffset } = range;
            const sLoc = generatedMapping.offsetToLocation(startOffset);
            const oSLoc = getOriginalStartPosition(tracer, sLoc.line, sLoc.column);
            if (!oSLoc) {
                return;
            }

            const eLoc = generatedMapping.offsetToLocation(endOffset);
            const oELoc = getOriginalEndPosition(tracer, eLoc.line, eLoc.column);
            if (!oELoc) {
                return;
            }

            if (oSLoc.source !== oELoc.source) {
                return;
            }

            const currentSource = oSLoc.source;

            const originalMapping = originalMappings.get(currentSource);
            if (!originalMapping) {
                // console.log(`not found source: ${currentSource}`);
                return;
            }

            const originalStart = originalMapping.locationToOffset(oSLoc);
            const originalEnd = originalMapping.locationToOffset(oELoc);
            if (originalEnd <= originalStart) {
                return;
            }

            // debug
            // const EC = require('eight-colors');
            // console.log('===============================');
            // console.log(EC.blue(currentSource), `(lines: ${originalMapping.lines.length})`);
            // console.log(range);

            // // check back to offset from location
            // const so = generatedMapping.locationToOffset(sLoc);
            // const eo = generatedMapping.locationToOffset(eLoc);
            // console.assert(so === startOffset);
            // console.assert(eo === endOffset);

            // EC.logCyan(generatedMapping.getSlice(startOffset, endOffset));

            // // console.log(sLoc, eLoc);
            // // console.log(oSLoc, oELoc);
            // console.log('original line:column start:', `${oSLoc.line}:${oSLoc.column}`, 'end:', `${oELoc.line}:${oELoc.column}`);

            // console.log('original offset start:', originalStart, 'end:', originalEnd, 'length:', originalEnd - originalStart);

            // //  EC.logMagenta(originalMapping.source);
            // const t = originalMapping.getSlice(originalStart, originalEnd);
            // console.log(EC.magenta(t), t.length);

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

        });

        Object.keys(currentBlockMap).forEach((currentSource) => {
            const currentBlock = currentBlockMap[currentSource];
            const originalMapping = originalMappings.get(currentSource);
            originalMapping.functions.push(currentBlock);
        });

    });

    // collect new v8list
    // url, scriptId, source, functions } ]
    originalMappings.forEach((originalMapping, currentSource, i) => {
        const { source, functions } = originalMapping;

        // console.log(functions);

        v8list.push({
            url: currentSource,
            scriptId: i,
            source,
            functions
        });

    });

};


const extractSourcemaps = async (v8list, options) => {

    if (!options.sourceMap) {
        return;
    }

    await collectSourcemaps(v8list);

    const sourcemaps = filterSourcemaps(v8list);
    if (!sourcemaps) {
        // nothing to extract
        return;
    }
    // console.log(sourcemaps);
    for (const sourcemap of sourcemaps) {
        await extractSourcemap(sourcemap, v8list, options);
    }
};


module.exports = {
    extractSourcemaps
};
