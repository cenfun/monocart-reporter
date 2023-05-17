const fs = require('fs');
const EC = require('eight-colors');

const istanbulReports = require('istanbul-reports');

const IstanbulSummary = require('./istanbul-summary.js');

const {
    V8toIstanbul, istanbulLibReport, convertSourceMap, istanbulLibCoverage
} = require('../../../runtime/monocart-coverage.js');


const saveHtmlReport = (coverageMap, options, fileSources) => {
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
    const coverageReport = new IstanbulSummary();
    coverageReport.execute(context);
    const report = coverageReport.getReport();

    return report;
};

const saveV8ToIstanbulReport = async (v8list, options) => {
    // file sources for istanbul html report sourceFinder in memory
    const fileSources = {};

    // https://github.com/istanbuljs/istanbuljs/tree/master/packages/istanbul-lib-coverage
    const coverageMap = istanbulLibCoverage.createCoverageMap();

    for (const item of v8list) {

        let source = item.source;

        fileSources[item.sourcePath] = source;

        //  remove map file
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

    return saveHtmlReport(coverageMap, options, fileSources);

};

const saveIstanbulReport = (istanbulCoverage, options) => {

    const coverageMap = istanbulLibCoverage.createCoverageMap(istanbulCoverage);

    return saveHtmlReport(coverageMap, options);
};

module.exports = {
    saveIstanbulReport,
    saveV8ToIstanbulReport
};
