const fs = require('fs');
const path = require('path');
const istanbulReports = require('istanbul-reports');
const {
    V8toIstanbul,
    istanbulLibCoverage,
    istanbulLibReport
} = require('../runtime/monocart-coverage.js');
const Util = require('../utils/util.js');

// ======================================================================================

const generateCoverageDataFromV8 = async (list, testInfo) => {

    const coverageData = {};
    const tempFiles = [];

    const len = `${list.length}`.length;

    let index = 1;
    for (const item of list) {

        const source = item.source;

        const filename = path.basename(item.url);
        // if (path.extname(filename) !== '.js') {
        //     filename += '.js';
        // }

        const filePath = path.resolve(testInfo.outputDir, `${Util.zero(index, len)}-${filename}`);
        fs.writeFileSync(filePath, source);

        tempFiles.push(filePath);

        const converter = new V8toIstanbul(filePath, 0, {
            source
        });

        await converter.load().catch((e) => {
            console.log(e.message);
        });

        converter.applyCoverage(item.functions);

        const data = converter.toIstanbul();

        Object.assign(coverageData, data);

        // fs.rmSync(filePath);

        index += 1;
    }

    return coverageData;

};

// ======================================================================================

const generateIstanbulCoverage = (coverageData, testInfo) => {

    // https://github.com/istanbuljs/istanbuljs/tree/master/packages/istanbul-lib-coverage
    const coverageMap = istanbulLibCoverage.createCoverageMap(coverageData);

    const coveragePath = path.resolve(testInfo.outputDir, 'coverage');
    if (!fs.existsSync(coveragePath)) {
        fs.mkdirSync(coveragePath, {
            recursive: true
        });
    }

    const configWatermarks = {
        statements: [50, 80],
        functions: [50, 80],
        branches: [50, 80],
        lines: [50, 80]
    };

    // https://github.com/istanbuljs/istanbuljs/tree/master/packages/istanbul-lib-report
    // create a context for report generation
    const context = istanbulLibReport.createContext({
        dir: coveragePath,
        // The summarizer to default to (may be overridden by some reports)
        // values can be nested/flat/pkg. Defaults to 'pkg'
        defaultSummarizer: 'nested',
        watermarks: configWatermarks,
        coverageMap
    });

    const htmlReport = istanbulReports.create('html', {});
    htmlReport.execute(context);

    // const htmlCoverageReport = `${coveragePath}/index.html`;

};

// ======================================================================================

module.exports = async (coverageData, testInfo) => {

    if (!coverageData) {
        return;
    }

    const outputDir = testInfo.outputDir;
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, {
            recursive: true
        });
    }

    if (Array.isArray(coverageData)) {
        coverageData = await generateCoverageDataFromV8(coverageData, testInfo);
    }

    return generateIstanbulCoverage(coverageData, testInfo);
};
