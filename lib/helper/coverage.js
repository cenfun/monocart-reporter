const fs = require('fs');
const path = require('path');
const EC = require('eight-colors');

const istanbulReports = require('istanbul-reports');
const {
    V8toIstanbul,
    istanbulLibCoverage,
    istanbulLibReport,
    convertSourceMap
} = require('../runtime/monocart-coverage.js');

const Util = require('../utils/util.js');
const CoverageReport = require('./coverage/coverage-report.js');
const { getCoverageSummary } = require('./coverage/coverage-summary.js');
const { unpackSourcemaps } = require('./coverage/sourcemap.js');

// high performance
// str.search(reg) -> index
// reg.test(str) -> boolean
// for sourceMap = true
const defaultSourceFilter = function(sourceName) {
    const srcReg = /\/src\/.+/g;
    return srcReg.test(sourceName);
};

// ========================================================================================================

const saveReportAttachment = (testInfo, report, htmlDir) => {

    const definition = Util.attachments.coverage;
    // save report
    const reportPath = path.resolve(htmlDir, definition.reportFile);
    Util.writeJSONSync(reportPath, report);

    testInfo.attachments.push({
        name: definition.name,
        contentType: definition.contentType,
        path: path.resolve(htmlDir, 'index.html')
    });
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

const generateIstanbulReport = (coverageMap, testInfo, options, fileSources = {}) => {

    // console.log('all file sources', Object.keys(fileSources));

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

        dir: options.htmlDir,
        sourceFinder: (filePath) => {

            // console.log(`find file source: ${filePath}`);

            if (typeof options.sourceFinder === 'function') {
                const source = options.sourceFinder(filePath);
                if (source) {
                    return source;
                }
            }

            if (fileSources) {
                const source = fileSources[filePath];
                if (source) {
                    return source;
                }
            }

            if (fs.existsSync(filePath)) {
                return fs.readFileSync(filePath, 'utf8');
            }

            return `Not found source file: ${filePath}`;
        },
        coverageMap
    };

    // create a context for report generation
    const context = istanbulLibReport.createContext(contextOptions);

    const htmlReport = istanbulReports.create('html', {});
    htmlReport.execute(context);

    if (options.lcov) {
        const lcovReport = istanbulReports.create('lcovonly', {});
        lcovReport.execute(context);
    }

    // add watermarks and color
    const coverageReport = new CoverageReport();
    coverageReport.execute(context);
    const report = coverageReport.getReport();

    saveReportAttachment(testInfo, report, options.htmlDir);

    return report;
};

// ========================================================================================================

const toIstanbulReport = async (v8list, testInfo, options, fileSources) => {

    // filter do not support css
    v8list = v8list.filter((item) => item.type !== 'css');

    // https://github.com/istanbuljs/istanbuljs/tree/master/packages/istanbul-lib-coverage
    const coverageMap = istanbulLibCoverage.createCoverageMap();

    for (const item of v8list) {

        let source = item.source;

        //  remove sourcemap file
        source = convertSourceMap.removeMapFileComments(source);

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

        coverageMap.merge(v8toIstanbul.toIstanbul());

    }

    return generateIstanbulReport(coverageMap, testInfo, options, fileSources);

};

// ========================================================================================================


const saveV8HtmlReport = async (reportData, options) => {

    const reportDataFile = 'coverage-data.js';
    const jsFiles = ['monocart-code-viewer.js', 'monocart-formatter.js', 'monocart-v8.js'];

    await Util.saveAttachmentHtmlReport(reportData, options, reportDataFile, jsFiles);

};

const generateV8Report = async (v8list, testInfo, options) => {

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
        item.status = getStatus(item.pct, options.watermarks);

    });

    const pct = Util.PNF(covered, total, 2);
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
        files: v8list
    };

    await saveV8HtmlReport(htmlReport, options);

    const report = {
        type: 'v8',
        summary,
        files: summaryList
    };

    saveReportAttachment(testInfo, report, options.htmlDir);

    return report;
};

// ========================================================================================================

// Unify the format of js and css
const initV8List = async (v8list, options) => {
    // filter no source or text and init type extname
    v8list = v8list.filter((item) => {
        if (item.source) {
            item.type = 'js';
            item.extname = '.js';
            return true;
        }
        if (item.text) {
            item.type = 'css';
            item.extname = '.css';
            // text to source
            item.source = item.text;
            delete item.text;
            return true;
        }
    });

    // unpack source maps if options.sourceMap = true
    await unpackSourcemaps(v8list, options);

    return v8list;
};

const generateV8Coverage = async (v8list, testInfo, options) => {

    v8list = await initV8List(v8list, options);

    const fileSources = {};

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
        if (fileSources[sourcePath]) {
            const extname = item.extname;
            filename = `${path.basename(filename, extname)}-${i}${extname}`;
            sourcePath = `${dirname}/${filename}`;
        }

        fileSources[sourcePath] = item.source;

        // console.log('filename', filename);
        item.filename = filename;
        item.sourcePath = sourcePath;

    });

    if (options.toIstanbul) {
        return toIstanbulReport(v8list, testInfo, options, fileSources);
    }

    return generateV8Report(v8list, testInfo, options);
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

    options = {
        outputDir: Util.resolveOutputDir(testInfo),
        outputName: `coverage-${Util.shortTestId(testInfo.testId)}`,

        // istanbul
        // watermarks: {},
        // sourceFinder: null,

        // v8
        // watermarks: [50,80],
        toIstanbul: false,
        inline: false,

        sourceMap: true,
        sourceFilter: defaultSourceFilter,

        ... options
    };

    const htmlDir = path.resolve(options.outputDir, options.outputName);
    if (!fs.existsSync(htmlDir)) {
        fs.mkdirSync(htmlDir, {
            recursive: true
        });
    }
    options.htmlDir = htmlDir;

    if (Array.isArray(coverageInput)) {
        return generateV8Coverage(coverageInput, testInfo, options);
    }

    const coverageMap = istanbulLibCoverage.createCoverageMap(coverageInput);

    return generateIstanbulReport(coverageMap, testInfo, options);
};

// ========================================================================================================

//  add coverage report to global
const addCoverageReport = async (v8list, testInfo, options = {}) => {

    if (!Util.isList(v8list)) {
        EC.logRed('[MCR] invalid coverage input');
        return;
    }

    options = {
        outputDir: Util.resolveOutputDir(testInfo),
        outputName: 'coverage',

        sourceMap: true,
        sourceFilter: defaultSourceFilter,

        ... options
    };

    // const v8Path = path.resolve(__dirname, '../../.temp/v8-data.js');
    // const v8Data = `module.exports = ${JSON.stringify(v8list, null, 4)};`;
    // fs.writeFileSync(v8Path, v8Data);

    v8list = await initV8List(v8list, options);

    const definition = Util.attachments.artifact;

    const filename = `artifact-${Util.shortTestId(testInfo.testId)}.json`;

    const jsonDir = path.resolve(options.outputDir, options.outputName);
    const jsonPath = path.resolve(jsonDir, filename);

    const artifactContent = JSON.stringify({
        type: 'coverage',
        data: {
            outputDir: jsonDir,
            title: testInfo.title,
            list: v8list
        }
    });

    await Util.writeFile(jsonPath, artifactContent);

    testInfo.attachments.push({
        name: definition.name,
        contentType: definition.contentType,
        path: jsonPath
    });

};

// global coverage report
const generateCoverageReport = async (dataList) => {

};


module.exports = {
    addCoverageReport,
    generateCoverageReport,
    attachCoverageReport
};
