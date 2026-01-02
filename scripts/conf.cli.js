// starfall-cli config
// https://github.com/cenfun/starfall-cli

const fs = require('fs');
const path = require('path');

const { deflateSync } = require('lz-utils');
const Util = require('../lib/utils/util.js');
const pkg = require('../package.json');
const getDefaultSummary = require('../lib/default/summary.js');
const getDefaultColumns = require('../lib/default/columns.js');

const DEFAULT_OUTPUT_DIR = '.temp/monocart';
const DEFAULT_OUTPUT_FILE = 'index.html';
const FIXTURES_DIR = path.resolve(__dirname, './fixtures');
const REPORT_FIXTURE = path.resolve(FIXTURES_DIR, 'report-default.json');
const NETWORK_FIXTURE = path.resolve(FIXTURES_DIR, 'network-default.json');

const createDefaultSummary = () => {
    const summary = getDefaultSummary();
    Object.keys(summary).forEach((key) => {
        const item = summary[key];
        item.id = key;
        item.value = item.value || 0;
    });
    return summary;
};

const createDefaultSystem = () => {
    const now = Date.now();
    return {
        timestampStart: now,
        timestampEnd: now,
        ticks: [],
        workers: 0,
        jobs: [],
        cwd: process.cwd(),
        outputDir: DEFAULT_OUTPUT_DIR,
        outputFile: DEFAULT_OUTPUT_FILE,
        playwright: '',
        monocart: pkg.version
    };
};

const createDefaultReportData = () => {
    const now = Date.now();
    const locale = 'en-US';
    const timezone = new Date().getTimezoneOffset() / 60;
    return {
        title: 'Monocart Reporter',
        name: 'Monocart Reporter',
        version: pkg.version,
        logo: '',
        date: now,
        dateH: new Date(now).toLocaleString(locale),
        duration: 0,
        durationH: '0s',
        timezone,
        timezoneOffset: timezone,
        locale,
        cwd: process.cwd(),
        outputFile: DEFAULT_OUTPUT_FILE,
        outputDir: DEFAULT_OUTPUT_DIR,
        metadata: {},
        system: createDefaultSystem(),
        artifacts: [],
        trends: [],
        suiteTypes: ['project', 'file', 'describe', 'shard'],
        caseTypes: ['failed', 'flaky', 'skipped', 'passed'],
        traceViewerUrl: '',
        mermaid: null,
        groupOptions: [],
        columns: getDefaultColumns(),
        rows: [],
        formatters: {},
        tags: {},
        summary: createDefaultSummary(),
        pieChart: null
    };
};

const createDefaultNetworkData = () => ({
    title: 'Network Report',
    name: 'Network Report',
    summary: {
        requests: 0,
        size: 0,
        status: {},
        methods: {},
        waterfalls: {}
    },
    log: {
        version: '1.2',
        creator: {
            name: 'Monocart Reporter',
            version: pkg.version
        },
        pages: [],
        entries: []
    }
});

const createReportDataScript = (data) => {
    const compressed = deflateSync(JSON.stringify(data));
    return `window.reportData = '${compressed}';`;
};

// eslint-disable-next-line complexity
const beforeReporter = (item, _cliUtil) => {

    const EC = require('eight-colors');

    // generate reportData for demo
    const jsonPath = path.resolve(__dirname, '../.temp/monocart/index.json');

    // typescript
    // const jsonPath = path.resolve(__dirname, '../../monocart-reporter-examples/docs/typescript/index.json');

    // coverage
    // const jsonPath = path.resolve(__dirname, '../../monocart-reporter-examples/docs/coverage/index.json');

    // network
    // const jsonPath = path.resolve(__dirname, '../../monocart-reporter-examples/docs/network/index.json');

    // merge
    // const jsonPath = path.resolve(__dirname, '../../monocart-reporter-examples/docs/merged/index.json');

    // ten-minutes
    // const jsonPath = path.resolve(__dirname, '../../monocart-reporter-examples/docs/ten-minutes/index.json');

    let reportData;
    if (fs.existsSync(jsonPath)) {
        reportData = Util.readJSONSync(jsonPath);
    }

    if (!reportData && fs.existsSync(REPORT_FIXTURE)) {
        reportData = Util.readJSONSync(REPORT_FIXTURE);
    }

    if (!reportData) {
        reportData = createDefaultReportData();
    }

    reportData.title = reportData.title || reportData.name || 'Monocart Reporter';

    // const addedData = Util.readJSONSync(path.resolve(__dirname, '../.temp/steps.json'));
    // reportData.rows = reportData.rows.concat(addedData.rows);

    const convertDevPath = (p) => {
        if (p) {
            const prevPath = path.resolve(reportData.cwd, reportData.outputDir, p);
            const newDir = item.devPath;
            // console.log(prevPath, newDir);
            const newPath = path.relative(newDir, prevPath);
            return Util.formatPath(newPath);
        }
        return p;
    };

    // attachment path handler for preview
    if (!item.production) {
        Util.forEach(reportData.rows, (row) => {
            if (row.type === 'case' && row.attachments) {
                row.attachments.forEach((attachment) => {
                    attachment.path = convertDevPath(attachment.path);
                });
            }
        });
        if (reportData.artifacts) {
            reportData.artifacts.forEach((artifact) => {
                artifact.path = convertDevPath(artifact.path);
            });
        }

        if (reportData.mermaid) {
            const { scriptSrc } = reportData.mermaid;
            if (scriptSrc && scriptSrc.startsWith('assets')) {
                reportData.mermaid.scriptSrc = convertDevPath(reportData.mermaid.scriptSrc);
            }
        }

    }

    const jsContent = createReportDataScript(reportData);

    const jsPath = path.resolve(item.buildPath, 'report-data.js');
    Util.writeFileSync(jsPath, jsContent);

    if (!item.dependencies.files.includes(jsPath)) {
        item.dependencies.files.unshift(jsPath);
    }

    return 0;
};

const beforeNetwork = (item, _cliUtil) => {

    const EC = require('eight-colors');

    const dataFile = 'network-data.js';

    let jsDataPath;
    const reporterDir = path.resolve(__dirname, '../.temp/monocart');
    if (fs.existsSync(reporterDir)) {
        const networkDir = fs.readdirSync(reporterDir).find((it) => it.startsWith('network-'));
        if (networkDir) {
            jsDataPath = path.resolve(reporterDir, networkDir, dataFile);
        }
    }

    const jsPath = path.resolve(item.buildPath, dataFile);

    if (!jsDataPath) {
        let networkData = null;
        if (fs.existsSync(NETWORK_FIXTURE)) {
            networkData = Util.readJSONSync(NETWORK_FIXTURE);
        }
        if (!networkData) {
            networkData = createDefaultNetworkData();
        }
        const placeholderContent = createReportDataScript(networkData);
        fs.mkdirSync(item.buildPath, {
            recursive: true
        });
        fs.writeFileSync(jsPath, placeholderContent);
    } else {
        fs.copyFileSync(jsDataPath, jsPath);
        EC.logGreen(`network data file copied: ${dataFile}`);
    }

    if (!item.dependencies.files.includes(jsPath)) {
        item.dependencies.files.unshift(jsPath);
    }

    return 0;
};

const copyVendor = (EC, toPath) => {
    EC.logCyan('copy vendor ...');
    const vendorPath = path.resolve(__dirname, '../packages/vendor/dist/monocart-reporter-vendor.js');
    if (!fs.existsSync(vendorPath)) {
        EC.logRed(`ERROR: Not found dist: ${vendorPath}`);
        return;
    }

    const filename = path.basename(vendorPath);
    const toJs = path.resolve(toPath, filename);
    // console.log(distPath, toJs);
    // node 14 do not support cpSync
    fs.writeFileSync(toJs, fs.readFileSync(vendorPath));
    EC.logGreen(`copied ${toJs}`);

    return toJs;
};

const buildAssets = (EC, toPath) => {
    const { createScriptLoader } = require('lz-utils');

    const toJs = path.resolve(toPath, 'monocart-reporter-assets.js');

    const assetsList = [{
        id: 'template',
        getContent: () => {
            const p = path.resolve(__dirname, '../lib/default/template.html');
            if (!fs.existsSync(p)) {
                return;
            }
            return fs.readFileSync(p).toString('utf-8');
        }
    }, {
        id: 'monocart-reporter-app',
        getContent: () => {
            const p = path.resolve(__dirname, '../packages/app/dist/monocart-reporter-app.js');
            if (!fs.existsSync(p)) {
                return;
            }
            const appContent = fs.readFileSync(p).toString('utf-8');
            return createScriptLoader(appContent);
        }
    }, {
        id: 'monocart-reporter-network',
        getContent: () => {
            const p = path.resolve(__dirname, '../packages/network/dist/monocart-reporter-network.js');
            if (!fs.existsSync(p)) {
                return;
            }
            const appContent = fs.readFileSync(p).toString('utf-8');
            return createScriptLoader(appContent);
        }
    }];

    const assetsMap = {};
    for (const item of assetsList) {
        const content = item.getContent();
        if (!content) {
            EC.logRed(`Not found asset: ${item.id}`);
            return;
        }
        assetsMap[item.id] = content;
    }

    fs.writeFileSync(toJs, `module.exports = ${JSON.stringify(assetsMap, null, 4)};`);
    EC.logGreen(`created ${toJs}`);

    return toJs;
};

module.exports = {

    precommit: {
        gitHook: false,
        enable: 'lint + build'
    },

    outdate: {
        exclude: [
            'open'
        ]
    },

    build: {

        vendors: ['app', 'network', 'loader'],

        before: (item, Util) => {

            if (item.production) {
                item.devtool = false;
            }

            if (item.name === 'app') {
                return beforeReporter(item, Util);
            }

            if (item.name === 'network') {
                return beforeNetwork(item, Util);
            }

            return 0;
        },

        afterAll: (results, Util) => {

            const production = results.jobList[0].production;
            if (!production) {
                return 0;
            }

            const EC = require('eight-colors');

            // =====================================================================
            // clean packages
            const toPath = path.resolve(__dirname, '../lib/packages');
            if (fs.existsSync(toPath)) {
                fs.rmSync(toPath, {
                    force: true,
                    recursive: true,
                    maxRetries: 10
                });
                EC.logRed(`clean packages: ${toPath}`);
            }

            fs.mkdirSync(toPath, {
                recursive: true
            });

            // =====================================================================
            // copy vendor
            const distList = [];

            const vendorPath = copyVendor(EC, toPath);
            if (!vendorPath) {
                return 1;
            }

            distList.push(vendorPath);

            // =====================================================================
            // build assets

            const assetsPath = buildAssets(EC, toPath);
            if (!assetsPath) {
                return 1;
            }

            distList.push(assetsPath);

            // =====================================================================
            // show packages
            let index = 1;
            const rows = [];

            distList.forEach((distPath) => {

                if (!distPath) {

                    rows.push({
                        innerBorder: true
                    });

                    return;
                }

                const stat = fs.statSync(distPath);
                const filename = path.basename(distPath);
                rows.push({
                    index,
                    name: EC.green(filename),
                    size: stat.size
                });
                index += 1;

            });

            let total = 0;
            rows.forEach((it) => {
                if (it.size) {
                    total += it.size;
                }
            });

            rows.push({
                innerBorder: true
            });
            rows.push({
                total: true,
                index: '',
                name: 'Total',
                size: total
            });

            EC.log('runtime files:');

            const overSizeColors = {
                red: 500 * 1024,
                orange: 200 * 1024
            };

            Util.CG({
                columns: [{
                    id: 'index',
                    name: 'No.',
                    align: 'right'
                }, {
                    id: 'name',
                    name: 'Runtime File'
                }, {
                    id: 'size',
                    name: 'Size',
                    align: 'right',
                    formatter: function(v, rowData) {
                        const sizeH = Util.BF(v);
                        if (rowData.total) {
                            return sizeH;
                        }
                        if (v > overSizeColors.red) {
                            return Util.addColor(sizeH, 'red');
                        }
                        if (v > overSizeColors.orange) {
                            return Util.addColor(sizeH, 'orange');
                        }
                        return sizeH;
                    }
                }],
                rows: rows
            });

            return 0;
        }

    },

    pack: {
        after: (item, Util) => {
            console.log('after pack, copy attachments to docs');

            // console.log(item);

            const forEachFile = (dir, callback) => {
                if (!fs.existsSync(dir)) {
                    return;
                }
                const dirs = [];
                fs.readdirSync(dir, {
                    withFileTypes: true
                }).forEach((it) => {

                    if (it.isFile()) {
                        callback(it.name, dir);
                        return;
                    }

                    if (it.isDirectory()) {
                        dirs.push(path.resolve(dir, it.name));
                    }
                });

                for (const subDir of dirs) {
                    forEachFile(subDir, callback);
                }

            };

            const reportPath = path.resolve(__dirname, '../.temp/monocart/');
            const files = [];
            forEachFile(reportPath, (filename, dir) => {
                files.push(path.relative(reportPath, path.resolve(dir, filename)));
            });
            const list = files.filter((it) => !['index.html', 'index.json'].includes(it));

            for (const filePath of list) {
                const fromFile = path.resolve(reportPath, filePath);
                const toFile = path.resolve(item.packPath, filePath);

                // do not copy previous
                if (fs.existsSync(toFile)) {
                    continue;
                }

                const toDir = path.dirname(toFile);
                if (!fs.existsSync(toDir)) {
                    fs.mkdirSync(toDir, {
                        recursive: true
                    });
                }

                fs.cpSync(fromFile, toFile);
                Util.logGreen(`pack file copied: ${filePath}`);

            }

            return 0;
        }
    }

};
