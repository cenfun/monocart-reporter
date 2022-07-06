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
                console.log(`Not found test json: ${jsonPath}`);
                return 1;
            }
            const reportData = Util.readJSONSync(jsonPath);
            if (!reportData) {
                console.log(`Invalid json: ${jsonPath}`);
                return 1;
            }
            const compress = require('lz-utils/lib/compress.js');
            const reportDataStr = compress(JSON.stringify(reportData));
            const jsContent = `window.reportData = '${reportDataStr}';`;
            const jsPath = path.resolve(item.buildPath, 'report-data.js');
            Util.writeFileContentSync(jsPath, jsContent, true);

            item.dependencies.files.unshift(jsPath);

            return 0;
        },

        after: (item, Util) => {

            if (item.minify) {
                //copy dist file to lib
                const fromJs = path.resolve(item.buildPath, `${item.fullName}.js`);
                const toJs = path.resolve(__dirname, 'lib/runtime/grid.js');
                //console.log(fromJs, toJs);
                fs.cpSync(fromJs, toJs);
            }
            return 0;
        }

    }

};
