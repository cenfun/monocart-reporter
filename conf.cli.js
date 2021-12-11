const fs = require('fs');
const path = require('path');
const compress = require('lz-utils/lib/compress.js');
module.exports = {

    preCommit: false,

    moduleOverrides: {
        'vue': {
            main: ['dist/vue.js']
        }
    },

    hooks: {

        report: {

            beforeBuild: (item, Util) => {
               
                if (item.minify) {
                    //bundle all
                    item.dependencies.modules = [];
                    //console.log(item.dependencies.files);
                    item.dependencies.files = [];
                } else {

                    item.dependencies.files = item.dependencies.files.filter(it => {
                        if (it.indexOf('lz-utils') === -1) {
                            return true;
                        }
                    });
                    
                    //generate reportData 
                    const jsonPath = path.resolve(__dirname, '../h3yun-autotest/.temp/report/playwright-report-grid.json');
                    if (!fs.existsSync(jsonPath)) {
                        console.log(`Not found test json: ${jsonPath}`);
                        return 1;
                    }
                    const reportData = Util.readJSONSync(jsonPath);
                    if (!reportData) {
                        console.log(`Invalid json: ${jsonPath}`);
                        return 1;
                    }
                    const reportDataStr = compress(JSON.stringify(reportData));
                    const jsContent = `window.reportData = '${reportDataStr}';`;
                    const jsPath = path.resolve(item.outputPath, 'report-data.js');
                    Util.writeFileContentSync(jsPath, jsContent, true);
                    const jsFile = Util.relativePath(jsPath);
                    if (!item.dependencies.files.includes(jsFile)) {
                        item.dependencies.files.push(jsFile);
                    }
                    console.log(jsFile);
                }

                return 0;
            },

            afterBuild: (item, Util) => {

                if (item.minify) {
                //copy dist file to lib
                    const fromJs = path.resolve(item.outputPath, `${item.fullName}.js`);
                    const toJs = path.resolve(__dirname, 'lib/report-grid.js');
                    //console.log(fromJs, toJs);
                    fs.cpSync(fromJs, toJs);
                }
                return 0;
            }
        }

    }

};