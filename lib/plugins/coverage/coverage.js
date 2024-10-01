const fs = require('fs');
const path = require('path');
const MCR = require('monocart-coverage-reports');
const Util = require('../../utils/util.js');

const attachCoverageReport = async (data, testInfo, options = {}) => {

    const outputDir = await Util.resolveOutputDir(testInfo);
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

    const coverageOptions = {
        logging: Util.resolveLogging(testInfo, options),
        outputDir: htmlDir,
        name: `Coverage Report - ${testInfo.title}`,
        assetsPath: '../assets',
        ... options
    };

    const coverageReport = MCR(coverageOptions);
    await coverageReport.add(data);
    const coverageResults = await coverageReport.generate();

    const reportPath = coverageResults.reportPath;
    if (reportPath && fs.existsSync(reportPath)) {
        // save report json
        const definition = Util.attachments.coverage;
        const reportJsonPath = path.resolve(htmlDir, definition.reportFile);
        // only for summary, clean useless data
        const coverageSummary = {
            type: coverageResults.type,
            name: coverageResults.name,
            // requires summary
            summary: coverageResults.summary,
            // only requires files count
            files: coverageResults.files.length
        };
        Util.writeJSONSync(reportJsonPath, coverageSummary);

        // save attachments html link
        testInfo.attachments.push({
            name: definition.name,
            contentType: definition.contentType,
            path: reportPath
        });
    }

    return coverageResults;
};

// ========================================================================================================

const getGlobalCoverageOptions = async (reporterOptions) => {

    const reporterOutputFile = await Util.resolveOutputFile(reporterOptions.outputFile);
    const outputDir = path.dirname(reporterOutputFile);
    const htmlDir = path.resolve(outputDir, 'coverage');

    const coverageOptions = {
        logging: reporterOptions.logging,
        outputDir: htmlDir,
        name: `Coverage Report - ${reporterOptions.name}`,
        assetsPath: '../assets',
        // merge all global coverage options
        ... reporterOptions.coverage
    };

    return coverageOptions;
};

//  add coverage report to global, v8list only
const addCoverageReport = async (data, testInfo) => {

    const reporterOptions = Util.resolveReporterOptions(testInfo);
    const coverageOptions = await getGlobalCoverageOptions(reporterOptions);

    const coverageReport = MCR(coverageOptions);
    const results = await coverageReport.add(data);

    return results;
};

const generateGlobalCoverageReport = async (reporterOptions) => {

    const coverageOptions = await getGlobalCoverageOptions(reporterOptions);

    const coverageReport = MCR(coverageOptions);

    // check if has cache
    if (!coverageReport.hasCache()) {
        return;
    }

    const coverageResults = await coverageReport.generate();
    if (!coverageResults) {
        return;
    }

    // coverageResults: type, reportPath, name, watermarks, summary, files
    // showing list props: global, name, path, title

    // there is no reportPath if only raw
    const reportPath = coverageResults.reportPath;

    const artifact = {
        global: true,
        type: 'coverage',
        name: coverageResults.name,
        path: reportPath
    };

    const reports = {};
    const { reportGroup, outputDir } = coverageReport.options;
    if (reportGroup) {
        reportGroup.forEach((group) => {
            group.forEach((o, k) => {
                reports[k] = o;
            });
        });
    }

    if (reports.raw) {
        let rawDir = path.resolve(outputDir, reports.raw.outputDir || 'raw');
        if (reports.raw.zip) {
            rawDir += '.zip';
        }
        artifact.rawDir = Util.relativePath(rawDir, reporterOptions.outputDir);
    }

    return artifact;
};

const mergeGlobalCoverageReport = async (coverageRawList, reporterOptions) => {
    const coverageOptions = await getGlobalCoverageOptions(reporterOptions);
    coverageOptions.inputDir = coverageRawList;

    const coverageReport = MCR(coverageOptions);
    const coverageResults = await coverageReport.generate();
    if (!coverageResults) {
        return;
    }

    const reportPath = coverageResults.reportPath;
    if (reportPath && fs.existsSync(reportPath)) {
        return {
            global: true,
            type: 'coverage',
            name: coverageResults.name,
            path: reportPath
        };
    }

};

module.exports = {
    addCoverageReport,
    attachCoverageReport,
    generateGlobalCoverageReport,
    mergeGlobalCoverageReport
};
