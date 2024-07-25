// starfall-cli config
// https://github.com/cenfun/starfall-cli

const fs = require('fs');
const path = require('path');

const beforeReporter = (item, Util) => {

    const EC = require('eight-colors');
    const { deflateSync } = require('lz-utils');
    const { forEach, formatPath } = require('../lib/utils/util.js');

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

    if (!fs.existsSync(jsonPath)) {
        EC.logRed(`ERROR: Not found test json: ${jsonPath}`);
        return 0;
    }

    const reportData = Util.readJSONSync(jsonPath);
    if (!reportData) {
        EC.logRed(`ERROR: Invalid json: ${jsonPath}`);
        return 0;
    }

    // const addedData = Util.readJSONSync(path.resolve(__dirname, '../.temp/steps.json'));
    // reportData.rows = reportData.rows.concat(addedData.rows);

    // attachment path handler for preview
    if (!item.production) {
        forEach(reportData.rows, (row) => {
            if (row.type === 'case' && row.attachments) {
                row.attachments.forEach((attachment) => {
                    if (attachment.path) {
                        const prevPath = path.resolve(reportData.cwd, reportData.outputDir, attachment.path);
                        const newDir = item.devPath;
                        // console.log(prevPath, newDir);
                        const newPath = path.relative(newDir, prevPath);
                        // console.log(newPath);
                        attachment.path = formatPath(newPath);
                    }
                });
            }
        });
        if (reportData.artifacts) {
            reportData.artifacts.forEach((artifact) => {
                const prevPath = path.resolve(reportData.cwd, reportData.outputDir, artifact.path);
                const newDir = item.devPath;
                // console.log(prevPath, newDir);
                const newPath = path.relative(newDir, prevPath);
                artifact.path = formatPath(newPath);
            });
        }
    }

    const reportDataStr = deflateSync(JSON.stringify(reportData));
    const jsContent = `window.reportData = '${reportDataStr}';`;

    const jsPath = path.resolve(item.buildPath, 'report-data.js');
    Util.writeFileSync(jsPath, jsContent);

    if (!item.dependencies.files.includes(jsPath)) {
        item.dependencies.files.unshift(jsPath);
    }

    return 0;
};

const beforeNetwork = (item, Util) => {

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

    if (!jsDataPath) {
        EC.logRed(`ERROR: Not found ${dataFile} in ${reporterDir}`);
        return 0;
    }

    const jsPath = path.resolve(item.buildPath, dataFile);
    fs.copyFileSync(jsDataPath, jsPath);
    EC.logGreen(`network data file copied: ${dataFile}`);

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
