const fs = require('fs');
const path = require('path');
const EC = require('eight-colors');

const Util = require('../../utils/util.js');
const { convertV8ToIstanbul, saveIstanbulReport } = require('./istanbul/istanbul.js');
const {
    initV8ListAndSourcemap, unpackV8List, mergeV8Coverage, saveV8Report
} = require('./v8/v8.js');

const defaultOptions = {

    // Defaults to test title
    // title
    // outputDir
    // outputName

    // (Boolean) Whether to convert to Istanbul report
    toIstanbul: false,

    // (Function) A filter function to execute for each element in the V8 list.
    entryFilter: null,
    // (Boolean) Whether to unpack all sources from the source map if a related source map file is found.
    unpackSourceMap: true,
    // (Boolean) Whether to exclude the dist file (usually minified) if the sources are successfully unpacked from the source map.
    excludeDistFile: true,
    // (Function) A filter function to execute for each element in the sources which unpacked from the source map.
    sourceFilter: null,

    // Istanbul Only

    // source path handler
    sourcePath: null,

    // (usually not used) source finder for Istanbul HTML report
    sourceFinder: null,

    // (Boolean) Whether to create `lcov.info`
    lcov: false

    // (Object) Istanbul watermarks, see [here](https://github.com/istanbuljs/istanbuljs/tree/master/packages/istanbul-lib-report)
    // watermarks: {},
    // (Array) V8 watermarks, Defaults to `[50, 80]`
    // watermarks: [50, 80],

    // (Boolean) Whether inline all scripts to the single HTML file.
    // inline: false,

    // debug: false
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

const generateIstanbulReport = (coverageData, testInfo, options) => {

    const fileSources = options.fileSources || {};

    const report = saveIstanbulReport(coverageData, fileSources, options);

    saveReportAttachment(testInfo, report, options.htmlDir);

    return report;
};


// ========================================================================================================

const generateV8Coverage = async (v8list, testInfo, options) => {

    // init v8list and unpack sourcemap
    const inlineSourceMap = true;
    v8list = await initV8ListAndSourcemap(v8list, options, inlineSourceMap);

    // ================================================================

    if (options.toIstanbul) {

        const { coverageData, fileSources } = await convertV8ToIstanbul(v8list, options);

        const report = await saveIstanbulReport(coverageData, fileSources, options);

        saveReportAttachment(testInfo, report, options.htmlDir);

        return report;
    }

    // ================================================================

    // functions to ranges, and unpack source maps
    await unpackV8List(v8list, options);

    const report = await saveV8Report(v8list, options);

    saveReportAttachment(testInfo, report, options.htmlDir);

    return report;
};

const attachCoverageReport = (coverageInput, testInfo, options = {}) => {

    if (!coverageInput) {
        EC.logRed('[MCR] invalid coverage input');
        return;
    }

    options = {
        ... defaultOptions,
        // default title
        title: `Coverage Report - ${testInfo.title}`,
        outputDir: Util.resolveOutputDir(testInfo),
        outputName: `coverage-${Util.resolveTestIdWithRetry(testInfo)}`,
        ... options
    };

    // support multiple calls
    let htmlDir = path.resolve(options.outputDir, options.outputName);
    let i = 1;
    while (fs.existsSync(htmlDir)) {
        const outputName = `${options.outputName}-${i}`;
        htmlDir = path.resolve(options.outputDir, outputName);
        i += 1;
    }

    fs.mkdirSync(htmlDir, {
        recursive: true
    });
    options.htmlDir = htmlDir;

    if (Array.isArray(coverageInput)) {
        return generateV8Coverage(coverageInput, testInfo, options);
    }

    return generateIstanbulReport(coverageInput, testInfo, options);
};

// ========================================================================================================

//  add coverage report to global, v8list only
const addCoverageReport = async (v8list, testInfo) => {

    if (!Util.isList(v8list)) {
        EC.logRed(`[MCR] invalid v8 list for test: ${testInfo.title}`);
        return;
    }

    const reporterOptions = Util.resolveReporterOptions(testInfo);
    const coverageOptions = reporterOptions.coverage || {};

    // reporter outputFile
    const outputFile = await Util.resolveOutputFile(reporterOptions.outputFile);
    const outputDir = path.dirname(outputFile);

    const options = {
        ... defaultOptions,
        // use reporter dir as output dir, NOT test output dir
        outputDir,
        outputName: 'coverage',
        ... coverageOptions
    };

    const reportDir = path.resolve(options.outputDir, options.outputName);

    // artifactsDir for temp artifact files
    const artifactsDir = path.resolve(reportDir, '.artifacts');
    options.artifactsDir = artifactsDir;

    const filename = `coverage-${Util.resolveTestIdWithRetry(testInfo)}.json`;
    const jsonPath = path.resolve(artifactsDir, filename);

    // init v8list and unpack sourcemap
    const inlineSourceMap = false;
    v8list = await initV8ListAndSourcemap(v8list, options, inlineSourceMap);

    // console.log('addCoverageReport', coverageInput.map((it) => it.url));

    const report = {
        // title for debug
        title: testInfo.title,
        // merge with data
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

// ========================================================================================================

const getGlobalCoverageData = async (dataList, options) => {

    // merge v8list first
    const v8list = await mergeV8Coverage(dataList, options);
    // console.log('after merge', v8list.map((it) => it.url));

    if (options.toIstanbul) {

        const { coverageData, fileSources } = await convertV8ToIstanbul(v8list, options);

        const report = await saveIstanbulReport(coverageData, fileSources, options);

        // console.log(report);

        return report;
    }

    // functions to ranges, and unpack source maps
    await unpackV8List(v8list, options);

    const report = await saveV8Report(v8list, options);

    return report;
};

// global coverage report, run different process with addCoverageReport
const generateGlobalCoverageReport = async (dataList, reporterOptions) => {

    // reporter outputFile
    const outputFile = await Util.resolveOutputFile(reporterOptions.outputFile);
    const outputDir = path.dirname(outputFile);

    const coverageOptions = reporterOptions.coverage || {};
    const options = {
        ... defaultOptions,
        title: `Coverage Report - ${reporterOptions.name}`,
        outputDir,
        outputName: 'coverage',
        ... coverageOptions
    };

    const reportDir = path.resolve(options.outputDir, options.outputName);
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, {
            recursive: true
        });
    }
    options.htmlDir = reportDir;

    // artifactsDir for temp artifact files
    const artifactsDir = path.resolve(reportDir, '.artifacts');
    options.artifactsDir = artifactsDir;

    const report = await getGlobalCoverageData(dataList, options);
    // console.log(report);

    // =============================================================
    // remove artifacts dir after report generated
    if (!options.debug) {
        Util.rmSync(artifactsDir);
    }
    // =============================================================

    return {
        global: true,
        name: 'coverage',
        path: report.htmlPath,
        summary: report.summary,
        title: options.title
    };
};

module.exports = {
    addCoverageReport,
    generateGlobalCoverageReport,
    attachCoverageReport
};
