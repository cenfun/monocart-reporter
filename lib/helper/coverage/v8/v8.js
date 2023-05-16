const path = require('path');
const Util = require('../../../utils/util.js');
const { unpackSourcemaps } = require('./sourcemap.js');
const { getCoverageSummary } = require('./v8-summary.js');

// Unify the format of js and css
const initV8List = async (v8list, options) => {
    // filter no source or text and init type extname
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
                type: 'js',
                extname: '.js'
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
                type: 'css',
                extname: '.css'
            };
        }
        // 404 css, text will be empty
        // EC.logRed(`[MCR] Invalid source: ${item.url}`);
        // console.log(item);
    }).filter((it) => it);

    // unpack source maps if options.sourceMap = true
    await unpackSourcemaps(v8list, options);


    const map = {};

    // init list properties
    v8list.forEach((item, i) => {
        // console.log(url);
        const url = Util.getUrl(item.url);

        let host = [url.hostname, url.port].filter((it) => it).join('-');
        if (!host) {
            host = 'anonymous';
        }

        // always start with '/'
        let pathname = url.pathname;
        if (pathname.endsWith('/')) {
            pathname += `index${item.extname}`;
        }
        // except /
        pathname = pathname.replace(/[\\:*?"<>|]/g, '');

        const fullPath = host + pathname;
        const dirname = path.dirname(fullPath);

        // ============================================================

        let filename = path.basename(fullPath);
        let sourcePath = `${dirname}/${filename}`;

        // source path exists
        if (map[sourcePath]) {
            const extname = item.extname;
            filename = `${path.basename(filename, extname)}-${i}${extname}`;
            sourcePath = `${dirname}/${filename}`;
        }

        map[sourcePath] = true;

        // console.log('filename', filename);
        item.filename = filename;
        item.sourcePath = sourcePath;

    });

    return v8list;
};

const mergeV8List = (v8list, options) => {

    // sort by url
    v8list.sort((a, b) => {
        const au = a.url;
        const bu = b.url;
        if (au !== bu) {
            return au > bu ? 1 : -1;
        }
        return 0;
    });

    v8list.forEach((item) => {
        // console.log(item.url);
    });

    return v8list;
};

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

    const summaryList = [];
    for (const item of v8list) {
        item.summary = getCoverageSummary(item);
        summaryList.push(item.summary);
    }

    // calculate pct, status and summary
    let total = 0;
    let covered = 0;
    summaryList.forEach((item) => {

        total += item.total;
        covered += item.covered;

        item.pct = Util.PNF(item.covered, item.total, 2);
        item.status = Util.getStatus(item.pct, options.watermarks);

    });

    const uncovered = total - covered;

    const pct = Util.PNF(covered, total, 2);
    const status = Util.getStatus(pct, options.watermarks);

    const summary = {
        total,
        covered,
        uncovered,
        pct,
        status
    };

    const htmlReport = {
        title: options.title,
        summary,
        files: v8list
    };

    const htmlPath = await saveV8HtmlReport(htmlReport, options);

    const report = {
        type: 'v8',
        htmlPath,
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
