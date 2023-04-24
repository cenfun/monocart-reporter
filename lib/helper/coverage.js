const fs = require('fs');
const path = require('path');
const EC = require('eight-colors');
const istanbulReports = require('istanbul-reports');
const {
    V8toIstanbul,
    istanbulLibCoverage,
    istanbulLibReport,
    mapFileCommentRegex
} = require('../runtime/monocart-coverage.js');

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

const saveReportAttachment = (testInfo, report, coverageDir) => {
    // save report
    const reportPath = path.resolve(coverageDir, 'coverage-report.json');
    Util.writeJSONSync(reportPath, report);

    testInfo.attachments.push({
        ... Util.attachments.coverage,
        path: path.resolve(coverageDir, 'index.html')
    });
};

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

const toIstanbulReport = async (list, testInfo, options, coverageDir) => {

    // filter do not support css
    list = list.filter((item) => item.type !== 'css');

    const coverageData = {};
    for (const item of list) {

        let source = item.source || item.text;

        //  remove sourcemap file
        // # sourceMappingURL=xxx.js.map
        source = source.replace(mapFileCommentRegex, '');

        const v8toIstanbul = new V8toIstanbul(item.filePath, 0, {
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

const generateV8Report = async (list, testInfo, coverageDir) => {

    const summary = {
        totalBytes: 0
    };
    const files = [];

    // url, scriptId, source, functions:[ {functionName, isBlockCoverage, ranges: [{start,end}] } ]
    const v8JsHandler = (item) => {

        const source = item.source;
        const totalBytes = source.length;
        summary.totalBytes += totalBytes;

        files.push({
            name: item.filename,
            type: item.type,
            url: item.url,
            totalBytes
        });
    };

    // url, text, ranges: [ {start, end} ]
    const v8CssHandler = (item) => {

        const source = item.text;
        const totalBytes = source.length;
        summary.totalBytes += totalBytes;

        files.push({
            name: item.filename,
            type: item.type,
            url: item.url,
            totalBytes
        });
    };

    // https://playwright.dev/docs/api/class-coverage
    for (const item of list) {
        if (item.source) {
            v8JsHandler(item);
        } else if (item.text) {
            v8CssHandler(item);
        }
    }

    const report = {
        type: 'v8',
        summary,
        files
    };

    saveReportAttachment(testInfo, report, coverageDir);

    return report;
};

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
    // save all source files
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

        const fileDir = path.resolve(sourceDir, dirname);
        if (!fs.existsSync(fileDir)) {
            fs.mkdirSync(fileDir, {
                recursive: true
            });
        }

        // const sourceDir = path.resolve(outputDir, dir);

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

        const filePath = path.resolve(fileDir, filename);

        const content = item.source || item.text;
        fs.writeFileSync(filePath, content);

        // console.log(`[MCR] coverage file saved: ${filename}`);

        item.filePath = filePath;

    });

    let report;
    if (options.toIstanbul) {
        report = await toIstanbulReport(list, testInfo, options, coverageDir);
    } else {
        report = await generateV8Report(list, testInfo, coverageDir);
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
