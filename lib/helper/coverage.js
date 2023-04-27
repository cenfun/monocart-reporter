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
    // save report
    const reportPath = path.resolve(coverageDir, 'coverage-report.json');
    Util.writeJSONSync(reportPath, report);

    testInfo.attachments.push({
        ... Util.attachments.coverage,
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

const generateIstanbulReport = (coverageData, testInfo, options, coverageDir) => {

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
        dir: coverageDir,
        coverageMap,
        ... options
    };

    // create a context for report generation
    const context = istanbulLibReport.createContext(contextOptions);

    const htmlReport = istanbulReports.create('html', {});
    htmlReport.execute(context);

    // add watermarks and color
    const coverageReport = new CoverageReport();
    coverageReport.execute(context);
    const report = coverageReport.getReport();

    saveReportAttachment(testInfo, report, coverageDir);

    return report;
};

// ========================================================================================================

const toIstanbulReport = async (list, testInfo, options, coverageDir) => {

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

    return generateIstanbulReport(coverageData, testInfo, options, coverageDir);

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

// url, scriptId, source, functions:[ {functionName, isBlockCoverage, ranges: [{startOffset, endOffset, count}] } ]
const getV8JsSummary = (item) => {

    const source = item.source;
    const total = source.length;

    let uncovered = 0;
    const functions = item.functions;
    if (functions) {
        functions.forEach((fun) => {
            const ranges = fun.ranges;
            if (ranges) {
                ranges.forEach((range) => {
                    if (range.count === 0) {
                        uncovered += range.endOffset - range.startOffset;
                    }
                });
            }
        });
    }

    const covered = total - uncovered;

    // console.log(item.filename, covered);

    return {
        name: item.filename,
        type: item.type,
        url: item.url,
        total,
        covered
    };
};

const saveV8HtmlReport = async (reportData, coverageDir, inline) => {

    //  coverage data
    const coverageDataFile = 'coverage-data.js';
    const reportDataStr = compress(JSON.stringify(reportData));
    const coverageData = `window.reportData = '${reportDataStr}';`;

    // js lib
    const coverageV8File = 'monocart-v8.js';
    const coverageV8Path = path.resolve(__dirname, `../runtime/${coverageV8File}`);
    const coverageV8Data = await Util.readFile(coverageV8Path);
    if (!coverageV8Data) {
        EC.logRed(`[MCR] not found runtime lib: ${Util.formatPath(coverageV8Path)}`);
    }

    // html content
    let htmlStr = '';
    if (inline) {
        htmlStr = ['<script>', coverageData, coverageV8Data, '</script>'].join('\n');
    } else {
        await Util.writeFile(path.resolve(coverageDir, coverageDataFile), coverageData);
        await Util.writeFile(path.resolve(coverageDir, coverageV8File), coverageV8Data);
        htmlStr = [
            `<script src="${coverageDataFile}"></script>`,
            `<script src="${coverageV8File}"></script>`
        ].join('\n');
    }

    // html
    const htmlPath = path.resolve(coverageDir, 'index.html');
    const template = Util.getTemplate(path.resolve(__dirname, '../default/template.html'));
    const html = Util.replace(template, {
        title: reportData.title,
        content: htmlStr
    });

    await Util.writeFile(htmlPath, html);

};

const generateV8Report = async (list, testInfo, options, coverageDir) => {

    options = {
        inline: true,
        watermarks: [50, 80],
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

    await saveV8HtmlReport(htmlReport, coverageDir, options.inline);

    const report = {
        type: 'v8',
        summary,
        files
    };

    saveReportAttachment(testInfo, report, coverageDir);

    return report;
};

// ========================================================================================================

const generateV8Coverage = async (list, testInfo, options, coverageDir) => {

    const sourceDir = path.resolve(testInfo.outputDir, 'source');
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
        report = await toIstanbulReport(list, testInfo, options, coverageDir);
    } else {
        report = await generateV8Report(list, testInfo, options, coverageDir);
    }

    // remove useless sourceDir after report generated
    fs.rmSync(sourceDir, {
        recursive: true,
        force: true
    });

    return report;
};

module.exports = (coverageInput, testInfo, options = {}) => {

    if (!coverageInput) {
        EC.logRed('[MCR] invalid coverage input');
        return;
    }

    const outputDir = testInfo.outputDir;
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, {
            recursive: true
        });
    }

    const coverageDir = path.resolve(outputDir, 'coverage');
    if (!fs.existsSync(coverageDir)) {
        fs.mkdirSync(coverageDir);
    }

    if (Array.isArray(coverageInput)) {
        return generateV8Coverage(coverageInput, testInfo, options, coverageDir);
    }

    return generateIstanbulReport(coverageInput, testInfo, options, coverageDir);
};
