const fs = require('fs');
// const EC = require('eight-colors');
const Concurrency = require('../../../platform/concurrency.js');
const { convertSourceMap, axios } = require('../../../runtime/monocart-coverage.js');

const Util = require('../../../utils/util.js');

// ========================================================================================================

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

const resolveSourceMap = (data) => {
    if (data) {
        const {
            sources, sourcesContent, mappings
        } = data;
        if (!sources || !sourcesContent || !mappings) {
            return;
        }
        return data;
    }
};

const collectInlineSourceMaps = async (v8list) => {
    const concurrency = new Concurrency();
    for (const item of v8list) {

        const { type, source } = item;

        // only for js
        if (type === 'js') {
            const converter = convertSourceMap.fromSource(source);
            if (converter) {
                item.sourceMap = resolveSourceMap(converter.sourcemap);

                // source map comments is inline source map, remove it because it is big
                item.source = convertSourceMap.removeComments(source);

                continue;
            }
            const sourceMapUrl = getSourceMapUrl(source, item.url);
            if (sourceMapUrl) {
                item.sourceMapUrl = sourceMapUrl;
                concurrency.addItem(item);
            }
        }
    }
    await concurrency.start(async (item) => {
        const [err, res] = await request({
            url: item.sourceMapUrl
        });
        if (!err && res) {
            item.sourceMap = resolveSourceMap(res.data);

            // source map comments is a link, no need remove

        }
    });
};

const collectFileSourceMaps = async (v8list, options) => {
    const concurrency = new Concurrency();
    for (const item of v8list) {

        const {
            type, url, source, id
        } = item;

        // remove source just keep functions to reduce artifacts size
        delete item.source;

        const sourcePath = Util.resolveArtifactSourcePath(options.artifactsDir, id);
        if (fs.existsSync(sourcePath)) {
            continue;
        }

        const sourceData = {
            url,
            id,
            source: convertSourceMap.removeComments(source)
        };

        // only for js
        if (type === 'js') {
            const converter = convertSourceMap.fromSource(source);
            if (converter) {
                sourceData.sourceMap = resolveSourceMap(converter.sourcemap);
                await saveSourceFile(sourcePath, sourceData);
                continue;
            }
            const sourceMapUrl = getSourceMapUrl(source, item.url);
            if (sourceMapUrl) {
                concurrency.addItem({
                    sourceMapUrl,
                    sourcePath,
                    sourceData
                });
                continue;
            }
        }

        await saveSourceFile(sourcePath, sourceData);

    }

    await concurrency.start(async (item) => {
        const [err, res] = await request({
            url: item.sourceMapUrl
        });
        const sourceData = item.sourceData;
        if (!err && res) {
            sourceData.sourceMap = resolveSourceMap(res.data);
        }
        await saveSourceFile(item.sourcePath, sourceData);
    });
};

const saveSourceFile = async (filePath, data) => {
    await Util.writeFile(filePath, JSON.stringify(data));
};

const collectSourceMaps = async (v8list, options, inlineSourceMap) => {

    if (inlineSourceMap) {
        await collectInlineSourceMaps(v8list);
        return;
    }

    await collectFileSourceMaps(v8list, options);

};

// ========================================================================================================

const findMapping = (list, offset) => {
    let start = 0;
    let end = list.length - 1;
    while (end - start > 1) {
        const i = Math.floor((start + end) * 0.5);
        const item = list[i];
        if (offset < item.generatedOffset) {
            end = i;
            continue;
        }
        if (offset > item.generatedOffset) {
            start = i;
            continue;
        }
        return list[i];
    }
    // last two items, less is start
    const endItem = list[end];
    if (offset < endItem.generatedOffset) {
        return list[start];
    }
    return list[end];

};

const findOffsetMapping = (allDecodedMappings, offset) => {
    const mapping = findMapping(allDecodedMappings, offset);

    // exact matched no need fix
    const exact = mapping.generatedOffset === offset;

    return {
        ... mapping,
        exact
    };
};

const findNextOriginalDiffMapping = (decodedMappings, mapping) => {
    const {
        originalLine, originalColumn, originalIndex
    } = mapping;

    let i = originalIndex + 1;
    const l = decodedMappings.length;
    while (i < l) {
        const item = decodedMappings[i];
        // sometimes next is same line/column
        if (item.originalColumn !== originalColumn || item.originalLine !== originalLine) {
            return item;
        }
        i += 1;
    }
};

const findNextGeneratedDiffMapping = (decodedMappings, mapping) => {
    const {
        generatedLine, generatedColumn, generatedIndex
    } = mapping;

    let i = generatedIndex + 1;
    const l = decodedMappings.length;
    while (i < l) {
        const item = decodedMappings[i];
        // sometimes next is same line/column
        if (item.generatedColumn !== generatedColumn || item.generatedLine !== generatedLine) {
            return item;
        }
        i += 1;
    }
};

// ========================================================================================================

const fixStartMapping = (startMapping, range, allDecodedMappings, generatedPositionMapping, originalState) => {
    // exact matched no need fix
    if (startMapping.exact) {
        return;
    }

    const { decodedMappings, positionMapping } = originalState;

    const nextOriginalMapping = findNextOriginalDiffMapping(decodedMappings, startMapping);
    if (!nextOriginalMapping) {
        return;
    }

    const s = positionMapping.locationToOffset({
        line: startMapping.originalLine + 1,
        column: startMapping.originalColumn
    });
    const e = positionMapping.locationToOffset({
        line: nextOriginalMapping.originalLine + 1,
        column: nextOriginalMapping.originalColumn
    });
    const originalText = positionMapping.getSlice(s, e);

    // originalText: '1;\r\n        } else ',
    // generatedTextLeft: '1;',
    // generatedTextRight: 'else'

    // check left
    const generatedTextLeft = generatedPositionMapping.getSlice(startMapping.generatedOffset, range.startOffset);
    if (originalText.startsWith(generatedTextLeft)) {
        startMapping.originalColumn += generatedTextLeft.length;
        return;
    }

    // actual generatedOffset < range startOffset
    const nextGeneratedMapping = findNextGeneratedDiffMapping(allDecodedMappings, startMapping);
    if (!nextGeneratedMapping) {
        return;
    }

    // check right
    const generatedTextRight = generatedPositionMapping.getSlice(range.startOffset, nextGeneratedMapping.generatedOffset);
    if (originalText.endsWith(generatedTextRight)) {
        startMapping.originalColumn += originalText.length - generatedTextRight.length;
        return;
    }

    // originalText: 'something) {\r\n        ',
    // generatedTextLeft: 'o',
    // generatedTextRight: '?'

    // guess start boundary characters
    const index = originalText.search(/[{([\n]/);
    if (index !== -1) {
        startMapping.originalColumn += index;

        // if (originalState.type === 'js') {
        //     console.log('============================================================');
        //     console.log('fix startMapping', originalState.sourcePath);
        //     console.log(startMapping, range);
        //     console.log({
        //         originalText,
        //         index,
        //         generatedTextLeft,
        //         generatedTextRight
        //     });
        // }

    }


    // following can NOT be fixed

    // originalText: '"',
    // generatedTextLeft: ', ',
    // generatedTextRight: '('

    // console.log('============================================================');
    // console.log('fix startMapping', originalState.sourcePath);
    // console.log(startMapping, range);
    // console.log({
    //     originalText,
    //     generatedTextLeft,
    //     generatedTextRight
    // });

};

const fixEndMapping = (endMapping, startMapping, originalState) => {

    // exact matched no need fix, already -1
    if (endMapping.exact) {
        endMapping.originalColumn += 1;

        // console.log('============================================================');
        // console.log('exact matched end (+1)');
        // console.log(originalState.sourcePath);
        // console.log(endMapping);

        return true;
    }

    const decodedMappings = originalState.decodedMappings;
    const nextMapping = findNextOriginalDiffMapping(decodedMappings, endMapping);

    // if (originalState.debug) {
    //     console.log('endMapping and nextMapping:');
    //     console.log(endMapping, nextMapping);
    // }

    if (nextMapping) {

        // mapping in the same line
        if (nextMapping.originalLine === endMapping.originalLine) {
            // to next mapping column, exclusive, no need -1
            endMapping.originalColumn = nextMapping.originalColumn;
            // endMapping.next = 'same line';
        } else {
            // to line end
            endMapping.originalColumn = Infinity;
            // endMapping.next = 'diff line';
        }

    } else {

        // no next means the end mapping is last mapping

        // no content between start and end
        if (endMapping.generatedOffset === startMapping.generatedOffset) {
            return false;
        }

        // to line end
        endMapping.originalColumn = Infinity;
        // endMapping.next = 'none';
    }

    return true;
};

// ========================================================================================================

const getOriginalRange = (range, allDecodedMappings, generatedPositionMapping, originalMap) => {

    // startOffset: inclusive
    // endOffset: exclusive

    const startMapping = findOffsetMapping(allDecodedMappings, range.startOffset);

    // check source first, sourceIndex could be undefined
    const sourceIndex = startMapping.sourceIndex;
    const originalState = originalMap.get(sourceIndex);
    if (!originalState) {
        return;
    }

    // ==================================================================================
    // debug
    // if (originalState.sourcePath.endsWith('fps-detector/src/index.js') && range.count === 0) {
    //     originalState.debug = true;
    //     console.log('============================================================');
    //     console.log(originalState.sourcePath);
    //     console.log(range);
    // } else {
    //     originalState.debug = false;
    // }
    // ==================================================================================

    // always success
    fixStartMapping(startMapping, range, allDecodedMappings, generatedPositionMapping, originalState);

    // endOffset: exclusive
    const endMapping = findOffsetMapping(allDecodedMappings, range.endOffset - 1);
    const endFixed = fixEndMapping(endMapping, startMapping, originalState);
    if (!endFixed) {
        return;
    }

    // location to offset
    const positionMapping = originalState.positionMapping;
    const originalStart = positionMapping.locationToOffset({
        line: startMapping.originalLine + 1,
        column: startMapping.originalColumn
    });
    const originalEnd = positionMapping.locationToOffset({
        line: endMapping.originalLine + 1,
        column: endMapping.originalColumn
    });

    // if (originalState.debug) {
    //     console.log('startMapping and endMapping:');
    //     console.log(startMapping, endMapping);
    //     console.log(originalStart, originalEnd);
    // }

    // range start greater than end
    if (originalEnd <= originalStart) {
        // EC.logRed(`end < start: ${originalState.sourcePath}`);
        // console.log(range, originalStart, originalEnd);
        return;
    }

    return {
        originalState,
        // original offset
        originalStart,
        originalEnd
    };

};

module.exports = {
    collectSourceMaps,
    getOriginalRange
};
