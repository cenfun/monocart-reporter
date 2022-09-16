const fs = require('fs');
const path = require('path');
const EC = require('eight-colors');
const compress = require('lz-utils/lib/compress.js');
const Util = require('./util.js');
const Visitor = require('./visitor.js');

const defaultOptions = {
    outputFile: 'playwright-report/grid/index.html'
};

const generate = (root, config, _options = {}) => {

    console.log('[MCR] generating test report ...');

    //console.log(root);
    const options = {
        ... defaultOptions,
        ... _options
    };

    //init outputFolder
    options.outputFolder = path.dirname(options.outputFile);
    //console.log(options);

    const visitor = new Visitor(root, options);
    const info = visitor.getInfo();

    //user config
    const projectConfig = config.projects[0].use.config;
    const reportData = {
        ... projectConfig,
        ... info
    };
    //console.log(reportData);
    const filename = path.basename(options.outputFile, '.html');

    const jsonPath = path.resolve(options.outputFolder, `${filename}.json`);
    Util.writeJSONSync(jsonPath, reportData, true);
    console.log(`[MCR] saved json report: ${EC.cyan(Util.relativePath(jsonPath))}`);

    const reportDistPath = path.resolve(__dirname, 'runtime/monocart-reporter.js');
    if (!fs.existsSync(reportDistPath)) {
        Util.logRed(`Not found monocart-reporter lib: ${reportDistPath}`);
        return 1;
    }

    //generate html report
    const reportDataStr = compress(JSON.stringify(reportData));
    const reportJs = Util.readFileContentSync(reportDistPath);
    const content = `<script>\nwindow.reportData = '${reportDataStr}';\n${reportJs}\n</script>`;

    //replace template
    let html = Util.getTemplate(path.resolve(__dirname, 'template.html'));
    html = Util.replace(html, {
        title: reportData.name,
        content: content
    });

    const htmlPath = path.resolve(options.outputFolder, `${filename}.html`);
    Util.writeFileContentSync(htmlPath, html, true);
    console.log(`[MCR] saved html report: ${EC.cyan(Util.relativePath(htmlPath))}`);

    return 0;
};


module.exports = generate;
