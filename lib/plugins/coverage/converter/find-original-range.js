
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

const getOriginalText = (originalState, mapping) => {

    const { decodedMappings, positionMapping } = originalState;

    const nextOriginalMapping = findNextOriginalDiffMapping(decodedMappings, mapping);
    if (!nextOriginalMapping) {
        return;
    }

    const s = positionMapping.locationToOffset({
        line: mapping.originalLine + 1,
        column: mapping.originalColumn
    });
    const e = positionMapping.locationToOffset({
        line: nextOriginalMapping.originalLine + 1,
        column: nextOriginalMapping.originalColumn
    });

    return positionMapping.getSlice(s, e);
};

// ========================================================================================================

const fixStartMapping = (startMapping, range, allDecodedMappings, generatedPositionMapping, originalState) => {
    // exact matched no need fix
    if (startMapping.exact) {
        return;
    }

    const originalText = getOriginalText(originalState, startMapping);
    if (!originalText) {
        return;
    }

    startMapping.originalText = originalText;

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

const fixEndMapping = (endMapping, range, startMapping, generatedPositionMapping, originalState) => {

    // exact matched no need fix, already -1
    if (endMapping.exact) {
        endMapping.originalColumn += 1;

        // console.log('============================================================');
        // console.log('exact matched end (+1)');
        // console.log(originalState.sourcePath);
        // console.log(endMapping);

        return true;
    }

    // in the same range
    if (endMapping.generatedOffset === startMapping.generatedOffset) {
        const originalText = startMapping.originalText;
        if (originalText) {

            const generatedTextLeft = generatedPositionMapping.getSlice(endMapping.generatedOffset, range.endOffset);

            if (originalText.startsWith(generatedTextLeft)) {

                // console.log('endMapping stats with', startMapping);

                endMapping.originalColumn = generatedTextLeft.length;
                return true;

            }

        }
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
            endMapping.next = 'same line';
        } else {
            // to line end
            endMapping.originalColumn = Infinity;
            endMapping.next = 'diff line';
        }

    } else {

        // no next means the end mapping is last mapping

        // no content between start and end
        if (endMapping.generatedOffset === startMapping.generatedOffset) {
            return false;
        }

        // to line end
        endMapping.originalColumn = Infinity;
        endMapping.next = 'none';
    }

    return true;
};

// ========================================================================================================

const findOriginalRange = (range, allDecodedMappings, generatedPositionMapping, originalMap) => {

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
    // if (originalState.sourcePath.endsWith('report.vue/0555') && range.count === 0) {
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
    const endFixed = fixEndMapping(endMapping, range, startMapping, generatedPositionMapping, originalState);
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

module.exports = findOriginalRange;
