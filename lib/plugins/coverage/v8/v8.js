const path = require('path');
const Util = require('../../../utils/util.js');
const { unpackSourcemaps } = require('./sourcemap.js');
const { getV8Summary } = require('./v8-summary.js');
const { dedupeFunctions, dedupeRanges } = require('./dedupe.js');

const resolveUrl = (input) => {
    let url;
    try {
        url = new URL(input);
    } catch (e) {
        // console.error('error url', input);
        return;
    }
    return url;
};

const getSourcePath = (item, index) => {

    if (!item.url) {
        // anonymous scripts will have __playwright_evaluation_script__ as their URL.
        item.url = `file://anonymous-${index}.${item.type}`;
    }

    const url = resolveUrl(item.url);
    if (url) {
        const host = [url.hostname, url.port].filter((it) => it).join('-');
        // always start with '/'
        const pathname = url.pathname;
        let fullPath = host + pathname;
        // remove illegal characters except /
        fullPath = fullPath.replace(/[\\:*?"<>|]/g, '');
        // remove / of start, end or double
        const ls = fullPath.split('/').filter((it) => it);
        return ls.join('/');
    }

    return Util.relativePath(item.url);
};

// Unify the format of js and css
const initV8List = async (v8list, options) => {
    // filter no source or text and init type
    v8list = v8list.map((item) => {
        if (item.source && item.functions) {
            const {
                url, scriptId, source, functions
            } = item;
            return {
                url,
                scriptId,
                source,
                functions,
                type: 'js'
            };
        }
        if (item.text && item.ranges) {
            const {
                url, text, ranges
            } = item;
            return {
                url,
                source: text,
                ranges,
                type: 'css'
            };
        }
        // 404 css, text will be empty
        // EC.logRed(`[MCR] Invalid source: ${item.url}`);
        // console.log(item);
    }).filter((it) => it);

    // unpack source maps if options.sourceMap = true
    await unpackSourcemaps(v8list, options);

    // init list properties
    v8list.forEach((item, i) => {
        const sourcePath = getSourcePath(item, i + 1);
        const filename = path.basename(sourcePath);
        item.filename = filename;
        item.sourcePath = sourcePath;

        // console.log(sourcePath);

    });

    return v8list;
};

// ============================================================

// force to async
const mergeRanges = (ranges) => {
    // ranges: [ {start, end} ]
    return new Promise((resolve) => {
        ranges = dedupeRanges(ranges);

        console.log(ranges);

        resolve(ranges);
    });
};

const mergeFunctions = (functions) => {
    // functions:[ {functionName, isBlockCoverage, ranges: [{startOffset, endOffset, count}] } ]
    return new Promise((resolve) => {
        functions = dedupeFunctions(functions);

        resolve(functions);
    });
};

const mergeV8Item = async (lastItem, item) => {

    // console.log('merge v8 item', item.url);

    if (lastItem.type === 'css') {

        const ranges = [].concat(lastItem.ranges).concat(item.ranges);
        lastItem.ranges = await mergeRanges(ranges);

        return lastItem;
    }

    const functions = [].concat(lastItem.functions).concat(item.functions);
    lastItem.functions = await mergeFunctions(functions);

    return lastItem;
};

const mergeV8List = async (v8list, options) => {

    // sort by url
    v8list.sort((a, b) => {
        const au = a.url;
        const bu = b.url;
        if (au !== bu) {
            return au > bu ? 1 : -1;
        }
        return 0;
    });

    let lastItem = {};
    for (const item of v8list) {
        if (item.url === lastItem.url && item.type === lastItem.type) {
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

const saveV8HtmlReport = async (reportData, options) => {

    const reportDataFile = 'coverage-data.js';
    const jsFiles = ['monocart-code-viewer.js', 'monocart-formatter.js', 'monocart-v8.js'];

    const htmlPath = await Util.saveAttachmentHtmlReport(reportData, options, reportDataFile, jsFiles);

    return htmlPath;
};

const saveV8Report = async (v8list, options) => {
    options = {
        watermarks: [50, 80],
        inline: false,
        ... options
    };

    const watermarks = options.watermarks;
    const onEntry = options.onEntry;

    const summaryList = [];
    for (const [i, item] of v8list.entries()) {
        item.summary = getV8Summary(item);
        if (typeof onEntry === 'function') {
            await onEntry(item, i, v8list);
        }
        summaryList.push(item.summary);
    }

    // calculate pct, status and summary
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
