const fs = require('fs');
const path = require('path');
const EC = require('eight-colors');

const istanbulReports = require('istanbul-reports');

const IstanbulSummary = require('./istanbul-summary.js');

const {
    V8toIstanbul,
    istanbulLibReport,
    istanbulLibCoverage,
    convertSourceMap
} = require('../../../runtime/monocart-coverage.js');

// const V8toIstanbul = require('v8-to-istanbul');
// const istanbulLibCoverage = require('istanbul-lib-coverage');
// const istanbulLibReport = require('istanbul-lib-report');

const { getSourcePath, collectSourceMaps } = require('../coverage-utils.js');


const saveIstanbulReport = (coverageData, fileSources, options) => {

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

        ... options,

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

    const htmlReport = istanbulReports.create('html', {});
    htmlReport.execute(context);

    if (options.lcov) {
        const lcovReport = istanbulReports.create('lcovonly', {});
        lcovReport.execute(context);
    }

    // add watermarks and color
    const coverageReport = new IstanbulSummary();
    coverageReport.execute(context);
    const report = {
        title: options.title,
        ... coverageReport.getReport()
    };

    return report;
};

// ===================================================================================================

const initIstanbulV8List = async (v8list, options) => {

    // filter list
    const entryFilter = options.entryFilter;
    if (typeof entryFilter === 'function') {
        v8list = v8list.filter(entryFilter);
    }

    // only js with source (without css)
    v8list = v8list.filter((item) => {
        if (typeof item.source === 'string' && item.functions) {
            return true;
        }
    });

    // collect source maps
    if (options.unpackSourceMap) {
        await collectSourceMaps(v8list);
    }

    // init list properties
    v8list.forEach((item, i) => {
        const sourcePath = getSourcePath(item.url, i + 1, 'js');
        const filename = path.basename(sourcePath);
        item.filename = filename;
        item.sourcePath = sourcePath;
        // console.log(sourcePath);
    });

    return v8list;
};

const getConversionSources = (item, fileSources) => {
    const { source, sourceMap } = item;

    fileSources[item.sourcePath] = source;

    const sources = {
        //  remove map file
        source: convertSourceMap.removeMapFileComments(source)
    };

    if (!sourceMap) {
        return sources;
    }

    // =======================================================
    // append sourceMap

    // 'webpack://monocart-v8/external umd "monocart-code-viewer"'
    // format the url to sourcePath

    // resolve source path and add to file sources cache for html report sourceFinder
    sourceMap.sources = sourceMap.sources.map((sourceName, i) => {
        const newSourceName = getSourcePath(sourceName, i + 1);
        fileSources[newSourceName] = sourceMap.sourcesContent[i];
        return newSourceName;
    });

    // console.log(sourceMap.sources);

    // =======================================================
    sources.sourceMap = {
        sourcemap: sourceMap
    };

    return sources;
};

const convertV8ToIstanbul = async (v8list, options) => {

    // console.log('v8list before', v8list.map((it) => it.url));

    v8list = await initIstanbulV8List(v8list, options);

    // console.log('v8list after', v8list.map((it) => it.url));
    // console.log('has map', v8list.filter((it) => it.sourceMap));

    // sourceFilter to excludePath
    const excludePath = typeof options.sourceFilter === 'function' ? (sourceName) => {
        return !options.sourceFilter(sourceName);
    } : () => {
        return false;
    };

    // file sources for istanbul html report sourceFinder in memory
    const fileSources = {};

    // https://github.com/istanbuljs/istanbuljs/tree/master/packages/istanbul-lib-coverage
    const coverageMap = istanbulLibCoverage.createCoverageMap();

    for (const item of v8list) {

        const sources = getConversionSources(item, fileSources);

        // console.log('sources', Object.keys(sources));

        const v8toIstanbul = new V8toIstanbul(item.sourcePath, 0, sources, excludePath);
        // stop resolve source path, already resolved
        v8toIstanbul._resolveSource = (m, p) => {
            return p;
        };

        await v8toIstanbul.load().catch((e) => {
            EC.logRed(`[MCR] ${item.filename} v8toIstanbul.load:`, e.message);
        });

        try {
            v8toIstanbul.applyCoverage(item.functions);
        } catch (e) {
            EC.logRed(`[MCR] ${item.filename} v8toIstanbul.applyCoverage:`, e.message);
        }

        const istanbulData = v8toIstanbul.toIstanbul();
        // console.log('istanbulData', istanbulData);

        coverageMap.merge(istanbulData);

    }

    const coverageData = coverageMap.toJSON();

    // console.log('convertV8ToIstanbul coverageData', Object.keys(coverageData));

    return {
        coverageData,
        fileSources
    };

};

// ===================================================================================================

const mergeIstanbulList = (istanbulList) => {

    const fileSources = {};

    const coverageMap = istanbulLibCoverage.createCoverageMap();
    for (const item of istanbulList) {
        Object.assign(fileSources, item.fileSources);
        coverageMap.merge(item.coverageData);
    }

    const coverageData = coverageMap.toJSON();

    // console.log('merged data', coverageData);

    return {
        coverageData,
        fileSources
    };

};


module.exports = {
    saveIstanbulReport,
    convertV8ToIstanbul,
    mergeIstanbulList
};
