const fs = require('fs');
const path = require('path');
const EC = require('eight-colors');

const Util = require('../../utils/util.js');

const { saveIstanbulReport, saveV8ToIstanbulReport } = require('./istanbul/istanbul.js');

const {
    initV8List, mergeV8List, saveV8Report
} = require('./v8/v8.js');

// ========================================================================================================

const defaultV8Options = {
    // (Boolean) Whether to convert to Istanbul report
    toIstanbul: false,

    // (Function) A filter function to execute for each element in the V8 list.
    entryFilter: null,
    // (Boolean) Whether to unpack all sources from the source map if a related source map file is found.
    unpackSourceMap: true,
    // (Boolean) Whether to exclude the dist file (usually minified) if the sources are successfully unpacked from the source map.
    excludeDistFile: true,
    // (Function) A filter function to execute for each element in the sources which unpacked from the source map.
    sourceFilter: null

    // (Array) Defaults to `[50, 80]`
    // watermarks: [50, 80],

    // (Boolean) Whether inline all scripts to the single HTML file.
    // inline: false
};

const defaultIstanbulOptions = {

    // when toIstanbul = true
    entryFilter: null,
    unpackSourceMap: true,
    sourceFilter: null,

    // (usually not used) source finder for Istanbul HTML report
    sourceFinder: null,

    // (Boolean) Whether to create `lcov.info`
    lcov: false

    // (Object) Istanbul watermarks, see [here](https://github.com/istanbuljs/istanbuljs/tree/master/packages/istanbul-lib-report)
    // watermarks: {},
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

// ========================================================================================================

const generateIstanbulReport = (istanbulCoverage, testInfo, options) => {

    options = {
        ... defaultIstanbulOptions,
        ... options
    };

    const report = saveIstanbulReport(istanbulCoverage, options);

    saveReportAttachment(testInfo, report, options.htmlDir);

    return report;
};

// ========================================================================================================

const toIstanbulReport = async (v8list, testInfo, options) => {

    options = {
        ... defaultIstanbulOptions,
        ... options
    };

    const report = await saveV8ToIstanbulReport(v8list, options);

    saveReportAttachment(testInfo, report, options.htmlDir);

    return report;
};

// ========================================================================================================


const generateV8Report = async (v8list, testInfo, options) => {

    v8list = await initV8List(v8list, options);

    options.title = `Coverage Report - ${testInfo.title}`;

    const report = await saveV8Report(v8list, options);

    saveReportAttachment(testInfo, report, options.htmlDir);

    return report;
};

// ========================================================================================================

const generateV8Coverage = (v8list, testInfo, options) => {

    // v8list options, also for init / source map handler
    options = {
        ... defaultV8Options,
        ... options
    };

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

    return generateIstanbulReport(coverageInput, testInfo, options);
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

        ... defaultV8Options,
        ... coverageOptions
    };

    // The source map must be fetched before page closed
    // or it may be deleted
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

    // merge list again for multiple v8list, maybe collected multiple times
    v8list = await mergeV8List(v8list, options);

    // const v8Path = path.resolve(__dirname, '../../.temp/v8-data.js');
    // const v8Data = `module.exports = ${JSON.stringify(v8list, null, 4)};`;
    // fs.writeFileSync(v8Path, v8Data);

    options.title = `Coverage Report - ${reporterOptions.name}`;

    const report = await saveV8Report(v8list, options);

    return {
        type: 'coverage',
        name: 'Coverage',
        htmlPath: report.htmlPath,
        summary: report.summary
    };
};

module.exports = {
    addCoverageReport,
    generateCoverageReport,
    attachCoverageReport
};
