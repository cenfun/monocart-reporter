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
        this.report = {};
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
        this.report = node.getCoverageSummary().data;
        this.addStatus(this.report);
    }

    onDetail(node) {
        const fileReport = node.getCoverageSummary().data;
        this.addStatus(fileReport);
        fileReport.name = node.getRelativeName();
        this.files.push(fileReport);
    }

    onEnd() {
        // console.log('onEnd');
    }

    getReport() {
        this.report.files = this.files;
        return this.report;
    }
}

const generateIstanbulCoverage = (coverageData, testInfo, options) => {

    const coverageDir = path.resolve(testInfo.outputDir, 'coverage');
    if (!fs.existsSync(coverageDir)) {
        fs.mkdirSync(coverageDir);
    }

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

    // save report
    const reportPath = path.resolve(coverageDir, 'coverage-report.json');
    Util.writeJSONSync(reportPath, report);

    testInfo.attachments.push({
        name: 'coverage',
        contentType: 'text/html',
        path: path.resolve(coverageDir, 'index.html')
    });

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

const generateV8Coverage = async (list, testInfo, options) => {

    const jsDir = path.resolve(testInfo.outputDir, 'js');
    if (!fs.existsSync(jsDir)) {
        fs.mkdirSync(jsDir);
    }

    const pathMap = {};
    // save files
    list.forEach((item, i) => {
        const url = getUrl(item.url);
        // console.log(url);

        let host = [url.hostname, url.port].filter((it) => it).join('-');
        if (!host) {
            host = 'anonymous';
        }

        let pathname = url.pathname;
        if (pathname.endsWith('/')) {
            pathname += 'index.js';
        }
        // except /
        pathname = pathname.replace(/[\\:*?"<>|]/g, '');

        const p = host + pathname;
        const dirname = path.dirname(p);
        // console.log('dirname', dirname);

        const fileDir = path.resolve(jsDir, dirname);
        if (!fs.existsSync(fileDir)) {
            fs.mkdirSync(fileDir, {
                recursive: true
            });
        }

        // const jsDir = path.resolve(outputDir, dir);

        let filename = path.basename(p);
        const extname = path.extname(filename);
        if (extname !== '.js') {
            filename += '.js';
        }

        // same filename in same dir, plus index number
        if (pathMap[`${dirname}/${filename}`]) {
            filename = `${path.basename(filename, '.js')}-${i}.js`;
        }
        pathMap[`${dirname}/${filename}`] = true;

        // console.log('filename', filename);

        const filePath = path.resolve(fileDir, filename);

        let source = item.source;
        //  remove sourcemap file
        // # sourceMappingURL=xxx.js.map
        source = source.replace(mapFileCommentRegex, '');
        item.source = source;

        fs.writeFileSync(filePath, source);

        // console.log(`[MCR] coverage file saved: ${filename}`);

        item.filePath = filePath;

    });

    const coverageData = {};
    for (const item of list) {

        const source = item.source;

        const v8toIstanbul = new V8toIstanbul(item.filePath, 0, {
            source
        });

        await v8toIstanbul.load().catch((e) => {
            EC.logRed('[MCR] v8toIstanbul.load:', e.message);
        });

        try {
            v8toIstanbul.applyCoverage(item.functions);
        } catch (e) {
            EC.logRed('[MCR] v8toIstanbul.applyCoverage:', e.message);
        }

        const data = v8toIstanbul.toIstanbul();
        Object.assign(coverageData, data);

    }

    const report = await generateIstanbulCoverage(coverageData, testInfo, options);

    // remove useless jsDir after Istanbul report generated
    fs.rmSync(jsDir, {
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

    if (Array.isArray(coverageInput)) {
        return generateV8Coverage(coverageInput, testInfo, options);
    }

    return generateIstanbulCoverage(coverageInput, testInfo, options);
};
