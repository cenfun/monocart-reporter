// starfall-cli config
// https://github.com/cenfun/starfall-cli

const fs = require('fs');
const path = require('path');

const beforeApp = (item, Util) => {

    const EC = require('eight-colors');
    const compress = require('lz-utils/lib/compress.js');
    const { forEach, formatPath } = require('../lib/utils/util.js');

    // generate reportData for demo
    const jsonPath = path.resolve(__dirname, '../.temp/monocart/index.json');

    // coverage
    // const jsonPath = path.resolve(__dirname, '../../monocart-reporter-test/docs/coverage/index.json');

    // merge
    // const jsonPath = path.resolve(__dirname, '../../monocart-reporter-test/docs/merged/index.json');

    // ten-minutes
    // const jsonPath = path.resolve(__dirname, '../../monocart-reporter-test/docs/ten-minutes/index.json');

    if (!fs.existsSync(jsonPath)) {
        EC.logRed(`ERROR: Not found test json: ${jsonPath}`);
        return 1;
    }

    const reportData = Util.readJSONSync(jsonPath);
    if (!reportData) {
        EC.logRed(`ERROR: Invalid json: ${jsonPath}`);
        return 1;
    }

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
    }

    const reportDataStr = compress(JSON.stringify(reportData));
    const jsContent = `window.reportData = '${reportDataStr}';`;

    const jsPath = path.resolve(item.buildPath, 'report-data.js');
    Util.writeFileSync(jsPath, jsContent);

    if (!item.dependencies.files.includes(jsPath)) {
        item.dependencies.files.unshift(jsPath);
    }

    return 0;
};

const beforeCoverageV8 = (item, Util) => {

    const EC = require('eight-colors');
    const jsDataPath = path.resolve(__dirname, '../.temp/coverage-v8-report-data.js');
    if (!fs.existsSync(jsDataPath)) {
        EC.logRed(`ERROR: Not found test json: ${jsDataPath}`);
        return 1;
    }

    const jsPath = path.resolve(item.buildPath, 'report-data.js');

    fs.copyFileSync(jsDataPath, jsPath);

    if (!item.dependencies.files.includes(jsPath)) {
        item.dependencies.files.unshift(jsPath);
    }

    return 0;
};

module.exports = {

    precommit: {
        gitHook: false,
        enable: 'lint + build'
    },

    build: {

        vendors: ['app', 'coverage-v8'],

        before: (item, Util) => {

            if (item.production) {
                item.devtool = false;
            }

            if (item.name === 'app') {
                return beforeApp(item, Util);
            }

            if (item.name === 'coverage-v8') {
                return beforeCoverageV8(item, Util);
            }

            return 0;
        },

        after: (item, Util) => {

            if (item.production) {
                const EC = require('eight-colors');
                const filename = `${item.fullName}.js`;
                // copy dist file to lib
                const fromJs = path.resolve(item.buildPath, filename);
                if (!fs.existsSync(fromJs)) {
                    EC.logRed(`ERROR: Not found dist: ${fromJs}`);
                    return 1;
                }
                const toPath = path.resolve(__dirname, '../lib/runtime');
                if (!fs.existsSync(toPath)) {
                    fs.mkdirSync(toPath);
                }
                const toJs = path.resolve(toPath, filename);
                // console.log(fromJs, toJs);
                fs.cpSync(fromJs, toJs);

                Util.logGreen(`Copied: ${toJs}`);
            }

            return 0;
        }

    },

    pack: {
        after: (item, Util) => {
            console.log('after pack, copy attachments to docs');

            // console.log(item);

            const copyDir = (fromDir, toDir) => {
                if (!fs.existsSync(toDir)) {
                    fs.mkdirSync(toDir, {
                        recursive: true
                    });
                }

                fs.readdirSync(fromDir, {
                    withFileTypes: true
                }).forEach((it) => {

                    if (it.isFile()) {
                        const fromFile = path.resolve(fromDir, it.name);
                        const toFile = path.resolve(toDir, it.name);
                        // do not copy previous
                        if (!fs.existsSync(toFile)) {
                            fs.cpSync(fromFile, toFile);
                        }
                        return;
                    }

                    if (it.isDirectory()) {
                        fromDir = path.resolve(fromDir, it.name);
                        toDir = path.resolve(toDir, it.name);
                        copyDir(fromDir, toDir);
                    }
                });
            };

            const reportPath = path.resolve(__dirname, '../.temp/monocart/');
            fs.readdirSync(reportPath, {
                withFileTypes: true
            }).forEach((it) => {
                if (it.isDirectory()) {
                    const fromDir = path.resolve(reportPath, it.name);
                    const toDir = path.resolve(item.packPath, it.name);
                    copyDir(fromDir, toDir);
                }
            });

            return 0;
        }
    }

};
