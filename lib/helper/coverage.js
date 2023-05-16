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
const {
    initV8List, mergeV8List, saveV8Report
} = require('./coverage/v8.js');

// high performance
// str.search(reg) -> index
// reg.test(str) -> boolean
// for sourceMap = true
const defaultSourceFilter = (sourceName) => sourceName.search(/\/src\/.+/) !== -1;

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

const toIstanbulReport = async (v8list, testInfo, options) => {

    // filter do not support css
    v8list = v8list.filter((item) => item.type !== 'css');

    // file sources for istanbul html report sourceFinder in memory
    const fileSources = {};

    // https://github.com/istanbuljs/istanbuljs/tree/master/packages/istanbul-lib-coverage
    const coverageMap = istanbulLibCoverage.createCoverageMap();

    for (const item of v8list) {

        let source = item.source;

        fileSources[item.sourcePath] = source;

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


const generateV8Report = async (v8list, testInfo, options) => {

    options.title = `Coverage Report - ${testInfo.title}`;

    const report = await saveV8Report(v8list, options);

    saveReportAttachment(testInfo, report, options.htmlDir);

    return report;
};

// ========================================================================================================

const generateV8Coverage = async (v8list, testInfo, options) => {

    v8list = await initV8List(v8list, options);

    if (options.toIstanbul) {
        return toIstanbulReport(v8list, testInfo, options);
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
const addCoverageReport = async (v8list, testInfo) => {

    if (!Util.isList(v8list)) {
        EC.logRed('[MCR] invalid coverage input');
        return;
    }

    const reporterOptions = Util.resolveReporterOptions(testInfo);
    const coverageOptions = reporterOptions.coverage || {};

    // reporter outputFile
    const outputFile = await Util.resolveOutputFile(reporterOptions.outputFile);
    const outputDir = path.dirname(outputFile);

    const options = {
        // use reporter dir as output dir, NOT test output dir
        outputDir,
        outputName: 'coverage',

        sourceMap: true,
        sourceFilter: defaultSourceFilter,

        ... coverageOptions
    };

    // The sourcemap must be fetched before saving or it may be deleted
    v8list = await initV8List(v8list, options);

    const id = Util.shortTestId(testInfo.testId);
    const filename = `artifact-${id}.json`;
    const jsonDir = path.resolve(options.outputDir, options.outputName);
    const jsonPath = path.resolve(jsonDir, filename);

    const report = {
        id,
        title: testInfo.title,
        outputFile: Util.relativePath(jsonPath),
        // current v8 only
        type: 'v8',
        data: v8list
    };

    const artifactContent = JSON.stringify({
        type: 'coverage',
        data: report
    });
    await Util.writeFile(jsonPath, artifactContent);

    const definition = Util.attachments.artifact;
    testInfo.attachments.push({
        name: definition.name,
        contentType: definition.contentType,
        path: jsonPath
    });

    return report;
};

// global coverage report, run different process with addCoverageReport
const generateCoverageReport = async (dataList, reporterOptions) => {

    // reporter outputFile
    const outputFile = await Util.resolveOutputFile(reporterOptions.outputFile);
    const outputDir = path.dirname(outputFile);

    const coverageOptions = reporterOptions.coverage || {};
    const options = {
        outputDir,
        outputName: 'coverage',
        ... coverageOptions
    };

    const htmlDir = path.resolve(options.outputDir, options.outputName);
    if (!fs.existsSync(htmlDir)) {
        fs.mkdirSync(htmlDir, {
            recursive: true
        });
    }
    options.htmlDir = htmlDir;


    let v8list = [];
    dataList.forEach((item) => {
        v8list = v8list.concat(item.data);
    });

    // merge list, maybe collected multiple times
    v8list = await mergeV8List(v8list, options);

    // const v8Path = path.resolve(__dirname, '../../.temp/v8-data.js');
    // const v8Data = `module.exports = ${JSON.stringify(v8list, null, 4)};`;
    // fs.writeFileSync(v8Path, v8Data);

    options.title = `Coverage Report - ${reporterOptions.name}`;

    await saveV8Report(v8list, options);

};

module.exports = {
    addCoverageReport,
    generateCoverageReport,
    attachCoverageReport
};
