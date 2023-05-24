const fs = require('fs');
const path = require('path');
const EC = require('eight-colors');

const Util = require('../../utils/util.js');

const {
    convertV8ToIstanbul, mergeIstanbulList, saveIstanbulReport
} = require('./istanbul/istanbul.js');

const {
    initV8List, mergeV8List, saveV8Report
} = require('./v8/v8.js');

// ========================================================================================================

const defaultV8Options = {

    // Defaults to test title
    // title: '',

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

    // Defaults to test title
    // title: '',

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

const generateIstanbulReport = (coverageData, testInfo, options) => {

    options = {
        ... defaultIstanbulOptions,
        ... options
    };

    const report = saveIstanbulReport(coverageData, options.fileSources, options);

    saveReportAttachment(testInfo, report, options.htmlDir);

    return report;
};


// ========================================================================================================

const generateV8Coverage = async (v8list, testInfo, options) => {

    // v8list options, also for init / source map handler
    options = {
        ... defaultV8Options,
        ... options
    };

    // ================================================================

    if (options.toIstanbul) {
        options = {
            ... defaultIstanbulOptions,
            ... options
        };

        const { coverageData, fileSources } = await convertV8ToIstanbul(v8list, options);

        const report = await saveIstanbulReport(coverageData, fileSources, options);

        saveReportAttachment(testInfo, report, options.htmlDir);

        return report;
    }

    // ================================================================

    v8list = await initV8List(v8list, options);

    const report = await saveV8Report(v8list, options);

    saveReportAttachment(testInfo, report, options.htmlDir);

    return report;
};

const attachCoverageReport = (coverageInput, testInfo, options = {}) => {

    if (!coverageInput) {
        EC.logRed('[MCR] invalid coverage input');
        return;
    }

    const title = options.title || `Coverage Report - ${testInfo.title}`;

    options = {
        title,
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

const generateArtifactData = (v8list, options) => {
    options = {
        ... defaultV8Options,
        ... options
    };
    if (options.toIstanbul) {
        options = {
            ... defaultIstanbulOptions,
            ... options
        };
        return convertV8ToIstanbul(v8list, options);
    }
    return initV8List(v8list, options);
};

//  add coverage report to global, v8list only
const addCoverageReport = async (coverageInput, testInfo) => {

    if (!coverageInput) {
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
        ... coverageOptions
    };

    const id = Util.shortTestId(testInfo.testId);
    const filename = `artifact-${id}.json`;
    const jsonDir = path.resolve(options.outputDir, options.outputName);
    const jsonPath = path.resolve(jsonDir, filename);

    const data = await generateArtifactData(coverageInput, options);

    // console.log('addCoverageReport keys', Object.keys(data.coverageData));

    const report = {
        id,
        outputFile: Util.relativePath(jsonPath),
        data
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

const generateGlobalCoverageReport = async (dataList, options) => {

    options = {
        ... defaultV8Options,
        ... options
    };

    if (options.toIstanbul) {
        options = {
            ... defaultIstanbulOptions,
            ... options
        };
        const istanbulList = dataList.map((it) => it.data);
        const { coverageData, fileSources } = mergeIstanbulList(istanbulList);
        return saveIstanbulReport(coverageData, fileSources, options);
    }

    let v8list = [];
    dataList.forEach((item) => {
        v8list = v8list.concat(item.data);
    });
    // merge list again for multiple v8list, maybe collected multiple times
    v8list = await mergeV8List(v8list, options);
    return saveV8Report(v8list, options);
};

// global coverage report, run different process with addCoverageReport
const generateCoverageReport = async (dataList, reporterOptions) => {

    // reporter outputFile
    const outputFile = await Util.resolveOutputFile(reporterOptions.outputFile);
    const outputDir = path.dirname(outputFile);

    const coverageOptions = reporterOptions.coverage || {};
    const options = {
        title: `Coverage Report - ${reporterOptions.name}`,
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

    const report = await generateGlobalCoverageReport(dataList, options);

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
    generateCoverageReport,
    attachCoverageReport
};
