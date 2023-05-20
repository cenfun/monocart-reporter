import { Mapping } from 'monocart-formatter';
import Util from './util.js';

const setUncoveredLines = (coverage, line, value) => {
    const uncoveredMap = coverage.uncoveredLines;
    const prev = uncoveredMap[line];
    if (prev && prev !== value) {
        if (prev === 'uncovered' || prev === 'comment' || prev === 'blank') {
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

const setExecutionCounts = (mapping, range, coverage) => {
    const executionMap = coverage.executionCounts;

    const {
        startOffset, endOffset, count
    } = range;

    const skipIndent = true;
    const sLoc = mapping.getFormattedLocation(startOffset, skipIndent);
    const line = sLoc.line;
    let column = sLoc.column;

    // It should never be possible to start with }
    const pos = sLoc.start + column;
    const char = mapping.getFormattedSlice(pos, pos + 1);
    if (char === '}') {
        // console.log(line, char);
        column += 1;
    }

    const eLoc = mapping.getFormattedLocation(endOffset);
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

const multipleLinesHandler = (sLoc, eLoc, coverage, mapping) => {

    const firstELoc = {
        ... sLoc,
        column: sLoc.length
    };
    singleLineHandler(sLoc, firstELoc, coverage);

    for (let i = sLoc.line + 1; i < eLoc.line; i++) {
        setUncoveredLines(coverage, i, 'uncovered');
    }

    const lastSLoc = {
        ... eLoc,
        column: eLoc.indent
    };
    singleLineHandler(lastSLoc, eLoc, coverage);

};

const rangeLinesHandler = (mapping, start, end, coverage) => {
    const skipIndent = true;
    const sLoc = mapping.getFormattedLocation(start, skipIndent);
    const eLoc = mapping.getFormattedLocation(end, skipIndent);

    if (eLoc.line === sLoc.line) {
        singleLineHandler(sLoc, eLoc, coverage);
        return;
    }

    multipleLinesHandler(sLoc, eLoc, coverage, mapping);

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

export const getCoverage = (item, formattedContent, formattedMapping) => {

    const originalContent = item.source;
    const originalLength = originalContent.length;

    // parse commented and blank lines
    const parseLines = item.originalType !== 'html';
    const mapping = new Mapping(formattedContent, formattedMapping, parseLines);

    const formattedLines = mapping.formattedLines;
    const commentedLines = mapping.commentedLines;
    const blankLines = mapping.blankLines;

    const coverage = {
        totalLines: formattedLines.length,
        commentedLines: commentedLines.length,
        blankLines: blankLines.length,
        codeLines: formattedLines.length - commentedLines.length - blankLines.length,
        uncoveredLines: {},
        uncoveredPieces: {},
        executionCounts: {}
    };

    commentedLines.forEach((lineIndex) => {
        coverage.uncoveredLines[lineIndex] = 'comment';
    });
    blankLines.forEach((lineIndex) => {
        coverage.uncoveredLines[lineIndex] = 'blank';
    });

    // console.log(coverage);

    // css, text, ranges: [ {start, end} ]
    // js, source, functions:[ {functionName, isBlockCoverage, ranges: [{startOffset, endOffset, count}] } ]
    if (item.type === 'css') {
        const ranges = getUncoveredFromCovered(item.ranges, originalLength);
        ranges.forEach((range) => {
            const { start, end } = range;
            rangeLinesHandler(mapping, start, end, coverage);
        });

        return coverage;
    }

    const flatRanges = Util.getFlatRanges(item.functions);
    flatRanges.forEach((range) => {
        const {
            startOffset, endOffset, count
        } = range;
        if (count === 0) {
            rangeLinesHandler(mapping, startOffset, endOffset, coverage);
        } else if (count > 1) {
            setExecutionCounts(mapping, range, coverage);
        }
    });

    return coverage;

};

