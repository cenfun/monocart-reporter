const EC = require('eight-colors');

const Util = require('../../../utils/util.js');
const { getV8Summary } = require('./v8-summary.js');
// const { dedupeCountRanges, dedupeRanges } = require('./dedupe.js');
const { getSourcePath, convertFunctionsToRanges } = require('../coverage-utils.js');
const { collectSourceMaps, unpackSourceMaps } = require('./source-map.js');
const { mergeScriptCovs } = require('../../../runtime/monocart-coverage.js');


// ========================================================================================================

const initV8ListAndSourcemap = async (v8list, options, inlineSourceMap) => {

    // filter list first
    const entryFilter = options.entryFilter;
    if (typeof entryFilter === 'function') {
        v8list = v8list.filter(entryFilter);
    }

    // filter no source or text
    // init type and css source from text
    // keep functions

    v8list = v8list.filter((item) => {
        if (typeof item.source === 'string' && item.functions) {
            return true;
        }
        if (typeof item.text === 'string' && item.ranges) {
            return true;
        }
        // 404 css, text will be empty
        // EC.logRed(`[MCR] Invalid source: ${item.url}`);
        // console.log(item);
    });


    // do not change original v8list, to work for multiple APIs

    // init id, sourcePath
    v8list = v8list.map((item, i) => {

        const data = {
            url: item.url
        };

        if (item.functions) {
            data.type = 'js';
            data.functions = item.functions;
            data.source = item.source;
            // useless here
            // data.scriptId = item.scriptId;
        } else if (item.ranges) {
            data.type = 'css';
            data.ranges = item.ranges;
            data.source = item.text;
        }

        data.id = Util.calculateSha1(data.url + data.source);
        data.sourcePath = getSourcePath(data.url, i + 1, data.type);

        return data;
    });

    // collect sourcemap first
    await collectSourceMaps(v8list, options, inlineSourceMap);

    return v8list;
};

// ========================================================================================================

const unpackV8List = async (v8list, options) => {
    v8list.forEach((item, i) => {
        if (item.type === 'js') {
            item.ranges = convertFunctionsToRanges(item.functions);
            delete item.functions;
        }
    });

    // requires ranges before unpack
    await unpackSourceMaps(v8list, options);

    // console.log(v8list.length);
};

// ========================================================================================================

const mergeV8Coverage = async (dataList, options) => {

    let list = [];
    dataList.forEach((d) => {
        list = list.concat(d.data);
    });

    // console.log('before merge', list.map((it) => it.url));

    // connect all functions and ranges
    const mapItem = {};
    const mapMerge = {};
    list.forEach((item) => {
        const { id } = item;
        const prev = mapItem[id];
        if (prev) {
            if (mapMerge[id]) {
                mapMerge[id].push(item);
            } else {
                mapMerge[id] = [prev, item];
            }
        } else {
            mapItem[id] = item;
        }
    });

    // merge functions and ranges
    Object.keys(mapMerge).forEach((id) => {
        const item = mapItem[id];
        const ls = mapMerge[id];
        if (item.type === 'js') {
            const res = mergeScriptCovs(ls);
            if (res) {
                item.functions = res.functions;
            }
        } else {
            // TODO merge css ranges

        }
    });

    list = Object.values(mapItem);

    // try to load coverage and source by id
    for (const item of list) {
        const { id } = item;
        const sourcePath = Util.resolveArtifactSourcePath(options.artifactsDir, id);
        const content = await Util.readFile(sourcePath);
        if (content) {
            const json = JSON.parse(content);
            item.source = json.source;
            item.sourceMap = json.sourceMap;
        } else {
            EC.logRed(`[MCR] failed to read source: ${item.url}`);
            item.source = '';
        }
    }

    return list;
};


// ========================================================================================================

// force to async
// const mergeV8Item = (lastItem, item) => {
//     return new Promise((resolve) => {
//         const concatRanges = [].concat(lastItem.ranges).concat(item.ranges);
//         if (lastItem.type === 'css') {
//             // ranges: [ {start, end} ]
//             lastItem.ranges = dedupeRanges(concatRanges);
//         } else {
//             // ranges: [ {start, end, count} ]
//             lastItem.ranges = dedupeCountRanges(concatRanges);
//         }
//         resolve(lastItem);
//     });
// };

// const mergeV8List = async (v8list, options) => {

//     // sort by id, id is hash from url and source
//     v8list.sort((a, b) => {
//         return a.id > b.id ? 1 : -1;
//     });

//     let lastItem = {};
//     for (const item of v8list) {
//         if (item.id === lastItem.id) {
//             item.dedupe = true;
//             lastItem = await mergeV8Item(lastItem, item);
//             continue;
//         }
//         lastItem = item;
//     }

//     const list = v8list.filter((it) => !it.dedupe);

//     // console.log(list.map((it) => it.url));

//     return list;
// };

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
    initV8ListAndSourcemap,
    unpackV8List,
    mergeV8Coverage,
    saveV8Report
};
