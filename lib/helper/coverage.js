const fs = require('fs');
const path = require('path');
const EC = require('eight-colors');

const istanbulReports = require('istanbul-reports');
const {
    V8toIstanbul,
    istanbulLibCoverage,
    istanbulLibReport,
    convertSourceMap
} = require('../runtime/monocart-coverage.js');

const Util = require('../utils/util.js');
const CoverageReport = require('./coverage/coverage-report.js');
const { extractSourcemaps } = require('./coverage/sourcemap.js');


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

const getStatus = (value, watermarks) => {
    if (!watermarks) {
        return 'unknown';
    }
    if (value < watermarks[0]) {
        return 'low';
    }
    if (value >= watermarks[1]) {
        return 'high';
    }
    return 'medium';
};

// ========================================================================================================

const generateIstanbulReport = (coverageMap, testInfo, options, sources) => {

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
            if (sources) {
                const source = sources[filePath];
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

    // add watermarks and color
    const coverageReport = new CoverageReport();
    coverageReport.execute(context);
    const report = coverageReport.getReport();

    saveReportAttachment(testInfo, report, options.htmlDir);

    return report;
};

// ========================================================================================================

const toIstanbulReport = async (v8list, testInfo, options) => {

    // filter do not support css
    v8list = v8list.filter((item) => item.type !== 'css');

    // https://github.com/istanbuljs/istanbuljs/tree/master/packages/istanbul-lib-coverage
    const coverageMap = istanbulLibCoverage.createCoverageMap();

    const fileSources = {};

    // const addFileSources = (sourceMap, v8toIstanbul) => {
    //     if (!sourceMap) {
    //         return;
    //     }

    //     const { sources, sourcesContent } = sourceMap.sourcemap;
    //     if (sources && sourcesContent) {
    //         sources.forEach((sourcePath, i) => {
    //             const realPath = v8toIstanbul._resolveSource(sourceMap, sourcePath);
    //             fileSources[realPath] = sourcesContent[i];
    //         });
    //     }
    // };

    for (const item of v8list) {

        let source = item.source || item.text;

        //  remove sourcemap file
        source = convertSourceMap.removeMapFileComments(source);

        const sources = {
            source
        };

        const v8toIstanbul = new V8toIstanbul(item.sourcePath, 0, sources, options.excludePath);

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

    return generateIstanbulReport(coverageMap, testInfo, options, fileSources);

};

// ========================================================================================================

// https://playwright.dev/docs/api/class-coverage

// url, text, ranges: [ {start, end} ]
const getV8CssSummary = (item) => {

    const source = item.text;
    const total = source.length;

    let covered = 0;
    const ranges = item.ranges;
    if (ranges) {
        ranges.forEach((range) => {
            covered += range.end - range.start;
        });
    }

    return {
        name: item.filename,
        type: item.type,
        url: item.url,
        total,
        covered
    };

};


const appendResult = (end, count, result) => {
    const last = result[result.length - 1];
    if (last) {
        if (last.end === end) {
            return;
        }
        if (last.count === count) {
            last.end = end;
            return;
        }
    }
    result.push({
        end: end,
        count: count
    });
};

const convertToDisjointSegments = (ranges, contentLength) => {
    const result = [];
    const stack = [];
    for (const entry of ranges) {
        let top = stack[stack.length - 1];
        while (top && top.endOffset <= entry.startOffset) {
            appendResult(top.endOffset, top.count, result);
            stack.pop();
            top = stack[stack.length - 1];
        }
        appendResult(entry.startOffset, top ? top.count : 0, result);
        stack.push(entry);
    }

    for (let top = stack.pop(); top; top = stack.pop()) {
        appendResult(top.endOffset, top.count, result);
    }

    const last = result[result.length - 1];
    if (last && last.end < contentLength) {
        result.push({
            end: contentLength,
            count: 0
        });
    }

    return result;
};

// url, scriptId, source, functions:[ {functionName, isBlockCoverage, ranges: [{startOffset, endOffset, count}] } ]
const getV8JsSummary = (item) => {

    const source = item.source;
    const total = source.length;

    const flatRanges = Util.getFlatRanges(item.functions);
    const segments = convertToDisjointSegments(flatRanges, total);

    let covered = 0;
    let last = 0;
    segments.forEach((segment) => {
        if (segment.count) {
            const used = segment.end - last;
            covered += used;
        }
        last = segment.end;
    });

    return {
        name: item.filename,
        type: item.type,
        url: item.url,
        total,
        covered
    };
};

const saveV8HtmlReport = async (reportData, options) => {

    const reportDataFile = 'coverage-data.js';
    const jsFiles = ['monocart-code-viewer.js', 'monocart-formatter.js', 'monocart-v8.js'];

    await Util.saveAttachmentHtmlReport(reportData, options, reportDataFile, jsFiles);

};

const generateV8Report = async (v8list, testInfo, options) => {

    options = {
        watermarks: [50, 80],
        inline: false,
        ... options
    };

    const files = [];
    for (const item of v8list) {
        const fileSummary = item.type === 'css' ? getV8CssSummary(item) : getV8JsSummary(item);
        files.push(fileSummary);
        item.summary = fileSummary;
    }

    // calculate pct, status and summary
    let total = 0;
    let covered = 0;
    files.forEach((item) => {

        total += item.total;
        covered += item.covered;

        item.pct = Util.PNF(item.covered, item.total, 2);
        item.status = getStatus(item.pct, options.watermarks);

    });

    const pct = Util.PNF(covered, total, 2);
    const status = getStatus(pct, options.watermarks);

    const summary = {
        total,
        covered,
        pct,
        status
    };

    const htmlReport = {
        title: `Coverage Report - ${testInfo.title}`,
        summary,
        files: v8list
    };

    await saveV8HtmlReport(htmlReport, options);

    const report = {
        type: 'v8',
        summary,
        files
    };

    saveReportAttachment(testInfo, report, options.htmlDir);

    return report;
};

// ========================================================================================================

const generateV8Coverage = async (v8list, testInfo, options) => {

    // temp dir will be removed after finish
    const sourceDir = path.resolve(options.htmlDir, 'source');
    if (!fs.existsSync(sourceDir)) {
        fs.mkdirSync(sourceDir);
    }

    v8list = [].concat(v8list);

    await extractSourcemaps(v8list, options);

    // filter no source or text and init type extname
    v8list = v8list.filter((item) => {
        if (item.source) {
            item.type = 'js';
            item.extname = '.js';
            return true;
        }
        if (item.text) {
            item.type = 'css';
            item.extname = '.css';
            return true;
        }
    });

    const pathMap = {};
    // init list properties
    v8list.forEach((item, i) => {
        const url = Util.getUrl(item.url);
        // console.log(url);

        let host = [url.hostname, url.port].filter((it) => it).join('-');
        if (!host) {
            host = 'anonymous';
        }

        let pathname = url.pathname;
        if (pathname.endsWith('/')) {
            pathname += `index${item.extname}`;
        }
        // except /
        pathname = pathname.replace(/[\\:*?"<>|]/g, '');

        const p = host + pathname;
        const dirname = path.dirname(p);
        // console.log('dirname', dirname);

        item.dirname = dirname;
        // ============================================================

        const extname = item.extname;
        let filename = path.basename(p);
        const ext = path.extname(filename);
        if (ext !== extname) {
            filename += extname;
        }

        // same filename in same dir, plus index number
        if (pathMap[`${dirname}/${filename}`]) {
            filename = `${path.basename(filename, extname)}-${i}${extname}`;
        }
        pathMap[`${dirname}/${filename}`] = true;

        // console.log('filename', filename);
        item.filename = filename;
        // ============================================================

        // source file path
        const fileDir = path.resolve(sourceDir, dirname);
        item.sourcePath = path.resolve(fileDir, filename);

    });

    // save all sources
    for (const item of v8list) {
        const content = item.source || item.text;
        await Util.writeFile(item.sourcePath, content);
        // console.log(`[MCR] coverage file saved: ${filename}`);
    }

    let report;
    if (options.toIstanbul) {
        report = await toIstanbulReport(v8list, testInfo, options);
    } else {
        report = await generateV8Report(v8list, testInfo, options);
    }

    // remove useless sourceDir after report generated
    fs.rmSync(sourceDir, {
        recursive: true,
        force: true
    });

    return report;
};

/**
 * @parameters
 * (@input istanbul.__coverage__: Object, testInfo, options: { watermarks: {} }) -> @output istanbul report
 * (@input v8list: Array, testInfo, options: { toIstanbul: true, watermarks: {} }) -> @output istanbul report (without css supported)
 * (@input v8list: Array, testInfo, options: { watermarks: [], inline: Boolean }) -> @output v8 report (css supported and minified code formatting)
 */
const attachCoverageReport = (coverageInput, testInfo, options = {}) => {

    if (!coverageInput) {
        EC.logRed('[MCR] invalid coverage input');
        return;
    }

    options = {
        outputDir: Util.getOutputDir(testInfo),
        outputName: `coverage-${Util.shortTestId(testInfo.testId)}`,

        // istanbul
        // watermarks: {},

        // v8
        // watermarks: [50,80],
        toIstanbul: false,
        excludePath: function(realPath) {
            return false;
        },
        inline: false,

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

    const coverageMap = istanbulLibCoverage.createCoverageMap(coverageInput);

    return generateIstanbulReport(coverageMap, testInfo, options);
};

// ========================================================================================================

//  add coverage report to global
const addCoverageReport = async (v8list, testInfo, options = {}) => {

    if (!Util.isList(v8list)) {
        EC.logRed('[MCR] invalid coverage input');
        return;
    }

    options = {
        outputDir: Util.getOutputDir(testInfo),
        outputName: 'coverage',

        sourceMap: true,
        // high performance
        // str.search(reg) -> index
        // reg.test(str) -> boolean
        sourceFilter: function(sourceName) {
            const srcReg = /\/src\/.+/g;
            return srcReg.test(sourceName);
        },

        ... options
    };

    // const v8Path = path.resolve(__dirname, '../../.temp/v8-data.js');
    // const v8Data = `module.exports = ${JSON.stringify(v8list, null, 4)};`;
    // fs.writeFileSync(v8Path, v8Data);
    v8list = [].concat(v8list);

    await extractSourcemaps(v8list, options);

    const definition = Util.attachments.artifact;

    const filename = `artifact-${Util.shortTestId(testInfo.testId)}.json`;

    const jsonDir = path.resolve(options.outputDir, options.outputName);
    const jsonPath = path.resolve(jsonDir, filename);

    const artifactContent = JSON.stringify({
        type: 'coverage',
        data: {
            outputDir: jsonDir,
            title: testInfo.title,
            list: v8list
        }
    });

    await Util.writeFile(jsonPath, artifactContent);

    testInfo.attachments.push({
        name: definition.name,
        contentType: definition.contentType,
        path: jsonPath
    });

};

// global coverage report
const generateCoverageReport = async (dataList) => {

};


module.exports = {
    addCoverageReport,
    generateCoverageReport,
    attachCoverageReport
};
