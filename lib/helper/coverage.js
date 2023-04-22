const fs = require('fs');
const path = require('path');
const EC = require('eight-colors');
const istanbulReports = require('istanbul-reports');
const {
    V8toIstanbul,
    istanbulLibCoverage,
    istanbulLibReport,
    mapFileCommentRegex
} = require('../runtime/monocart-coverage.js');

const generateIstanbulCoverage = (coverageData, testInfo, options) => {

    const coverageDir = path.resolve(testInfo.outputDir, 'coverage');
    if (!fs.existsSync(coverageDir)) {
        fs.mkdirSync(coverageDir);
    }

    // https://github.com/istanbuljs/istanbuljs/tree/master/packages/istanbul-lib-coverage
    const coverageMap = istanbulLibCoverage.createCoverageMap(coverageData);

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
        dir: coverageDir,
        coverageMap,
        ... options
    };

    // create a context for report generation
    const context = istanbulLibReport.createContext(contextOptions);

    const htmlReport = istanbulReports.create('html', {});
    htmlReport.execute(context);

    // const lcovReport = istanbulReports.create('lcovonly', {});
    // lcovReport.execute(context);

    const summaryReport = istanbulReports.create('json-summary', {});
    summaryReport.execute(context);

    const reportPath = path.resolve(coverageDir, 'coverage-summary.json');
    const report = JSON.parse(fs.readFileSync(reportPath));

    testInfo.attachments.push({
        name: 'coverage',
        contentType: 'text/html',
        path: path.resolve(coverageDir, 'index.html')
    });

    return report;
};


const generateV8Coverage = async (list, testInfo, options) => {

    const jsDir = path.resolve(testInfo.outputDir, 'js');
    if (!fs.existsSync(jsDir)) {
        fs.mkdirSync(jsDir);
    }

    const pathMap = {};
    // save files
    list.forEach((item, i) => {

        const url = new URL(item.url);
        const host = [url.hostname, url.port].filter((it) => it).join('-');
        let pathname = url.pathname;
        if (pathname.endsWith('/')) {
            pathname += 'index.js';
        }
        const p = host + pathname;

        const dirname = path.dirname(p);
        // console.log('dirname', dirname);
        const fileDir = path.resolve(jsDir, dirname);
        if (!fs.existsSync(fileDir)) {
            fs.mkdirSync(fileDir, {
                recursive: true
            });
        }

        // const jsDir = path.resolve(outputDir, dir);

        let filename = path.basename(p);
        const extname = path.extname(filename);
        if (extname !== '.js') {
            filename += '.js';
        }

        // same filename in same dir, plus index number
        if (pathMap[`${dirname}/${filename}`]) {
            filename = `${path.basename(filename, '.js')}-${i}.js`;
        }
        pathMap[`${dirname}/${filename}`] = true;

        // console.log('filename', filename);

        const filePath = path.resolve(fileDir, filename);

        let source = item.source;
        //  remove sourcemap file
        // # sourceMappingURL=xxx.js.map
        source = source.replace(mapFileCommentRegex, '');
        item.source = source;

        fs.writeFileSync(filePath, source);

        // console.log(`[MCR] coverage file saved: ${filename}`);

        item.filePath = filePath;

    });


    const coverageData = {};
    for (const item of list) {

        const source = item.source;

        const v8toIstanbul = new V8toIstanbul(item.filePath, 0, {
            source
        });

        await v8toIstanbul.load().catch((e) => {
            EC.logRed('[MCR] v8toIstanbul.load:', e.message);
        });

        try {
            v8toIstanbul.applyCoverage(item.functions);
        } catch (e) {
            EC.logRed('[MCR] v8toIstanbul.applyCoverage:', e.message);
        }

        const data = v8toIstanbul.toIstanbul();
        Object.assign(coverageData, data);

    }

    const report = await generateIstanbulCoverage(coverageData, testInfo, options);

    // remove useless jsDir after Istanbul report generated
    fs.rmSync(jsDir, {
        recursive: true,
        force: true
    });

    return report;

};

module.exports = (coverageInput, testInfo, options = {}) => {

    if (!coverageInput) {
        EC.logRed('[MCR] invalid coverage input');
        return;
    }

    const outputDir = testInfo.outputDir;
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, {
            recursive: true
        });
    }

    if (Array.isArray(coverageInput)) {
        return generateV8Coverage(coverageInput, testInfo, options);
    }

    return generateIstanbulCoverage(coverageInput, testInfo, options);
};
