const EC = require('eight-colors');

const {
    convertSourceMap, traceMapping, axios
} = require('../../runtime/monocart-coverage.js');

const Util = require('../../utils/util.js');
const Concurrency = require('../../platform/concurrency.js');
const PositionMapping = require('./position-mapping.js');

const {
    TraceMap,
    originalPositionFor,
    generatedPositionFor,
    sourceContentFor,
    GREATEST_LOWER_BOUND, LEAST_UPPER_BOUND
} = traceMapping;

const request = async (options) => {
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
        if (!Util.isList(sources) || !Util.isList(sourcesContent)) {
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


const originalPositionTryBoth = (sourceMap, line, column) => {
    let original = originalPositionFor(sourceMap, {
        line,
        column,
        bias: GREATEST_LOWER_BOUND
    });
    if (original.source === null) {
        original = originalPositionFor(sourceMap, {
            line,
            column,
            bias: LEAST_UPPER_BOUND
        });
    }
    return original;
};

const originalEndPositionFor = (sourceMap, line, column) => {
    const beforeEndMapping = originalPositionTryBoth(sourceMap, line, column - 1);

    if (beforeEndMapping.source === null) {
        return null;
    }

    const afterEndMapping = generatedPositionFor(sourceMap, {
        source: beforeEndMapping.source,
        line: beforeEndMapping.line,
        column: beforeEndMapping.column + 1,
        bias: LEAST_UPPER_BOUND
    });

    if (afterEndMapping.line === null) {
        return {
            source: beforeEndMapping.source,
            line: beforeEndMapping.line,
            column: Infinity
        };
    }

    const mapping = originalPositionFor(sourceMap, afterEndMapping);
    if (mapping.line !== beforeEndMapping.line) {
        return {
            source: beforeEndMapping.source,
            line: beforeEndMapping.line,
            column: Infinity
        };
    }

    return mapping;
};


const extractSourcemap = async (item, v8list, options) => {
    // sourceMap, source, functions

    const generatedMapping = new PositionMapping(item.source);

    const sourceMap = item.sourceMap;

    console.log(item.url, item.sourceMapUrl);

    // const sm = new SourceMap.SourceMap(item.url, item.sourceMapUrl, item.sourceMap);

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
    item.functions = item.functions.filter((f) => {
        return f.ranges.find((r) => {
            return [1055, 6094, 6122, 6134, 6666, 6787].includes(r.startOffset);
        });
    });

    item.functions.forEach((block) => {

        // console.log('##############################', block.ranges);

        block.ranges.forEach((range) => {
            const { startOffset, endOffset } = range;
            const sLoc = generatedMapping.offsetToLocation(startOffset);
            // https://github.com/mozilla/source-map
            const oSLoc = originalPositionTryBoth(tracer, sLoc.line, sLoc.column);
            if (!oSLoc || !oSLoc.source) {
                return;
            }

            const eLoc = generatedMapping.offsetToLocation(endOffset);
            const oELoc = originalEndPositionFor(tracer, eLoc.line, eLoc.column);
            if (!oELoc || !oELoc.source) {
                return;
            }

            if (oSLoc.source !== oELoc.source) {
                return;
            }

            const originalMapping = originalMappings.get(oSLoc.source);
            if (!originalMapping) {
                // console.log(`not found source: ${oSLoc.source}`);
                return;
            }

            const originalStart = originalMapping.locationToOffset(oSLoc);
            const originalEnd = originalMapping.locationToOffset(oELoc);
            if (originalEnd <= originalStart) {
                return;
            }

            console.log('===============================');
            console.log(EC.blue(oSLoc.source), `(lines: ${originalMapping.lines.length})`);
            console.log(range);

            // const entryStart = sm.findEntry(sLoc.line - 1, sLoc.column);
            // console.log('entry start', entryStart);
            // const entryEnd = sm.findEntry(eLoc.line - 1, eLoc.column);
            // console.log('entry end', entryEnd);


            // check back to offset from location
            const so = generatedMapping.locationToOffset(sLoc);
            const eo = generatedMapping.locationToOffset(eLoc);
            console.assert(so === startOffset);
            console.assert(eo === endOffset);

            EC.logCyan(generatedMapping.getSlice(startOffset, endOffset));

            // console.log(sLoc, eLoc);
            // console.log(oSLoc, oELoc);
            console.log('original line:column start:', `${oSLoc.line}:${oSLoc.column}`, 'end:', `${oELoc.line}:${oELoc.column}`);

            console.log('original offset start:', originalStart, 'end:', originalEnd, 'length:', originalEnd - originalStart);

            //  EC.logMagenta(originalMapping.source);
            const t = originalMapping.getSlice(originalStart, originalEnd);
            console.log(EC.magenta(t), t.length);


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
