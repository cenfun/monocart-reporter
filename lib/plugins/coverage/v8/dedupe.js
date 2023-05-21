
const { sortRanges } = require('../coverage-utils.js');

const filterRanges = (ranges) => {
    // remove start = end
    return ranges.filter((range) => range.start < range.end);
};

// apply directly to css ranges
const dedupeRanges = (ranges) => {

    ranges = filterRanges(ranges);

    if (ranges.length < 2) {
        return ranges;
    }

    sortRanges(ranges);

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

// apply to js count ranges
const dedupeCountRanges = (ranges) => {

    // v8 ranges format
    // { startOffset: 0, endOffset: 6, count: 0 },
    // { startOffset: 0, endOffset: 6, count: 1 },
    // { startOffset: 0, endOffset: 297, count: 1 }

    // count ranges format
    // { start: 0, end: 6, count: 0 }

    ranges = filterRanges(ranges);

    if (ranges.length < 2) {
        return ranges;
    }

    sortRanges(ranges);

    // merge count for same range
    ranges.reduce((lastRange, range) => {
        if (range.start === lastRange.start && range.end === lastRange.end) {
            range.dedupe = true;
            lastRange.count += range.count;
            return lastRange;
        }
        return range;
    });

    ranges = ranges.filter((it) => !it.dedupe);

    // console.log('ranges length before', ranges.length);

    // connect uncovered ranges (count = 0)
    const coveredRanges = [];
    const uncoveredRanges = [];
    for (const range of ranges) {
        if (range.count > 0) {
            coveredRanges.push(range);
        } else {
            uncoveredRanges.push(range);
        }
    }

    ranges = [].concat(dedupeRanges(uncoveredRanges)).concat(coveredRanges);

    sortRanges(ranges);

    // console.log('ranges length after', ranges.length);

    return ranges;
};


module.exports = {
    dedupeRanges,
    dedupeCountRanges
};
