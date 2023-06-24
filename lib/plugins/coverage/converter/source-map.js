const fs = require('fs');

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

const findMappingIndex = (list, offset) => {
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
        return i;
    }
    // last two items, less is start
    const endItem = list[end];
    if (offset < endItem.generatedOffset) {
        return start;
    }
    return end;

};

const getOriginalRange = (allDecodedMappings, range, originalMap) => {

    // startOffset: inclusive
    // endOffset: exclusive
    const { startOffset, endOffset } = range;

    const startIndex = findMappingIndex(allDecodedMappings, startOffset);
    const startMapping = allDecodedMappings[startIndex];

    const sourceIndex = startMapping.sourceIndex;
    // sourceIndex could be undefined

    const originalState = originalMap.get(sourceIndex);
    if (!originalState) {
        return;
    }

    const endIndex = findMappingIndex(allDecodedMappings, endOffset);
    const endMapping = allDecodedMappings[endIndex];

    const decodedMappings = originalState.decodedMappings;
    const originalMapping = decodedMappings[endMapping.originalIndex];

    if (originalState.sourcePath.endsWith('coverage/src/index.js') && range.count === 0) {
        console.log('=======================================================================');
        console.log(endMapping);
        console.log(originalMapping);
    }


    // // if source excluded
    // const sourcePath = oSLoc.source;
    // const originalState = originalMap.get(sourcePath);
    // if (!originalState) {
    //     // possible this source has been filtered
    //     // console.log(`not found source: ${currentSource}`);
    //     return;
    // }

    // // find end location
    // // endOffset is exclusive
    // const currentEnd = endOffset - 1;
    // const eLoc = generatedPositionMapping.offsetToLocation(currentEnd);
    // const oELoc = findOriginalEndPosition(tracer, eLoc, generatedPositionMapping, startOffset, currentEnd);
    // if (!oELoc) {
    //     // not found end
    //     return;
    // }

    // const positionMapping = originalState.positionMapping;
    // const originalStart = positionMapping.locationToOffset(oSLoc);
    // const originalEnd = positionMapping.locationToOffset(oELoc);

    // // range start greater than end
    // if (originalEnd <= originalStart) {
    //     return;
    // }

    // const res = {
    //     originalState,
    //     // for debug
    //     sourcePath,
    //     sLoc,
    //     eLoc,
    //     oSLoc,
    //     oELoc,
    //     // original offset
    //     originalStart,
    //     originalEnd
    // };

    // return res;
};

module.exports = {
    collectSourceMaps,
    getOriginalRange
};
