const fs = require('fs');
const path = require('path');

const Util = require('../../utils/util.js');
const { saveIstanbulReport } = require('./istanbul/istanbul.js');
const {
    initV8ListAndSourcemap, mergeV8Coverage, saveV8Report
} = require('./v8/v8.js');

const { convertV8List } = require('./converter/converter.js');
const { initIstanbulSourcePath } = require('./converter/source-path.js');

const artifactsDirName = '.artifacts';

const defaultOptions = {

    // Defaults to test title
    // title
    // outputDir
    // outputName

    // (Boolean) Whether to convert to Istanbul report from V8 list. Defaults to `html-spa` report | (String) or using `html` report
    toIstanbul: false,

    // (Function) A filter function to execute for each element in the V8 list.
    entryFilter: null,

    // (Function) A filter function to execute for each element in the sources which unpacked from the source map.
    sourceFilter: null,

    // Istanbul Only

    // source path handler
    sourcePath: null,

    // (usually not used) source finder for Istanbul HTML report
    sourceFinder: null,

    // (Boolean) Whether to create `lcov.info`
    lcov: false,

    // (Object) Istanbul watermarks, see [here](https://github.com/istanbuljs/istanbuljs/tree/master/packages/istanbul-lib-report)
    // watermarks: {},
    // (Array) V8 watermarks, Defaults to `[50, 80]`
    // watermarks: [50, 80],

    // (Boolean) Whether inline all scripts to the single HTML file. V8 only.
    inline: false

};

// ========================================================================================================

const generateV8ListReport = async (v8list, coverageData, fileSources, options) => {
    const { toIstanbul, lcov } = options;
    const istanbulReport = toIstanbul || lcov;
    const v8Report = !toIstanbul;

    let report;
    if (istanbulReport) {
        report = await saveIstanbulReport(coverageData, fileSources, options);
    }
    if (v8Report) {
        report = await saveV8Report(v8list, options);
    }

    return report;
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

    // force to istanbul, true is defaults to html-spa
    if (!options.toIstanbul) {
        options.toIstanbul = true;
    }

    const fileSources = options.fileSources || {};

    coverageData = initIstanbulSourcePath(coverageData, fileSources, options.sourcePath);

    const report = saveIstanbulReport(coverageData, fileSources, options);

    saveReportAttachment(testInfo, report, options.htmlDir);

    return report;
};


// ========================================================================================================

const generateV8Coverage = async (v8list, testInfo, options) => {

    // init v8list and unpack sourcemap
    const inlineSourceMap = true;
    v8list = await initV8ListAndSourcemap(v8list, options, inlineSourceMap);

    const { coverageData, fileSources } = await convertV8List(v8list, options);

    const report = await generateV8ListReport(v8list, coverageData, fileSources, options);

    saveReportAttachment(testInfo, report, options.htmlDir);

    return report;
};

const attachCoverageReport = (coverageInput, testInfo, options = {}) => {

    const reporterOptions = Util.resolveReporterOptions(testInfo);
    Util.initLoggingLevel(reporterOptions.logging, 'coverage-attach');

    if (!coverageInput) {
        Util.logError('invalid coverage input');
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

    Util.initDir(htmlDir);
    options.htmlDir = htmlDir;

    if (Array.isArray(coverageInput)) {
        return generateV8Coverage(coverageInput, testInfo, options);
    }

    return generateIstanbulReport(coverageInput, testInfo, options);
};

// ========================================================================================================

//  add coverage report to global, v8list only
const addCoverageReport = async (v8list, testInfo) => {

    const reporterOptions = Util.resolveReporterOptions(testInfo);
    Util.initLoggingLevel(reporterOptions.logging, 'coverage-add');

    if (!Util.isList(v8list)) {
        Util.logError(`invalid v8 list for test: ${testInfo.title}`);
        return;
    }

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
    // do NOT empty dir, there are previous artifacts generated

    // artifactsDir for temp artifact files
    const artifactsDir = path.resolve(reportDir, artifactsDirName);
    options.artifactsDir = artifactsDir;

    const filename = `coverage-${Util.resolveTestIdWithRetry(testInfo)}.json`;
    const jsonPath = path.resolve(artifactsDir, filename);

    // init v8list and unpack sourcemap
    const inlineSourceMap = false;
    v8list = await initV8ListAndSourcemap(v8list, options, inlineSourceMap);

    // console.log('addCoverageReport', coverageInput.map((it) => it.url));

    const report = {
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

    const { coverageData, fileSources } = await convertV8List(v8list, options);

    const report = await generateV8ListReport(v8list, coverageData, fileSources, options);

    return report;
};

// global coverage report, run different process with addCoverageReport
const generateGlobalCoverageReport = async (dataList, reporterOptions) => {

    Util.logInfo('generating global coverage report ...');

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
    // empty dir except artifacts dir

    if (fs.existsSync(reportDir)) {
        fs.readdirSync(reportDir).forEach((itemName) => {
            if (itemName === artifactsDirName) {
                return;
            }
            Util.rmSync(path.resolve(reportDir, itemName));
        });
    }

    options.htmlDir = reportDir;

    // artifactsDir for temp artifact files
    const artifactsDir = path.resolve(reportDir, artifactsDirName);
    options.artifactsDir = artifactsDir;

    const report = await getGlobalCoverageData(dataList, options);
    // console.log(report);

    // =============================================================
    // remove artifacts dir after report generated
    if (Util.loggingType !== 'debug') {
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
