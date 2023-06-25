const EC = require('eight-colors');

const Util = require('../../../utils/util.js');
const { getV8Summary } = require('./v8-summary.js');
const { dedupeRanges } = require('../converter/dedupe.js');
const { getSourcePath } = require('../converter/source-path.js');
const { mergeScriptCovs } = require('../../../runtime/monocart-coverage.js');
const collectSourceMaps = require('../converter/collect-source-maps.js');

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

    const sourcePathHandler = options.sourcePath;

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

        let sourcePath = getSourcePath(data.url, i + 1, data.type);
        if (typeof sourcePathHandler === 'function') {
            const newSourcePath = sourcePathHandler(sourcePath);
            if (typeof newSourcePath === 'string' && newSourcePath) {
                sourcePath = newSourcePath;
            }
        }

        data.sourcePath = sourcePath;

        return data;
    });

    // collect sourcemap first
    await collectSourceMaps(v8list, options, inlineSourceMap);

    return v8list;
};

// ========================================================================================================

// force to async
const mergeCssRanges = (itemList) => {
    return new Promise((resolve) => {

        let concatRanges = [];
        itemList.forEach((item) => {
            concatRanges = concatRanges.concat(item.ranges);
        });

        // ranges: [ {start, end} ]
        const ranges = dedupeRanges(concatRanges);

        resolve(ranges || []);
    });
};

const mergeJsFunctions = (itemList) => {
    return new Promise((resolve) => {

        const res = mergeScriptCovs(itemList);
        const functions = res && res.functions;

        resolve(functions || []);
    });
};

const mergeV8Coverage = async (dataList, options) => {

    let list = [];
    dataList.forEach((d) => {
        list = list.concat(d.data);
    });

    // console.log('before merge', list.map((it) => it.url));

    // connect all functions and ranges
    const itemMap = {};
    const mergeMap = {};
    list.forEach((item) => {
        const { id } = item;
        const prev = itemMap[id];
        if (prev) {
            if (mergeMap[id]) {
                mergeMap[id].push(item);
            } else {
                mergeMap[id] = [prev, item];
            }
        } else {
            itemMap[id] = item;
        }
    });

    // merge functions and ranges
    const mergeIds = Object.keys(mergeMap);
    for (const id of mergeIds) {
        const itemList = mergeMap[id];
        const item = itemMap[id];
        if (item.type === 'js') {
            item.functions = await mergeJsFunctions(itemList);
        } else {
            item.ranges = await mergeCssRanges(itemList);
        }
    }

    list = Object.values(itemMap);

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
    mergeV8Coverage,
    saveV8Report
};
