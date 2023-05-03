// starfall-cli config
// https://github.com/cenfun/starfall-cli

const fs = require('fs');
const path = require('path');

const beforeApp = (item, Util) => {

    const EC = require('eight-colors');
    const { compress } = require('lz-utils');
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

const beforeV8 = (item, Util) => {

    const EC = require('eight-colors');
    const dataFile = 'coverage-data.js';
    const jsDataPath = path.resolve(__dirname, `../.temp/${dataFile}`);
    if (!fs.existsSync(jsDataPath)) {
        EC.logRed(`ERROR: Not found: ${jsDataPath}`);
        return 1;
    }

    const jsPath = path.resolve(item.buildPath, dataFile);
    fs.copyFileSync(jsDataPath, jsPath);
    Util.logGreen(`coverage data file copied: ${dataFile}`);

    if (!item.dependencies.files.includes(jsPath)) {
        item.dependencies.files.unshift(jsPath);
    }

    return 0;
};

const beforeNetwork = (item, Util) => {

    const EC = require('eight-colors');

    // const { compress } = require('lz-utils');
    // const harData = fs.readFileSync(path.resolve(__dirname, '../.temp/har/music.163.com.har'));
    // const reportDataStr = `window.reportData = "${compress(harData.toString('utf-8'))}";`;

    const reportDataStr = fs.readFileSync(path.resolve(__dirname, '../.temp/network-data.js'));

    const dataFile = 'network-data.js';
    const jsPath = path.resolve(item.buildPath, dataFile);
    fs.writeFileSync(jsPath, reportDataStr);
    EC.logGreen(`network data file copied: ${dataFile}`);

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

        vendors: ['app', 'v8', 'network'],

        before: (item, Util) => {

            if (item.production) {
                item.devtool = false;
            }

            if (item.name === 'app') {
                return beforeApp(item, Util);
            }

            if (item.name === 'v8') {
                return beforeV8(item, Util);
            }

            if (item.name === 'network') {
                return beforeNetwork(item, Util);
            }

            return 0;
        },

        afterAll: (results) => {

            const EC = require('eight-colors');

            const toPath = path.resolve(__dirname, '../lib/runtime');
            if (!fs.existsSync(toPath)) {
                fs.mkdirSync(toPath);
            }

            const moduleFiles = {};

            results.jobList.forEach((item) => {
                if (!item.production) {
                    return;
                }

                Object.assign(moduleFiles, item.dependencies.moduleFiles);

                const filename = `${item.fullName}.js`;
                // copy dist file to lib
                const fromJs = path.resolve(item.buildPath, filename);
                if (!fs.existsSync(fromJs)) {
                    EC.logRed(`ERROR: Not found dist: ${fromJs}`);
                    return 1;
                }

                const toJs = path.resolve(toPath, filename);
                // console.log(fromJs, toJs);
                fs.cpSync(fromJs, toJs);

                EC.logGreen(`runtime file copied: ${filename}`);

            });

            // copy common components
            const list = [];
            Object.values(moduleFiles).forEach((ls) => {
                ls.forEach((f) => {
                    list.push(f);
                });
            });
            list.forEach((fp) => {
                const filename = path.basename(fp);
                const fromJs = path.resolve(fp);
                if (!fs.existsSync(fromJs)) {
                    EC.logRed(`ERROR: Not found dist: ${fromJs}`);
                    return 1;
                }
                const toJs = path.resolve(toPath, filename);
                // console.log(fromJs, toJs);
                fs.cpSync(fromJs, toJs);
                EC.logGreen(`runtime file copied: ${filename}`);
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
