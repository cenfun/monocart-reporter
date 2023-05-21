// https://playwright.dev/docs/api/class-coverage

// url, text, ranges: [ {start, end} ]
const getCssSummary = (item) => {

    const source = item.source;
    const total = source.length;

    let covered = 0;
    const ranges = item.ranges;
    if (ranges) {
        ranges.forEach((range) => {
            covered += range.end - range.start;
        });
    }

    const uncovered = total - covered;

    return {
        name: item.filename,
        type: item.type,
        url: item.url,
        total,
        covered,
        uncovered
    };

};

// url, scriptId, source, functions:[ {functionName, isBlockCoverage, ranges: [{startOffset, endOffset, count}] } ]
const getJsSummary = (item) => {

    const source = item.source;
    const total = source.length;

    const uncoveredRanges = item.ranges.filter((range) => range.count === 0);

    let uncovered = 0;

    let endPos = 0;
    uncoveredRanges.forEach((range) => {
        const { start, end } = range;

        if (start > endPos) {
            uncovered += end - start;
            endPos = end;
            return;
        }

        if (end <= endPos) {
            return;
        }

        uncovered += end - endPos;
        endPos = end;

    });

    const covered = total - uncovered;

    return {
        name: item.filename,
        type: item.type,
        url: item.url,
        total,
        covered,
        uncovered
    };
};

const getV8Summary = (item) => {
    if (item.type === 'css') {
        return getCssSummary(item);
    }
    return getJsSummary(item);
};

module.exports = {
    getV8Summary
};
