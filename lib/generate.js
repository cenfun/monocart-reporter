const fs = require('fs');
const path = require('path');
const EC = require('eight-colors');
const compress = require('lz-utils/lib/compress.js');
const Util = require('./util.js');
const Visitor = require('./visitor.js');

const defaultOptions = {
    name: '',
    outputFile: './test-results/report.html',
    columns: null
};

const getUserOptions = (config) => {
    // user options
    // testConfig.use  Global options for all tests
    // testProject.use  Options for all tests in this project

    // console.log('config', config);
    // testConfig.use removed after all
    // load from original config

    let userOptions;
    const configFile = config.configFile;
    if (configFile && fs.existsSync(configFile)) {
        try {
            const originalConfig = require(config.configFile);
            if (originalConfig) {
                userOptions = originalConfig.use;
            }
        } catch (e) {
            //
        }
    }
    return userOptions || {};
};

const generate = (root, config, _options = {}) => {

    console.log('[MCR] generating test report ...');

    // console.log(config);

    // console.log(root);

    const options = {
        ... defaultOptions,
        ... _options
    };

    // init outputFolder
    const outputFolder = path.dirname(options.outputFile);
    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder, {
            recursive: true
        });
    }
    // console.log(options);

    // for visitor relative path of attachments
    options.outputFolder = outputFolder;

    const visitor = new Visitor(root, options);
    const data = visitor.getData();

    const userOptions = getUserOptions(config);

    const projectNames = config.projects.map((item) => item.name).join(', ');

    const reportData = {
        ... userOptions,

        // data for grid: columns, rows, errors
        ... data,

        // for report title
        name: options.name || userOptions.name || projectNames || 'Test Report',
        // for report date
        date: Date.now(),
        // playwright version
        version: config.version
    };

    // console.log(reportData);
    const filename = path.basename(options.outputFile, '.html');

    const jsonPath = path.resolve(outputFolder, `${filename}.json`);
    Util.writeJSONSync(jsonPath, reportData, true);
    console.log(`[MCR] saved json report: ${EC.cyan(Util.relativePath(jsonPath))}`);

    const reportDistPath = path.resolve(__dirname, 'runtime/monocart-reporter.js');
    if (!fs.existsSync(reportDistPath)) {
        Util.logRed(`Not found monocart-reporter lib: ${reportDistPath}`);
        return 1;
    }

    // generate html report
    const reportDataStr = compress(JSON.stringify(reportData));
    const reportJs = Util.readFileContentSync(reportDistPath);
    const content = `<script>\nwindow.reportData = '${reportDataStr}';\n${reportJs}\n</script>`;

    // replace template
    let html = Util.getTemplate(path.resolve(__dirname, 'template.html'));
    html = Util.replace(html, {
        title: reportData.name,
        content: content
    });

    const htmlPath = path.resolve(outputFolder, `${filename}.html`);
    Util.writeFileContentSync(htmlPath, html, true);
    console.log(`[MCR] saved html report: ${EC.cyan(Util.relativePath(htmlPath))}`);

    return 0;
};


module.exports = generate;
