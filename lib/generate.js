const fs = require('fs');
const path = require('path');
const EC = require('eight-colors');
const compress = require('lz-utils/lib/compress.js');
const Util = require('./util.js');
const Visitor = require('./visitor.js');
const defaultOptions = require('./options.js');

const getUserUse = (config) => {
    // user use options
    // testConfig.use  Global options for all tests
    // testProject.use  Options for all tests in this project

    // console.log('config', config);

    // but testConfig.use get removed in playwright
    // so just load from original config by path config.configFile (invalid in old version)

    let userUse;
    const configFile = config.configFile;
    if (configFile && fs.existsSync(configFile)) {
        try {
            const originalConfig = require(config.configFile);
            if (originalConfig) {
                userUse = originalConfig.use;
            }
        } catch (e) {
            //
        }
    }
    return userUse || {};
};

const generate = async (config, root, userOptions = {}) => {

    console.log('[MCR] generating test report ...');

    // console.log(config);

    // console.log(root);

    const options = {
        ... defaultOptions,
        ... userOptions
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

    const userUse = getUserUse(config);

    const projectNames = config.projects.map((item) => item.name).join(', ');

    const reportData = {
        ... userUse,

        // data for grid: columns, rows, errors
        ... data,

        // for report title
        name: options.name || userUse.name || projectNames || 'Test Report',
        // for report date
        date: Date.now(),
        // playwright version
        version: config.version
    };

    // onEnd hook before save to file
    if (typeof options.onEnd === 'function') {
        await options.onEnd(reportData, config, root);
    }

    // console.log(reportData);
    const filename = path.basename(options.outputFile, '.html');

    const jsonPath = path.resolve(outputFolder, `${filename}.json`);
    Util.writeJSONSync(jsonPath, reportData, true);
    console.log(`[MCR] saved json report: ${EC.cyan(Util.relativePath(jsonPath))}`);

    const reportDistPath = path.resolve(__dirname, 'runtime/monocart-reporter.js');
    if (!fs.existsSync(reportDistPath)) {
        EC.logRed(`Not found monocart-reporter lib: ${reportDistPath}`);
        return;
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

};


module.exports = generate;
