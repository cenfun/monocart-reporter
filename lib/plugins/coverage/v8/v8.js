const path = require('path');
const Util = require('../../../utils/util.js');
const { unpackSourceMaps } = require('./source-map.js');
const { getV8Summary } = require('./v8-summary.js');
const { dedupeCountRanges, dedupeRanges } = require('./dedupe.js');
const { sortRanges, getSourcePath } = require('../coverage-utils.js');

// convert functions to ranges
const initCountRanges = (functions) => {
    const ranges = [];

    for (const fun of functions) {
        if (fun.ranges) {
            for (const range of fun.ranges) {
                // rename startOffset/endOffset to start/end, keep count
                ranges.push({
                    start: range.startOffset,
                    end: range.endOffset,
                    count: range.count
                });
            }
        }
    }

    sortRanges(ranges);

    return {
        ranges
    };
};

// Unify the format of js and css
const initV8List = async (v8list, options) => {

    // filter list
    const entryFilter = options.entryFilter;
    if (typeof entryFilter === 'function') {
        v8list = v8list.filter(entryFilter);
    }

    // filter no source or text and init type
    v8list = v8list.map((item) => {
        if (typeof item.source === 'string' && item.functions) {
            const {
                url, source, functions
            } = item;

            // functions to ranges
            const { ranges } = initCountRanges(functions);

            return {
                url,
                type: 'js',
                ranges,
                source
            };
        }
        if (typeof item.text === 'string' && item.ranges) {
            const {
                url, text, ranges
            } = item;
            // rename text to source
            return {
                url,
                type: 'css',
                ranges,
                source: text
            };
        }
        // 404 css, text will be empty
        // EC.logRed(`[MCR] Invalid source: ${item.url}`);
        // console.log(item);
    }).filter((it) => it);

    // unpack source maps if options.unpackSourceMap = true
    await unpackSourceMaps(v8list, options);

    // init list properties
    v8list.forEach((item, i) => {
        if (!item.sourcePath) {
            item.sourcePath = getSourcePath(item.url, i + 1, item.type);
        }
        item.filename = path.basename(item.sourcePath);
        item.id = Util.calculateSha1(item.url + item.source);
    });

    v8list = await mergeV8List(v8list, options);

    return v8list;
};

// ============================================================

// force to async
const mergeV8Item = (lastItem, item) => {
    return new Promise((resolve) => {
        const concatRanges = [].concat(lastItem.ranges).concat(item.ranges);
        if (lastItem.type === 'css') {
            // ranges: [ {start, end} ]
            lastItem.ranges = dedupeRanges(concatRanges);
        } else {
            // ranges: [ {start, end, count} ]
            lastItem.ranges = dedupeCountRanges(concatRanges);
        }
        resolve(lastItem);
    });
};

const mergeV8List = async (v8list, options) => {

    // sort by id, id is hash from url and source
    v8list.sort((a, b) => {
        return a.id > b.id ? 1 : -1;
    });

    let lastItem = {};
    for (const item of v8list) {
        if (item.id === lastItem.id) {
            item.dedupe = true;
            lastItem = await mergeV8Item(lastItem, item);
            continue;
        }
        lastItem = item;
    }

    const list = v8list.filter((it) => !it.dedupe);

    // console.log(list.map((it) => it.url));

    return list;
};

// ============================================================

const saveV8HtmlReport = async (reportData, _options) => {

    const {
        htmlDir, outputDir, inline
    } = _options;

    const options = {
        inline,
        reportData,
        jsFiles: ['monocart-code-viewer.js', 'monocart-formatter.js', 'monocart-common.js', 'monocart-v8.js'],
        htmlDir,
        htmlFile: 'index.html',

        outputDir,
        reportDataFile: 'coverage-data.js',
        assetsName: 'assets',
        assetsRelative: '../'
    };

    const htmlPath = await Util.saveHtmlReport(options);

    return htmlPath;
};

const saveV8Report = async (v8list, options) => {
    options = {

        watermarks: [50, 80],
        inline: false,

        ... options
    };

    const watermarks = options.watermarks;

    // init summary
    v8list.forEach((entry) => {
        entry.summary = getV8Summary(entry);
    });

    // calculate pct, status and summary
    const summaryList = v8list.map((entry) => entry.summary);
    let total = 0;
    let covered = 0;
    summaryList.forEach((item) => {

        total += item.total;
        covered += item.covered;

        item.pct = Util.PNF(item.covered, item.total, 2);
        item.status = Util.getStatus(item.pct, watermarks);

    });

    const uncovered = total - covered;

    const pct = Util.PNF(covered, total, 2);
    const status = Util.getStatus(pct, watermarks);

    const summary = {
        total,
        covered,
        uncovered,
        pct,
        status
    };

    const htmlReport = {
        title: options.title,
        watermarks,
        summary,
        files: v8list
    };

    const htmlPath = await saveV8HtmlReport(htmlReport, options);

    const report = {
        title: options.title,
        type: 'v8',
        htmlPath,
        watermarks,
        summary,
        files: summaryList
    };

    return report;
};

module.exports = {
    initV8List,
    mergeV8List,
    saveV8Report
};
