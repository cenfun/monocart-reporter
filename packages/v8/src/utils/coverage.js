import Util from './util.js';

const setUncoveredLines = (coverage, line, value) => {
    const uncoveredMap = coverage.uncoveredLines;
    const prev = uncoveredMap[line];
    if (prev && prev !== value) {
        if (prev === 'uncovered') {
            return prev;
        }
        // console.log('previous line', line, prev, value);
    }
    uncoveredMap[line] = value;
};

const setUncoveredPieces = (coverage, line, value) => {
    const uncoveredMap = coverage.uncoveredPieces;
    const prevList = uncoveredMap[line];
    if (prevList) {
        prevList.push(value);
        return;
    }
    uncoveredMap[line] = [value];
};

const setExecutionCounts = (formattedMapping, range, coverage) => {
    const executionMap = coverage.executionCounts;

    const {
        startOffset, endOffset, count
    } = range;

    const skipIndent = true;
    const sLoc = formattedMapping.getFormattedLocation(startOffset, skipIndent);
    const line = sLoc.line;
    let column = sLoc.column;

    // It should never be possible to start with }
    const pos = sLoc.start + column;
    const char = formattedMapping.getFormattedSlice(pos, pos + 1);
    if (char === '}') {
        // console.log(line, char);
        column += 1;
    }

    const eLoc = formattedMapping.getFormattedLocation(endOffset);
    const end = eLoc.start + eLoc.column;

    // console.log(startOffset, endOffset, sLoc);

    const execution = {
        // for start position
        column,
        value: count,
        // for end position
        end
    };

    const prevList = executionMap[line];
    if (prevList) {
        prevList.push(execution);
        return;
    }
    executionMap[line] = [execution];
};

const singleLineHandler = (sLoc, eLoc, coverage) => {
    // console.log(sLoc, eLoc);

    // nothing between
    if (sLoc.column >= eLoc.column) {
        return;
    }

    // console.log(sLoc, codeOffset, eLoc);

    if (sLoc.column === sLoc.indent && eLoc.column === eLoc.length) {
        // console.log('single', sLoc.line);
        setUncoveredLines(coverage, sLoc.line, 'uncovered');
        return;
    }

    // already uncovered, should not sub partial
    const prevUncovered = setUncoveredLines(coverage, sLoc.line, 'partial');
    if (prevUncovered) {
        // console.log(sLoc.line);
        return;
    }

    setUncoveredPieces(coverage, sLoc.line, {
        start: sLoc.column,
        end: eLoc.column
    });

};

const multipleLinesHandler = (sLoc, eLoc, coverage, formattedMapping) => {

    const firstELoc = {
        ... sLoc,
        column: sLoc.length
    };
    singleLineHandler(sLoc, firstELoc, coverage);


    for (let i = sLoc.line + 1; i < eLoc.line; i++) {

        // console.log('multiple', i);
        // if empty line
        const isEmpty = formattedMapping.isFormattedLineEmpty(i);
        if (isEmpty) {
            continue;
        }

        setUncoveredLines(coverage, i, 'uncovered');

    }

    const lastSLoc = {
        ... eLoc,
        column: eLoc.indent
    };
    singleLineHandler(lastSLoc, eLoc, coverage);

};

const rangeLinesHandler = (formattedMapping, start, end, coverage) => {
    const skipIndent = true;
    const sLoc = formattedMapping.getFormattedLocation(start, skipIndent);
    const eLoc = formattedMapping.getFormattedLocation(end, skipIndent);

    if (eLoc.line === sLoc.line) {
        singleLineHandler(sLoc, eLoc, coverage);
        return;
    }

    multipleLinesHandler(sLoc, eLoc, coverage, formattedMapping);

};

const getUncoveredFromCovered = (ranges, contentLength) => {
    const uncoveredRanges = [];
    if (!ranges || !ranges.length) {

        // nothing covered
        uncoveredRanges.push({
            start: 0,
            end: contentLength
        });

        return uncoveredRanges;
    }

    ranges.sort((a, b) => a.start - b.start);

    let pos = 0;
    ranges.forEach((range) => {
        if (range.start > pos) {
            uncoveredRanges.push({
                start: pos,
                end: range.start
            });
        }
        pos = range.end;
    });

    if (pos < contentLength) {
        uncoveredRanges.push({
            start: pos,
            end: contentLength
        });
    }

    return uncoveredRanges;
};


export const getCoverage = (item, formattedMapping) => {

    const source = item.source;
    const maxLength = source.length;

    const coverage = {
        totalLines: formattedMapping.formattedLines.length,
        uncoveredLines: {},
        uncoveredPieces: {},
        executionCounts: {}
    };

    // css, text, ranges: [ {start, end} ]
    // js, source, functions:[ {functionName, isBlockCoverage, ranges: [{startOffset, endOffset, count}] } ]
    if (item.type === 'css') {
        const ranges = getUncoveredFromCovered(item.ranges, maxLength);
        ranges.forEach((range) => {
            const { start, end } = range;
            rangeLinesHandler(formattedMapping, start, end, coverage);
        });

        return coverage;
    }

    const flatRanges = Util.getFlatRanges(item.functions);
    flatRanges.forEach((range) => {
        const {
            startOffset, endOffset, count
        } = range;
        if (count === 0) {
            rangeLinesHandler(formattedMapping, startOffset, endOffset, coverage);
        } else if (count > 1) {
            setExecutionCounts(formattedMapping, range, coverage);
        }
    });

    return coverage;

};

