const Util = require('../../../utils/util.js');

// keep functions for istanbul
const dedupeFunctions = (functions) => {

    // { startOffset: 0, endOffset: 6, count: 0 },
    // { startOffset: 0, endOffset: 6, count: 0 },
    // { startOffset: 0, endOffset: 6, count: 1 },
    // { startOffset: 0, endOffset: 297, count: 1 }

    // already sort by startOffset, endOffset, count
    const flatRanges = Util.getFlatRanges(functions);

    if (flatRanges.length < 2) {
        return functions;
    }

    flatRanges.reduce((lastRange, range) => {
        if (range.startOffset === lastRange.startOffset && range.endOffset === lastRange.endOffset) {
            range.dedupe = true;
            lastRange.count += range.count;
            return lastRange;
        }
        return range;
    });

    // remove dedupe from last to first
    const fIndexes = [];
    functions.forEach((f, i) => {
        const rIndexes = [];
        const ranges = f.ranges;
        ranges.forEach((r, j) => {
            if (r.dedupe) {
                rIndexes.push(j);
            }
        });

        if (rIndexes.length === ranges.length) {
            fIndexes.push(i);
        } else {
            rIndexes.reverse();
            rIndexes.forEach((index) => {
                ranges.splice(index, 1);
            });
        }
    });
    fIndexes.reverse();
    fIndexes.forEach((index) => {
        functions.splice(index, 1);
    });

    return functions;
};

const dedupeRanges = (ranges) => {

    if (ranges.length < 2) {
        return ranges;
    }

    // sort
    ranges.sort((a, b) => {
        if (a.start === b.start) {
            return a.end - b.end;
        }
        return a.start - b.start;
    });

    ranges.reduce((prevRange, range) => {
        // same start
        if (range.start === prevRange.start) {
            range.dedupe = true;
            // equal prev
            if (range.end === prevRange.end) {
                return prevRange;
            }
            // great than the prev end, update the end
            prevRange.end = range.end;
            return prevRange;
        }

        // already in the range
        if (range.end <= prevRange.end) {
            range.dedupe = true;
            return prevRange;
        }

        // collected, update the end
        if (range.start <= prevRange.end) {
            range.dedupe = true;
            prevRange.end = range.end;
            return prevRange;
        }

        return range;
    });

    ranges = ranges.filter((it) => !it.dedupe);

    return ranges;
};


module.exports = {
    dedupeFunctions,
    dedupeRanges
};
