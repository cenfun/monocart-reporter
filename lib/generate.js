const fs = require('fs');
const path = require('path');
const EC = require('eight-colors');
const compress = require('lz-utils/lib/compress.js');
const Util = require('./util.js');
const Visitor = require('./visitor.js');

const defaultOption = {
    outputFile: 'playwright-report/report.html'
};

const getOption = (config) => {
    let option = {};
    const reporter = config.reporter;
    if (reporter) {
        //console.log(reporter);
        if (Array.isArray(reporter)) {
            const grid = reporter.find((it) => {
                if (Array.isArray(it)) {
                    const p = `${it[0]}`;
                    if (p && p.indexOf('playwright-report-grid') !== -1) {
                        return true;
                    }
                }
            });
            //console.log(grid);
            if (grid) {
                option = grid[1];
            }
        }
    }
    //console.log(option);
    return {
        ... defaultOption,
        ... option
    };
};
const generate = (root, config) => {

    console.log('[PRG] generating test report ...');

    //console.log(root);
    const option = getOption(config);
    //init outputFolder
    option.outputFolder = path.dirname(option.outputFile);
    //console.log(option);

    const visitor = new Visitor(root, option);
    const info = visitor.getInfo();

    //user config
    const projectConfig = config.projects[0].use.config;
    const reportData = {
        ... projectConfig,
        ... info
    };
    //console.log(reportData);
    const filename = path.basename(option.outputFile, '.html');

    const jsonPath = path.resolve(option.outputFolder, `${filename}.json`);
    Util.writeJSONSync(jsonPath, reportData, true);
    console.log(`[PRG] saved json report: ${EC.cyan(Util.relativePath(jsonPath))}`);

    const reportDistPath = path.resolve(__dirname, 'runtime/grid.js');
    if (!fs.existsSync(reportDistPath)) {
        Util.logRed(`Not found report lib: ${reportDistPath}`);
        return 1;
    }

    //generate html report
    const reportDataStr = compress(JSON.stringify(reportData));
    const reportJs = Util.readFileContentSync(reportDistPath);
    const content = `<script>\nwindow.reportData = '${reportDataStr}';\n${reportJs}\n</script>`;

    //replace template
    let html = Util.getTemplate(path.resolve(__dirname, 'runtime/grid.html'));
    html = Util.replace(html, {
        title: reportData.name,
        content: content
    });

    const htmlPath = path.resolve(option.outputFolder, `${filename}.html`);
    Util.writeFileContentSync(htmlPath, html, true);
    console.log(`[PRG] saved html report: ${EC.cyan(Util.relativePath(htmlPath))}`);

    return 0;
};


module.exports = generate;
