// starfall-cli config
// https://github.com/cenfun/starfall-cli

const fs = require('fs');
const path = require('path');

module.exports = {

    precommit: {
        gitHook: false,
        enable: 'lint + build'
    },

    build: {

        before: (item, Util) => {

            // generate reportData for demo
            const jsonPath = path.resolve(__dirname, '../.temp/monocart/index.json');

            // nothing
            // const jsonPath = path.resolve(__dirname, '../../monocart-reporter-test/docs/nothing/index.json');

            // parallel-unknown
            // const jsonPath = path.resolve(__dirname, '../../monocart-reporter-test/docs/parallel-unknown/index.json');

            // ten-minutes
            // const jsonPath = path.resolve(__dirname, '../../monocart-reporter-test/docs/ten-minutes/index.json');

            if (!fs.existsSync(jsonPath)) {
                Util.logRed(`ERROR: Not found test json: ${jsonPath}`);
                return 1;
            }
            const reportData = Util.readJSONSync(jsonPath);
            if (!reportData) {
                Util.logRed(`ERROR: Invalid json: ${jsonPath}`);
                return 1;
            }
            const compress = require('lz-utils/lib/compress.js');
            const reportDataStr = compress(JSON.stringify(reportData));
            const jsContent = `window.reportData = '${reportDataStr}';`;
            const jsPath = path.resolve(item.buildPath, 'report-data.js');
            Util.writeFileContentSync(jsPath, jsContent, true);

            if (!item.dependencies.files.includes(jsPath)) {
                item.dependencies.files.unshift(jsPath);
            }

            return 0;
        },

        after: (item, Util) => {

            if (item.production) {
                const filename = `${item.fullName}.js`;
                // copy dist file to lib
                const fromJs = path.resolve(item.buildPath, filename);
                if (!fs.existsSync(fromJs)) {
                    Util.logRed(`ERROR: Not found dist: ${fromJs}`);
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
            //

            // console.log(item);

            const reportPath = path.resolve(__dirname, '../.temp/monocart/');
            fs.readdirSync(reportPath, {
                withFileTypes: true
            }).forEach((it) => {
                if (it.isDirectory()) {
                    const dir = `${reportPath}/${it.name}`;
                    fs.readdirSync(dir, {
                        withFileTypes: true
                    }).forEach((sub) => {
                        if (sub.isFile()) {

                            const toDir = path.resolve(item.packPath, it.name);
                            const toFile = path.resolve(toDir, sub.name);

                            // do not copy previous
                            if (fs.existsSync(toFile)) {
                                return;
                            }

                            if (!fs.existsSync(toDir)) {
                                fs.mkdirSync(toDir, {
                                    recursive: true
                                });
                            }

                            fs.cpSync(path.resolve(dir, sub.name), toFile);
                        }
                    });
                }
            });

            return 0;
        }
    }

};
