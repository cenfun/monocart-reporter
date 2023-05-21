import { Mapping } from 'monocart-formatter';
class CoverageParser {

    constructor(item, formattedContent, formattedMapping) {

        this.uncoveredLines = {};
        this.uncoveredPieces = {};
        this.executionCounts = {};

        // parse commented and blank lines, include vue html for now
        const parseLines = true;
        const mapping = new Mapping(formattedContent, formattedMapping, parseLines);
        this.mapping = mapping;

        const formattedLines = mapping.formattedLines;
        const commentedLines = mapping.commentedLines;
        const blankLines = mapping.blankLines;

        commentedLines.forEach((lineIndex) => {
            this.uncoveredLines[lineIndex] = 'comment';
        });

        blankLines.forEach((lineIndex) => {
            this.uncoveredLines[lineIndex] = 'blank';
        });

        if (item.type === 'css') {
            this.parseCss(item.ranges, formattedLines);
        } else {
            this.parseJs(item.ranges, formattedLines);
        }

        // remove all covered lines
        const uncoveredLines = {};
        Object.keys(this.uncoveredLines).forEach((line) => {
            const v = this.uncoveredLines[line];
            if (v === 'covered') {
                return;
            }
            uncoveredLines[line] = v;
        });

        // console.log(uncoveredLines);

        this.uncoveredLines = uncoveredLines;

        this.coverage = {
            totalLines: formattedLines.length,
            commentedLines: commentedLines.length,
            blankLines: blankLines.length,
            codeLines: formattedLines.length - commentedLines.length - blankLines.length,
            uncoveredLines: this.uncoveredLines,
            uncoveredPieces: this.uncoveredPieces,
            executionCounts: this.executionCounts
        };

    }

    // ====================================================================================================

    // css, ranges: [ {start, end} ]
    parseCss(ranges, formattedLines) {

        ranges.forEach((range) => {
            const { start, end } = range;
            this.setRangeLines(start, end, 'covered');
        });

        // left are uncovered lines
        formattedLines.forEach((line, i) => {
            if (!this.uncoveredLines[i]) {
                this.uncoveredLines[i] = 'uncovered';
            }
        });
    }

    // js, source, ranges: [ {start, end, count} ]
    parseJs(ranges, formattedLines) {

        // no functions mark all as covered
        if (!ranges.length) {
            return;
        }

        const coveredRanges = [];
        ranges.forEach((range) => {
            const {
                start, end, count
            } = range;
            if (count > 0) {
                coveredRanges.push(range);
                if (count > 1) {
                    this.setExecutionCounts(start, end, count);
                }
            } else {
                // set uncovered first
                this.setRangeLines(start, end, 'uncovered');
            }
        });

        // then set all covered
        coveredRanges.forEach((range) => {
            const { start, end } = range;
            this.setRangeLines(start, end, 'covered');
        });

        // left are uncovered lines
        formattedLines.forEach((line, i) => {
            if (!this.uncoveredLines[i]) {
                this.uncoveredLines[i] = 'uncovered';
            }
        });

    }

    // ====================================================================================================

    setUncoveredLines(line, value) {
        const prev = this.uncoveredLines[line];
        if (prev) {
            return prev;
        }
        this.uncoveredLines[line] = value;
    }

    setUncoveredPieces(line, value) {
        const prevList = this.uncoveredPieces[line];
        if (prevList) {
            prevList.push(value);
            return;
        }
        this.uncoveredPieces[line] = [value];
    }

    setSingleLine(sLoc, eLoc, value) {
        // console.log(sLoc, eLoc);

        // nothing between
        if (sLoc.column >= eLoc.column) {
            return;
        }

        // console.log(sLoc, codeOffset, eLoc);

        if (sLoc.column === sLoc.indent && eLoc.column === eLoc.length) {
            // console.log('single', sLoc.line);
            this.setUncoveredLines(sLoc.line, value);
            return;
        }

        // already uncovered/comment/blank, should not be partial
        const prev = this.setUncoveredLines(sLoc.line, 'partial');
        if (prev) {
            // console.log(sLoc.line, prev);
            return;
        }

        if (value === 'uncovered') {
            // set pieces for partial, only js
            this.setUncoveredPieces(sLoc.line, {
                start: sLoc.column,
                end: eLoc.column
            });
            return;
        }

        // const text = sLoc.text.slice(sLoc.column, eLoc.column);
        //  console.log('covered', sLoc.line + 1, sLoc.column, eLoc.column, text);

        this.setUncoveredPieces(sLoc.line, {
            start: sLoc.indent,
            end: sLoc.column
        });


    }

    setMultipleLines(sLoc, eLoc, value) {

        const firstELoc = {
            ... sLoc,
            column: sLoc.length
        };
        this.setSingleLine(sLoc, firstELoc, value);

        for (let i = sLoc.line + 1; i < eLoc.line; i++) {
            this.setUncoveredLines(i, value);
        }

        const lastSLoc = {
            ... eLoc,
            column: eLoc.indent
        };
        this.setSingleLine(lastSLoc, eLoc, value);

    }

    // ====================================================================================================

    setRangeLines(start, end, value) {
        const mapping = this.mapping;
        const skipIndent = true;
        const sLoc = mapping.getFormattedLocation(start, skipIndent);
        const eLoc = mapping.getFormattedLocation(end, skipIndent);

        if (eLoc.line === sLoc.line) {
            this.setSingleLine(sLoc, eLoc, value);
            return;
        }

        this.setMultipleLines(sLoc, eLoc, value);
    }

    // ====================================================================================================

    // only for js
    setExecutionCounts(start, end, count) {

        const mapping = this.mapping;

        const skipIndent = true;
        const sLoc = mapping.getFormattedLocation(start, skipIndent);
        const line = sLoc.line;
        let column = sLoc.column;

        // It should never be possible to start with }
        const pos = sLoc.start + column;
        const char = mapping.getFormattedSlice(pos, pos + 1);
        if (char === '}') {
        // console.log(line, char);
            column += 1;
        }

        const eLoc = mapping.getFormattedLocation(end);
        const endPos = eLoc.start + eLoc.column;

        // console.log(start, end, sLoc);

        const execution = {
        // for start position
            column,
            value: count,
            // for end position
            end: endPos
        };

        const prevList = this.executionCounts[line];
        if (prevList) {
            prevList.push(execution);
            return;
        }
        this.executionCounts[line] = [execution];
    }
}

export const getCoverage = (item, formattedContent, formattedMapping) => {
    const parser = new CoverageParser(item, formattedContent, formattedMapping);
    return parser.coverage;
};

