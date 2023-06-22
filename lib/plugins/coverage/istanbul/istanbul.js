const fs = require('fs');
const path = require('path');

const istanbulReports = require('istanbul-reports');

const Util = require('../../../utils/util.js');
const IstanbulSummary = require('./istanbul-summary.js');

const { istanbulLibReport, istanbulLibCoverage } = require('../../../runtime/monocart-coverage.js');

const saveIstanbulReport = (coverageData, fileSources, options) => {

    const coverageMap = istanbulLibCoverage.createCoverageMap(coverageData);

    const { watermarks, defaultSummarizer } = options;
    const istanbulOptions = {
        watermarks,
        defaultSummarizer
    };

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

        ... istanbulOptions,

        dir: options.htmlDir,
        sourceFinder: (filePath) => {

            // console.log(`find file source: ${filePath}`);

            if (fileSources) {
                const source = fileSources[filePath];
                if (source) {
                    return source;
                }
            }

            if (typeof options.sourceFinder === 'function') {
                const source = options.sourceFinder(filePath);
                if (source) {
                    return source;
                }
            }

            if (fs.existsSync(filePath)) {
                return fs.readFileSync(filePath, 'utf8');
            }

            // console.log('Not found source file:', filePath);

            return `Not found source file: ${filePath}`;
        },
        coverageMap
    };

    // create a context for report generation
    const context = istanbulLibReport.createContext(contextOptions);

    // html
    if (options.toIstanbul) {
        let reportName = 'html-spa';
        if (options.toIstanbul === 'html') {
            reportName = 'html';
        }
        const htmlReport = istanbulReports.create(reportName, {});
        htmlReport.execute(context);
    }

    // lcov
    if (options.lcov) {
        const lcovReport = istanbulReports.create('lcovonly', {});
        lcovReport.execute(context);
    }

    const htmlPath = Util.relativePath(path.resolve(options.htmlDir, 'index.html'));

    // add watermarks and color
    const coverageReport = new IstanbulSummary();
    coverageReport.execute(context);
    const report = {
        title: options.title,
        htmlPath,
        watermarks: contextOptions.watermarks,
        ... coverageReport.getReport()
    };

    return report;
};

module.exports = {
    saveIstanbulReport
};
