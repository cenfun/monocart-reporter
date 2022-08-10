const fs = require('fs');
const path = require('path');
module.exports = {

    precommit: {
        gitHook: false,
        enable: 'lint + build'
    },

    build: {

        vendors: ['grid'],

        before: (item, Util) => {

            //generate reportData for demo
            const jsonPath = path.resolve(__dirname, '../monocart-test/.temp/report/report.json');
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
                //copy dist file to lib
                const fromJs = path.resolve(item.buildPath, filename);
                if (!fs.existsSync(fromJs)) {
                    Util.logRed(`ERROR: Not found dist: ${fromJs}`);
                    return 1;
                }
                const toPath = path.resolve(__dirname, 'lib/runtime');
                if (!fs.existsSync(toPath)) {
                    fs.mkdirSync(toPath);
                }
                const toJs = path.resolve(toPath, filename);
                //console.log(fromJs, toJs);
                fs.cpSync(fromJs, toJs);
            }

            return 0;
        }

    }

};
