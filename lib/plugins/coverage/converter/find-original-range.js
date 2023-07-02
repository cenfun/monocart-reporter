
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

const findOffsetMapping = (generatedState, offset) => {

    const decodedMappings = generatedState.decodedMappings;

    // possible no length
    if (!decodedMappings.length) {
        return;
    }

    const mapping = findMapping(decodedMappings, offset);

    const generatedOffset = mapping.generatedOffset;

    // not found, allow > last, not allow < first
    if (offset < generatedOffset) {
        return;
    }

    // exact matched no need fix
    const exact = generatedOffset === offset;

    return {
        ... mapping,
        // could be fixed if not exact matched
        column: mapping.originalColumn,
        exact
    };
};

const findNextOriginalDiffMapping = (originalState, mapping) => {
    const decodedMappings = originalState.decodedMappings;
    const { originalIndex, originalOffset } = mapping;

    let i = originalIndex + 1;
    const l = decodedMappings.length;
    while (i < l) {
        const item = decodedMappings[i];
        // sometimes next is same line/column
        if (item.originalOffset > originalOffset) {
            return item;
        }
        i += 1;
    }
};

const findNextGeneratedDiffMapping = (generatedState, mapping) => {
    const decodedMappings = generatedState.decodedMappings;
    const i = mapping.generatedIndex + 1;
    const l = decodedMappings.length;
    if (i < l) {
        return decodedMappings[i];
    }
};

const getGeneratedText = (mapping, generatedState) => {

    const generatedText = mapping.generatedText;
    if (typeof generatedText === 'string') {
        return generatedText;
    }

    let text = '';

    const { positionMapping } = generatedState;
    const nextMapping = findNextGeneratedDiffMapping(generatedState, mapping);
    if (nextMapping) {
        text = positionMapping.getSlice(mapping.generatedOffset, nextMapping.generatedOffset);
    } else {
        // to the end
        text = positionMapping.getSlice(mapping.generatedOffset);
    }

    // never cross line
    if (mapping.generatedEndOffset) {
        const len = mapping.generatedEndOffset - mapping.generatedOffset;
        text = text.slice(0, len);
    }

    // keep cache
    mapping.generatedText = text;

    return text;

};

const getOriginalText = (mapping, originalState) => {

    const originalText = mapping.originalText;
    if (typeof originalText === 'string') {
        return originalText;
    }

    let text = '';

    const { positionMapping } = originalState;
    const nextMapping = findNextOriginalDiffMapping(originalState, mapping);
    if (nextMapping) {
        text = positionMapping.getSlice(mapping.originalOffset, nextMapping.originalOffset);
    } else {
        // to the end
        text = positionMapping.getSlice(mapping.originalOffset);
    }

    // the last two items could have same line and column
    // so can NOT pre-calculate original end offset, just search new line with regex

    // never cross line
    const newLineIndex = text.search(/\r?\n/);
    if (newLineIndex !== -1) {
        text = text.slice(0, newLineIndex);
    }

    // keep cache
    mapping.originalText = text;

    return text;
};

// ========================================================================================================

const getBlockStartPosition = (originalText) => {
    // start block characters

    // originalText: 'argument) {',
    // generatedLeft: 'o',
    // generatedRight: '&&'

    // function/block could be started with {(
    const startBlockIndex = originalText.search(/[<{(]/);
    if (startBlockIndex !== -1) {
        return startBlockIndex;
    }

    // end a block
    const list = ['>', '}', ')'];
    for (const s of list) {
        const endBlockIndex = originalText.lastIndexOf(s);
        if (endBlockIndex !== -1) {
            return endBlockIndex + 1;
        }
    }

    return -1;
};

const getBlockEndPosition = (originalText) => {
    // generatedText: 'e),',
    // generatedPos: 2,
    // originalText: 'prop))'

    // generatedText: ' = false)',
    // generatedPos: 8,
    // originalText: '=false"'

    // generatedText: '), 1 /* TEXT */)])])) : (0,vue__...)("v-if", true)], 6 /* CLASS, STYLE */);',
    // generatedPos: 17,
    // originalText: ' }}</slot>'

    const list = ['>', '}', ')'];
    for (const s of list) {
        const endBlockIndex = originalText.lastIndexOf(s);
        if (endBlockIndex !== -1) {
            return endBlockIndex + 1;
        }
    }

    const startBlockIndex = originalText.search(/[<{(]/);
    if (startBlockIndex !== -1) {
        return startBlockIndex;
    }

    return -1;
};

const getOriginalStartPosition = (originalText, generatedText, generatedPos) => {

    if (!originalText.length) {
        return 0;
    }

    if (originalText === generatedText) {
        return generatedPos;
    }

    // ============================
    // left matched

    // originalText: '1;',
    // generatedText: '1;else',
    // generatedLeft: '1;'

    const generatedLeft = generatedText.slice(0, generatedPos);
    if (originalText.startsWith(generatedLeft)) {
        return generatedLeft.length;
    }

    // ============================
    // no case for right
    // const generatedRight = generatedText.slice(generatedPos);
    // if (originalText.endsWith(generatedRight)) {
    //     return originalText.length - generatedRight.length;
    // }

    // ============================
    // starts with original text (few case possible useless)

    // generatedText "(void 0, void 0, void 0, function* () {"
    // originalText " {"

    //   generatedLen: 1629,
    //   generatedText: '__exports__);\r\n\r\n/***/ }),\r\n\r\n/***/ "./packages/v8',
    //   generatedPos: 489,
    //   originalText: '__exports__',

    // original less, generated more
    // const includeIndex = generatedText.indexOf(originalText);
    // if (includeIndex !== -1) {

    //     console.log('=================== includeIndex', includeIndex, generatedPos);
    //     console.log(JSON.stringify(generatedText.slice(0, originalText.length + includeIndex + 10)));
    //     console.log(JSON.stringify(originalText));

    //     if (includeIndex >= generatedPos) {
    //         return 0;
    //     }

    //     return originalText.length;
    // }

    // ============================
    // {} () <>
    const blockIndex = getBlockStartPosition(originalText);
    if (blockIndex !== -1) {
        return blockIndex;
    }

    // ============================
    // end characters

    // ends with ">" in vue
    // <span v-if="data.distFile">

    // originalText: '">',
    // generatedText: ' ? ((0,vue__.openBlock)(), '

    // originalMethod?.apply
    // originalText: '?.'  no ?

    const indexEndBlock = originalText.search(/(?<=[;,:"'\s])/);
    if (indexEndBlock !== -1) {
        return indexEndBlock;
    }

    // console.log('====================================================================');
    // console.log('start position can NOT be fixed');
    // console.log({
    //     generatedText,
    //     generatedPos,
    //     originalText
    //     // originalPos
    // });

    // ============================
    // can NOT be fixed
    // using original column
    return 0;
};

const getOriginalEndPosition = (originalText, generatedText, generatedPos) => {

    if (!originalText.length) {
        return 0;
    }

    if (originalText === generatedText) {
        return generatedPos;
    }

    // ============================
    // {} () <>
    const blockIndex = getBlockEndPosition(originalText);
    if (blockIndex !== -1) {
        return blockIndex;
    }

    // console.log('====================================================================');
    // console.log('end position can NOT be fixed');
    // console.log({
    //     generatedText,
    //     generatedPos,
    //     originalText
    //     // originalPos
    // });

    // ============================
    // can NOT be fixed
    // to the line end
    return originalText.length;
};

// ========================================================================================================

const fixStartColumn = (startMapping, range, generatedState, originalState) => {
    // exact matched no need fix
    if (startMapping.exact) {
        // originalColumn is the column
        return;
    }

    // fix column
    const originalColumn = startMapping.originalColumn;

    const originalText = getOriginalText(startMapping, originalState);
    const generatedText = getGeneratedText(startMapping, generatedState);

    // actual generatedOffset < range startOffset
    const generatedPos = range.startOffset - startMapping.generatedOffset;

    const originalPos = getOriginalStartPosition(originalText, generatedText, generatedPos);

    // if (originalState.sourcePath.endsWith('src/components/report.vue') && range.count === 0) {
    //     console.log('====================================================================');
    //     console.log('fix startMapping', originalState.sourcePath);
    //     console.log(startMapping);
    //     console.log({
    //         generatedPos,
    //         originalPos
    //     });
    // }

    // failed if originalPos = 0
    startMapping.column = originalColumn + originalPos;

};

// ========================================================================================================

const fixEndColumn = (endMapping, range, startMapping, generatedState, originalState) => {

    const originalColumn = endMapping.originalColumn;

    // exact matched, but already -1 so need +1
    if (endMapping.exact) {
        endMapping.column = originalColumn + 1;
        return;
    }

    // ================================
    // diff line, to the line end
    if (endMapping.originalLine !== startMapping.originalLine) {
        endMapping.column = Infinity;
        return;
    }

    // ================================
    // in the same line

    const originalText = getOriginalText(endMapping, originalState);

    // exclusive, need exclude some end strings
    if (!endMapping.exclusive) {
        endMapping.column = originalColumn + originalText.length;
        return;
    }


    const generatedText = getGeneratedText(endMapping, generatedState);

    // actual generatedOffset < range endOffset
    const generatedPos = range.endOffset - endMapping.generatedOffset;

    const originalPos = getOriginalEndPosition(originalText, generatedText, generatedPos);

    // if (originalState.sourcePath.endsWith('v8/src/app.vue') && range.count === 0) {
    //     console.log('====================================================================');
    //     console.log('fix endMapping', originalState.sourcePath);
    //     console.log(startMapping, endMapping);
    //     const generatedLen = generatedText.length;
    //     const gt = generatedLen > 50 ? generatedText.slice(0, 50) : generatedText;
    //     console.log({
    //         generatedLen,
    //         generatedText: gt,
    //         generatedPos,
    //         originalText,
    //         originalPos
    //     });
    // }

    // failed if originalPos = 0
    endMapping.column = originalColumn + originalPos;

};

// ========================================================================================================

const isOffsetCrossLine = (startMapping, offset) => {
    const { exact, generatedEndOffset } = startMapping;
    if (!exact && generatedEndOffset) {
        if (offset >= generatedEndOffset) {
            return true;
        }
    }
    return false;
};

const findStartMapping = (range, generatedState, originalMap) => {

    // startOffset: inclusive
    const startOffset = range.startOffset;

    const startMapping = findOffsetMapping(generatedState, startOffset);
    if (!startMapping) {
        return;
    }

    // check end offset for start mapping only
    // start mapping is inclusive, do not allow cross line
    // but end mapping is exclusive and offset do -1, possible no mapping found, do not check it
    if (isOffsetCrossLine(startMapping, startOffset)) {
        // try next mapping if its offset in the range
        const nextMapping = findNextGeneratedDiffMapping(generatedState, startMapping);
        if (!nextMapping) {
            return;
        }

        // ignore out of range
        if (nextMapping.generatedOffset >= range.endOffset) {
            return;
        }

        // if (startMapping.sourceIndex === 1 && range.count === 0) {
        //     console.log('=========================================================');
        //     console.log('find next start');
        //     console.log(startMapping, nextMapping, range);
        // }

        // exact and column
        Object.assign(startMapping, nextMapping, {
            exact: true,
            column: nextMapping.originalColumn
        });

    }


    // check source first, sourceIndex could be undefined
    const sourceIndex = startMapping.sourceIndex;

    const originalState = originalMap.get(sourceIndex);
    if (!originalState) {
        return;
    }

    return {
        startMapping,
        originalState
    };
};


const findEndMapping = (range, generatedState, startMapping) => {

    // endOffset: exclusive
    const endOffset = range.endOffset;

    // there could be some comments before end mapping even exact matched
    const endMapping = findOffsetMapping(generatedState, endOffset - 1);
    if (!endMapping) {
        return;
    }

    // cross file ignore
    if (endMapping.sourceIndex !== startMapping.sourceIndex) {
        return;
    }

    // still exclusive
    const exclusiveMapping = findOffsetMapping(generatedState, endOffset);
    if (exclusiveMapping && exclusiveMapping.originalOffset === endMapping.originalOffset) {
        endMapping.exclusive = true;
    }

    return endMapping;
};

const findOriginalRange = (range, generatedState, originalMap) => {

    // startOffset: inclusive
    // endOffset: exclusive

    const startResult = findStartMapping(range, generatedState, originalMap);
    if (!startResult) {
        return;
    }
    const { startMapping, originalState } = startResult;

    // ==================================================================================
    // if (originalState.sourcePath.endsWith('app/app.module.ts')) {
    //     originalState.showLog = true;
    //     console.log('============================================================');
    //     console.log(originalState.sourcePath);
    //     console.log(range);
    // } else {
    //     originalState.showLog = false;
    // }
    // ==================================================================================

    const endMapping = findEndMapping(range, generatedState, startMapping);
    if (!endMapping) {
        return;
    }

    // fix start
    fixStartColumn(startMapping, range, generatedState, originalState);

    // fix end
    fixEndColumn(endMapping, range, startMapping, generatedState, originalState);

    const positionMapping = originalState.positionMapping;
    const originalStart = positionMapping.locationToOffset({
        line: startMapping.originalLine + 1,
        column: startMapping.column
    });
    const originalEnd = positionMapping.locationToOffset({
        line: endMapping.originalLine + 1,
        column: endMapping.column
    });

    // range start greater than end
    if (originalStart >= originalEnd) {
        // console.log(`start >= end: ${originalState.sourcePath}`);
        // console.log(range, originalRange);
        return;
    }

    const originalRange = {
        startOffset: originalStart,
        endOffset: originalEnd,
        count: range.count
    };

    // if (originalState.showLog) {
    //     console.log('startMapping and endMapping:');
    //     console.log(startMapping, endMapping);
    //     console.log(originalStart, originalEnd);
    // }

    return {
        originalRange,
        originalState
    };

};

module.exports = findOriginalRange;
