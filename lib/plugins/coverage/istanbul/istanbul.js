const fs = require('fs');
const path = require('path');

const istanbulReports = require('istanbul-reports');

const Util = require('../../../utils/util.js');
const IstanbulSummary = require('./istanbul-summary.js');

const { istanbulLibReport, istanbulLibCoverage } = require('../../../runtime/monocart-coverage.js');

const { initIstanbulSourcePath } = require('../converter/source-path.js');

const getIstanbulReportList = (toIstanbul) => {
    if (typeof toIstanbul === 'boolean') {
        return [{
            name: 'html-spa',
            options: {}
        }];
    }

    if (typeof toIstanbul === 'string') {
        return [{
            name: toIstanbul,
            options: {}
        }];
    }

    if (Array.isArray(toIstanbul)) {
        return toIstanbul.map((item) => {
            if (typeof item === 'string') {
                return {
                    name: item,
                    options: {}
                };
            }
            if (item && item.name) {
                return item;
            }
        }).filter((it) => it);
    }

    return [{
        name: 'html-spa',
        options: {}
    }];
};

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

    // istanbul reports
    let lcovCreated = false;
    if (options.toIstanbul) {
        const reportList = getIstanbulReportList(options.toIstanbul);
        reportList.forEach((item) => {
            if (item.name === 'lcovonly') {
                lcovCreated = true;
            }
            const report = istanbulReports.create(item.name, item.options || {});
            report.execute(context);
        });
    }

    // lcov
    if (!lcovCreated && options.lcov) {
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

const mergeIstanbulCoverage = (dataList, options) => {
    const coverageMap = istanbulLibCoverage.createCoverageMap();
    dataList.forEach((item) => {
        coverageMap.merge(item.data);
    });

    const istanbulData = coverageMap.toJSON();

    return istanbulData;
};

const initIstanbulData = (istanbulData, options) => {

    // force to istanbul, true is defaults to html-spa
    if (!options.toIstanbul) {
        options.toIstanbul = true;
    }

    const fileSources = options.fileSources || {};

    const coverageData = initIstanbulSourcePath(istanbulData, fileSources, options.sourcePath);

    return {
        fileSources,
        coverageData
    };
};

module.exports = {
    saveIstanbulReport,
    mergeIstanbulCoverage,
    initIstanbulData
};
