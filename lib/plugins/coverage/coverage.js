const fs = require('fs');
const path = require('path');
const CoverageReport = require('monocart-coverage-reports');
const Util = require('../../utils/util.js');

const attachCoverageReport = async (data, testInfo, options = {}) => {

    const reporterOptions = Util.resolveReporterOptions(testInfo);

    const outputDir = Util.resolveOutputDir(testInfo, options);
    const folderName = `coverage-${Util.resolveTestIdWithRetry(testInfo)}`;

    // support multiple calls
    let outputName = folderName;
    let htmlDir = path.resolve(outputDir, outputName);
    let i = 0;
    while (fs.existsSync(htmlDir)) {
        i += 1;
        outputName = `${folderName}-${i}`;
        htmlDir = path.resolve(outputDir, outputName);
    }

    const outputFile = path.resolve(outputDir, outputName, 'index.html');

    const coverageOptions = {
        name: `Coverage Report - ${testInfo.title}`,
        outputFile,
        assetsPath: '../assets',
        logging: reporterOptions.logging,
        ... options
    };

    const coverageReport = new CoverageReport(coverageOptions);
    await coverageReport.add(data);
    const report = await coverageReport.generate();

    // save report json
    const definition = Util.attachments.coverage;
    const reportPath = path.resolve(htmlDir, definition.reportFile);
    Util.writeJSONSync(reportPath, report);

    // save attachments html link
    testInfo.attachments.push({
        name: definition.name,
        contentType: definition.contentType,
        path: path.resolve(htmlDir, 'index.html')
    });

    return report;
};

// ========================================================================================================

const getGlobalCoverageOptions = async (reporterOptions) => {

    const reporterOutputFile = await Util.resolveOutputFile(reporterOptions.outputFile);
    const outputDir = path.dirname(reporterOutputFile);
    const outputFile = path.resolve(outputDir, 'coverage', 'index.html');

    const coverageOptions = {
        name: `Coverage Report - ${reporterOptions.name}`,
        outputFile,
        assetsPath: '../assets',
        logging: reporterOptions.logging,
        // merge all global coverage options
        ... reporterOptions.coverage
    };

    return coverageOptions;
};

//  add coverage report to global, v8list only
const addCoverageReport = async (data, testInfo) => {

    const reporterOptions = Util.resolveReporterOptions(testInfo);
    const coverageOptions = await getGlobalCoverageOptions(reporterOptions);

    const coverageReport = new CoverageReport(coverageOptions);
    const results = await coverageReport.add(data);

    return results;
};

const generateGlobalCoverageReport = async (reporterOptions) => {

    const coverageOptions = await getGlobalCoverageOptions(reporterOptions);

    const coverageReport = new CoverageReport(coverageOptions);

    // check if has cache dir
    const cacheDir = await coverageReport.getCacheDir();
    if (!cacheDir) {
        return;
    }

    const report = await coverageReport.generate();
    if (!report) {
        return;
    }

    // report props: type, htmlPath, name, watermarks, summary, files

    // showing list props: global, name, path, title

    // console.log('global coverage report', report);

    return {
        global: true,
        type: 'coverage',
        name: report.name,
        path: report.htmlPath
    };
};

module.exports = {
    addCoverageReport,
    attachCoverageReport,
    generateGlobalCoverageReport
};
