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
            this.parseCss(item.ranges, item.source.length);
        } else {
            this.parseJs(item.ranges);
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

    getUncoveredFromCovered(ranges, contentLength) {
        const uncoveredRanges = [];
        if (!ranges.length) {

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
    }

    // css, ranges: [ {start, end} ]
    parseCss(ranges, contentLength) {
        const uncoveredRanges = this.getUncoveredFromCovered(ranges, contentLength);
        uncoveredRanges.forEach((range) => {
            const { start, end } = range;
            this.setRangeLines(start, end);
        });

    }

    // js, source, ranges: [ {start, end, count} ]
    parseJs(ranges) {

        // no ranges mark all as covered
        if (!ranges.length) {
            return;
        }

        ranges.forEach((range) => {
            const {
                start, end, count
            } = range;
            if (count > 0) {
                if (count > 1) {
                    this.setExecutionCounts(start, end, count);
                }
            } else {
                // set uncovered first
                this.setRangeLines(start, end);
            }
        });

    }

    // ====================================================================================================

    setUncoveredLine(line, value) {
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

    setSingleLine(sLoc, eLoc) {
        // console.log(sLoc, eLoc);

        // nothing between
        if (sLoc.column >= eLoc.column) {
            return;
        }

        // console.log(sLoc, codeOffset, eLoc);

        if (sLoc.column === sLoc.indent && eLoc.column === eLoc.length) {
            // console.log('single', sLoc.line);
            this.setUncoveredLine(sLoc.line, 'uncovered');
            return;
        }

        // already uncovered/comment/blank, should not be partial
        const prev = this.setUncoveredLine(sLoc.line, 'partial');
        if (prev) {
            // console.log(sLoc.line, prev);
            return;
        }

        // set pieces for partial, only js
        this.setUncoveredPieces(sLoc.line, {
            start: sLoc.column,
            end: eLoc.column
        });

    }

    setMultipleLines(sLoc, eLoc) {

        const firstELoc = {
            ... sLoc,
            column: sLoc.length
        };
        this.setSingleLine(sLoc, firstELoc);

        for (let i = sLoc.line + 1; i < eLoc.line; i++) {
            this.setUncoveredLine(i, 'uncovered');
        }

        const lastSLoc = {
            ... eLoc,
            column: eLoc.indent
        };
        this.setSingleLine(lastSLoc, eLoc);

    }

    // ====================================================================================================

    setRangeLines(start, end) {
        const mapping = this.mapping;
        const skipIndent = true;
        const sLoc = mapping.getFormattedLocation(start, skipIndent);
        const eLoc = mapping.getFormattedLocation(end, skipIndent);

        if (eLoc.line === sLoc.line) {
            this.setSingleLine(sLoc, eLoc);
            return;
        }

        this.setMultipleLines(sLoc, eLoc);
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

