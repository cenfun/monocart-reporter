const fs = require('fs');
const path = require('path');

const Util = require('../../utils/util.js');
const {
    initIstanbulData, mergeIstanbulCoverage, saveIstanbulReport
} = require('./istanbul/istanbul.js');
const {
    initV8ListAndSourcemap, mergeV8Coverage, saveV8Report
} = require('./v8/v8.js');

const { convertV8List } = require('./converter/converter.js');

const artifactsDirName = '.artifacts';

const defaultOptions = {

    // Defaults to test title
    // title
    // outputDir
    // outputName

    // (Boolean) Whether to convert to Istanbul report from V8 list. Defaults to `html-spa` report | (String) report name | (Array) multiple reports
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

const generateIstanbulReport = (istanbulData, testInfo, options) => {

    const { coverageData, fileSources } = initIstanbulData(istanbulData, options);
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

const attachCoverageReport = (data, testInfo, options = {}) => {

    const logging = Util.resolveLogging(testInfo, options);
    Util.initLoggingLevel(logging, 'coverage-attach');

    if (!data) {
        Util.logError(`invalid coverage data: ${testInfo.title}`);
        return;
    }

    options = {
        ... defaultOptions,
        // default title
        title: `Coverage Report - ${testInfo.title}`,
        outputDir: Util.resolveOutputDir(testInfo, options),
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

    const dataType = Array.isArray(data) ? 'v8' : 'istanbul';
    // console.log('data type', dataType);

    if (dataType === 'v8') {
        return generateV8Coverage(data, testInfo, options);
    }

    return generateIstanbulReport(data, testInfo, options);
};

// ========================================================================================================

//  add coverage report to global, v8list only
const addCoverageReport = async (data, testInfo, options = {}) => {

    const logging = Util.resolveLogging(testInfo, options);
    Util.initLoggingLevel(logging, 'coverage-add');

    if (!data) {
        Util.logError(`invalid coverage data: ${testInfo.title}`);
        return;
    }

    // global outputDir
    const outputDir = await Util.resolveGlobalOutputDir(testInfo, options);

    const coverageOptions = Util.resolveCoverageOptions(testInfo, options);

    options = {
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

    const report = {
        title: testInfo.title
    };

    if (Array.isArray(data)) {
        // init v8list and unpack sourcemap
        const inlineSourceMap = false;
        report.data = await initV8ListAndSourcemap(data, options, inlineSourceMap);
    } else {
        // istanbul
        report.data = data;
    }

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

    // get first and check v8list or istanbul data
    const firstData = dataList[0].data;
    const dataType = Array.isArray(firstData) ? 'v8' : 'istanbul';
    // console.log('data type', dataType);

    // v8list
    if (dataType === 'v8') {
        // merge v8list first
        const v8list = await mergeV8Coverage(dataList, options);
        // console.log('after merge', v8list.map((it) => it.url));

        const { coverageData, fileSources } = await convertV8List(v8list, options);
        return generateV8ListReport(v8list, coverageData, fileSources, options);

    }

    // istanbul data
    const istanbulData = mergeIstanbulCoverage(dataList, options);
    const { coverageData, fileSources } = initIstanbulData(istanbulData, options);
    return saveIstanbulReport(coverageData, fileSources, options);

};

// global coverage report, run different process with addCoverageReport
const addGlobalCoverageReport = async (dataList, coverageOptions) => {

    Util.logInfo('generating global coverage report ...');

    const options = {
        ... defaultOptions,
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
    addGlobalCoverageReport,
    attachCoverageReport
};
