const Util = require('../../../utils/util.js');


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

    const flatRanges = Util.getFlatRanges(item.functions);
    const uncoveredRanges = flatRanges.filter((range) => range.count === 0);

    // if (item.url.endsWith('const.js')) {
    //     console.log('==============================================');
    //     console.log(flatRanges, uncoveredRanges);
    //     console.log('==============================================');
    // }

    let uncovered = 0;

    let endPos = 0;
    uncoveredRanges.forEach((range) => {
        const { startOffset, endOffset } = range;

        if (startOffset > endPos) {
            uncovered += endOffset - startOffset;
            endPos = endOffset;
            return;
        }

        if (endOffset <= endPos) {
            return;
        }

        uncovered += endOffset - endPos;
        endPos = endOffset;

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

const getCoverageSummary = (item) => {
    if (item.type === 'css') {
        return getCssSummary(item);
    }
    return getJsSummary(item);
};

module.exports = {
    getCoverageSummary
};
