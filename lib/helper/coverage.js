const fs = require('fs');
const path = require('path');
const EC = require('eight-colors');
const istanbulReports = require('istanbul-reports');
const {
    V8toIstanbul,
    istanbulLibCoverage,
    istanbulLibReport,
    mapFileCommentRegex
} = require('../runtime/monocart-istanbul.js');
const compress = require('lz-utils/lib/compress.js');

const Util = require('../utils/util.js');

const ReportBase = istanbulLibReport.ReportBase;
class CoverageReport extends ReportBase {

    onStart(root, context) {
        this.context = context;
        this.summary = {};
        this.files = [];
    }

    addStatus(data) {
        Object.keys(data).forEach((k) => {
            const item = data[k];
            // low, medium, high, unknown
            item.status = this.context.classForPercent(k, item.pct);
        });
    }

    onSummary(node) {
        if (!node.isRoot()) {
            return;
        }
        this.summary = node.getCoverageSummary().data;
        this.addStatus(this.summary);
    }

    onDetail(node) {
        const fileSummary = node.getCoverageSummary().data;
        this.addStatus(fileSummary);
        fileSummary.name = node.getRelativeName();
        this.files.push(fileSummary);
    }

    onEnd() {
        // console.log('onEnd');
    }

    getReport() {
        return {
            type: 'istanbul',
            summary: this.summary,
            files: this.files
        };
    }
}

// ========================================================================================================

const saveReportAttachment = (testInfo, report, coverageDir) => {

    const definition = Util.attachments.coverage;
    // save report
    const reportPath = path.resolve(coverageDir, definition.reportFile);
    Util.writeJSONSync(reportPath, report);

    testInfo.attachments.push({
        name: definition.name,
        contentType: definition.contentType,
        path: path.resolve(coverageDir, 'index.html')
    });
};

// anonymous scripts will have __playwright_evaluation_script__ as their URL.
const getUrl = (input) => {
    const defaultUrl = new URL('http://anonymous/anonymous.js');
    if (!input) {
        return defaultUrl;
    }
    let url;
    try {
        url = new URL(input);
    } catch (e) {
        return defaultUrl;
    }
    return url;
};

const getStatus = (value, watermarks) => {
    if (!watermarks) {
        return 'unknown';
    }
    if (value < watermarks[0]) {
        return 'low';
    }
    if (value >= watermarks[1]) {
        return 'high';
    }
    return 'medium';
};

// ========================================================================================================

const generateIstanbulReport = (coverageData, testInfo, options) => {

    // https://github.com/istanbuljs/istanbuljs/tree/master/packages/istanbul-lib-coverage
    const coverageMap = istanbulLibCoverage.createCoverageMap(coverageData);

    // https://github.com/istanbuljs/istanbuljs/tree/master/packages/istanbul-lib-report
    const contextOptions = {
        watermarks: {
            statements: [50, 80],
            functions: [50, 80],
            branches: [50, 80],
            lines: [50, 80]
        },
        // The summarizer to default to (may be overridden by some reports)
        // values can be nested/flat/pkg. Defaults to 'pkg'
        defaultSummarizer: 'nested',
        ... options,

        dir: options.coverageDir,
        coverageMap
    };

    // create a context for report generation
    const context = istanbulLibReport.createContext(contextOptions);

    const htmlReport = istanbulReports.create('html', {});
    htmlReport.execute(context);

    // add watermarks and color
    const coverageReport = new CoverageReport();
    coverageReport.execute(context);
    const report = coverageReport.getReport();

    saveReportAttachment(testInfo, report, options.coverageDir);

    return report;
};

// ========================================================================================================

const toIstanbulReport = async (list, testInfo, options) => {

    // filter do not support css
    list = list.filter((item) => item.type !== 'css');

    const coverageData = {};
    for (const item of list) {

        let source = item.source || item.text;

        //  remove sourcemap file
        // # sourceMappingURL=xxx.js.map
        source = source.replace(mapFileCommentRegex, '');

        const v8toIstanbul = new V8toIstanbul(item.sourcePath, 0, {
            source
        });

        await v8toIstanbul.load().catch((e) => {
            EC.logRed(`[MCR] ${item.filename} v8toIstanbul.load:`, e.message);
        });

        try {
            v8toIstanbul.applyCoverage(item.functions);
        } catch (e) {
            EC.logRed(`[MCR] ${item.filename} v8toIstanbul.applyCoverage:`, e.message);
        }

        const data = v8toIstanbul.toIstanbul();
        Object.assign(coverageData, data);

    }

    return generateIstanbulReport(coverageData, testInfo, options);

};

// ========================================================================================================

// https://playwright.dev/docs/api/class-coverage

// url, text, ranges: [ {start, end} ]
const getV8CssSummary = (item) => {

    const source = item.text;
    const total = source.length;

    let covered = 0;
    const ranges = item.ranges;
    if (ranges) {
        ranges.forEach((range) => {
            covered += range.end - range.start;
        });
    }

    return {
        name: item.filename,
        type: item.type,
        url: item.url,
        total,
        covered
    };

};


const appendResult = (end, count, result) => {
    const last = result[result.length - 1];
    if (last) {
        if (last.end === end) {
            return;
        }
        if (last.count === count) {
            last.end = end;
            return;
        }
    }
    result.push({
        end: end,
        count: count
    });
};

const convertToDisjointSegments = (ranges, contentLength) => {
    const result = [];
    const stack = [];
    for (const entry of ranges) {
        let top = stack[stack.length - 1];
        while (top && top.endOffset <= entry.startOffset) {
            appendResult(top.endOffset, top.count, result);
            stack.pop();
            top = stack[stack.length - 1];
        }
        appendResult(entry.startOffset, top ? top.count : 0, result);
        stack.push(entry);
    }

    for (let top = stack.pop(); top; top = stack.pop()) {
        appendResult(top.endOffset, top.count, result);
    }

    const last = result[result.length - 1];
    if (last && last.end < contentLength) {
        result.push({
            end: contentLength,
            count: 0
        });
    }

    return result;
};

// url, scriptId, source, functions:[ {functionName, isBlockCoverage, ranges: [{startOffset, endOffset, count}] } ]
const getV8JsSummary = (item) => {

    const source = item.source;
    const total = source.length;

    const flatRanges = Util.getFlatRanges(item.functions);
    const segments = convertToDisjointSegments(flatRanges, total);

    let covered = 0;
    let last = 0;
    segments.forEach((segment) => {
        if (segment.count) {
            const used = segment.end - last;
            covered += used;
        }
        last = segment.end;
    });

    return {
        name: item.filename,
        type: item.type,
        url: item.url,
        total,
        covered
    };
};

const saveV8HtmlReport = async (reportData, options) => {

    //  coverage data
    const reportDataFile = 'coverage-data.js';
    const reportDataCompressed = compress(JSON.stringify(reportData));
    const reportDataStr = `window.reportData = '${reportDataCompressed}';`;

    // js libs
    const assetsName = Util.getAssetsName();

    const reportCodeViewerFile = 'monocart-code-viewer.js';
    const reportCodeViewerPath = path.resolve(__dirname, `../runtime/${reportCodeViewerFile}`);
    const reportCodeViewerStr = await Util.readFile(reportCodeViewerPath);

    const reportFormatterFile = 'monocart-formatter.js';
    const reportFormatterPath = path.resolve(__dirname, `../runtime/${reportFormatterFile}`);
    const reportFormatterStr = await Util.readFile(reportFormatterPath);

    // report lib
    const reportV8File = 'monocart-v8.js';
    const reportV8Path = path.resolve(__dirname, `../runtime/${reportV8File}`);
    const reportV8Str = await Util.readFile(reportV8Path);

    // html content
    let htmlStr = '';
    const EOL = Util.getEOL();
    if (options.inline) {
        htmlStr = [
            '<script>',
            reportDataStr,
            reportCodeViewerStr,
            reportFormatterStr,
            reportV8Str,
            '</script>'
        ].join(EOL);
    } else {
        await Util.writeFile(path.resolve(options.coverageDir, reportDataFile), reportDataStr);
        await Util.writeCommonFile(path.resolve(options.outputDir, assetsName, reportCodeViewerFile), reportCodeViewerStr);
        await Util.writeCommonFile(path.resolve(options.outputDir, assetsName, reportFormatterFile), reportFormatterStr);
        await Util.writeCommonFile(path.resolve(options.outputDir, assetsName, reportV8File), reportV8Str);
        htmlStr = [
            `<script src="${reportDataFile}"></script>`,
            `<script src="../${assetsName}/${reportCodeViewerFile}"></script>`,
            `<script src="../${assetsName}/${reportFormatterFile}"></script>`,
            `<script src="../${assetsName}/${reportV8File}"></script>`
        ].join(EOL);
    }

    // html
    const htmlPath = path.resolve(options.coverageDir, 'index.html');
    const template = Util.getTemplate(path.resolve(__dirname, '../default/template.html'));
    const html = Util.replace(template, {
        title: reportData.title,
        content: htmlStr
    });

    await Util.writeFile(htmlPath, html);

};

const generateV8Report = async (list, testInfo, options) => {

    options = {
        watermarks: [50, 80],
        inline: false,
        ... options
    };

    const files = [];
    for (const item of list) {
        const fileSummary = item.type === 'css' ? getV8CssSummary(item) : getV8JsSummary(item);
        files.push(fileSummary);
        item.summary = fileSummary;
    }

    // calculate pct, status and summary
    let total = 0;
    let covered = 0;
    files.forEach((item) => {

        total += item.total;
        covered += item.covered;

        item.pct = Util.PF(item.covered, item.total, 2, '');
        item.status = getStatus(item.pct, options.watermarks);

    });

    const pct = Util.PF(covered, total, 2, '');
    const status = getStatus(pct, options.watermarks);

    const summary = {
        total,
        covered,
        pct,
        status
    };

    const htmlReport = {
        title: `Coverage Report - ${testInfo.title}`,
        summary,
        files: list
    };

    await saveV8HtmlReport(htmlReport, options);

    const report = {
        type: 'v8',
        summary,
        files
    };

    saveReportAttachment(testInfo, report, options.coverageDir);

    return report;
};

// ========================================================================================================

const generateV8Coverage = async (list, testInfo, options) => {

    // temp dir will be removed after finish
    const sourceDir = path.resolve(options.coverageDir, 'source');
    if (!fs.existsSync(sourceDir)) {
        fs.mkdirSync(sourceDir);
    }

    // filter no source or text and init type extname
    list = list.filter((item) => {
        if (item.source) {
            item.type = 'js';
            item.extname = '.js';
            return true;
        }
        if (item.text) {
            item.type = 'css';
            item.extname = '.css';
            return true;
        }
    });

    const pathMap = {};
    // init list properties
    list.forEach((item, i) => {
        const url = getUrl(item.url);
        // console.log(url);

        let host = [url.hostname, url.port].filter((it) => it).join('-');
        if (!host) {
            host = 'anonymous';
        }

        let pathname = url.pathname;
        if (pathname.endsWith('/')) {
            pathname += `index${item.extname}`;
        }
        // except /
        pathname = pathname.replace(/[\\:*?"<>|]/g, '');

        const p = host + pathname;
        const dirname = path.dirname(p);
        // console.log('dirname', dirname);

        item.dirname = dirname;
        // ============================================================

        const extname = item.extname;
        let filename = path.basename(p);
        const ext = path.extname(filename);
        if (ext !== extname) {
            filename += extname;
        }

        // same filename in same dir, plus index number
        if (pathMap[`${dirname}/${filename}`]) {
            filename = `${path.basename(filename, extname)}-${i}${extname}`;
        }
        pathMap[`${dirname}/${filename}`] = true;

        // console.log('filename', filename);
        item.filename = filename;
        // ============================================================

        // source file path
        const fileDir = path.resolve(sourceDir, dirname);
        item.sourcePath = path.resolve(fileDir, filename);

    });

    // save all sources
    for (const item of list) {
        const content = item.source || item.text;
        await Util.writeFile(item.sourcePath, content);
        // console.log(`[MCR] coverage file saved: ${filename}`);

        // debug: write json
        // fs.writeFileSync(`${sourcePath}.json`, JSON.stringify(item, null, 4));
    }

    let report;
    if (options.toIstanbul) {
        report = await toIstanbulReport(list, testInfo, options);
    } else {
        report = await generateV8Report(list, testInfo, options);
    }

    // remove useless sourceDir after report generated
    fs.rmSync(sourceDir, {
        recursive: true,
        force: true
    });

    return report;
};

/**
 * @parameters
 * (@input istanbul.__coverage__: Object, testInfo, options: { watermarks: {} }) -> @output istanbul report
 * (@input v8list: Array, testInfo, options: { toIstanbul: true, watermarks: {} }) -> @output istanbul report (without css supported)
 * (@input v8list: Array, testInfo, options: { watermarks: [], inline: Boolean }) -> @output v8 report (css supported and minified code formatting)
 */
const attachCoverageReport = (coverageInput, testInfo, options = {}) => {

    if (!coverageInput) {
        EC.logRed('[MCR] invalid coverage input');
        return;
    }

    // TODO append to global


    options = {
        outputDir: Util.getOutputDir(testInfo),
        outputName: `coverage-${Util.shortTestId(testInfo.testId)}`,

        // istanbul
        // watermarks: {},

        // v8
        // watermarks: [50,80],
        toIstanbul: false,
        inline: false,

        ... options
    };

    const coverageDir = path.resolve(options.outputDir, options.outputName);
    if (!fs.existsSync(coverageDir)) {
        fs.mkdirSync(coverageDir, {
            recursive: true
        });
    }
    options.coverageDir = coverageDir;

    if (Array.isArray(coverageInput)) {
        return generateV8Coverage(coverageInput, testInfo, options);
    }

    return generateIstanbulReport(coverageInput, testInfo, options);
};


module.exports = {
    attachCoverageReport
};
