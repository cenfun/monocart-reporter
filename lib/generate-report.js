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

const generateJson = (outputFolder, filename, reportData) => {
    let jsonPath = path.resolve(outputFolder, `${filename}.json`);
    Util.writeJSONSync(jsonPath, reportData, true);
    jsonPath = Util.relativePath(jsonPath);
    console.log(`[MCR] saved json report: ${EC.cyan(jsonPath)}`);
    return jsonPath;
};

const generateHtml = (outputFolder, filename, reportData) => {
    const reportDistPath = path.resolve(__dirname, 'runtime/monocart-reporter.js');
    const errMsg = `Not found runtime lib: ${Util.formatPath(reportDistPath)}`;

    let reportJs = `console.error("${errMsg}");`;
    if (fs.existsSync(reportDistPath)) {
        reportJs = Util.readFileContentSync(reportDistPath);
    } else {
        EC.logRed(errMsg);
    }

    const reportDataStr = compress(JSON.stringify(reportData));
    const content = `<script>\nwindow.reportData = '${reportDataStr}';\n${reportJs}\n</script>`;

    // replace template
    let html = Util.getTemplate(path.resolve(__dirname, 'template.html'));
    html = Util.replace(html, {
        title: reportData.name,
        content: content
    });

    let htmlPath = path.resolve(outputFolder, `${filename}.html`);
    Util.writeFileContentSync(htmlPath, html, true);
    htmlPath = Util.relativePath(htmlPath);
    console.log(`[MCR] saved html report: ${EC.cyan(htmlPath)}`);

    return htmlPath;
};

const generateReport = async (config, root, userOptions = {}) => {

    console.log('[MCR] generating test report ...');

    // console.log(config, root);

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
    const data = await visitor.getData();

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

    // console.log(reportData);
    const filename = path.basename(options.outputFile, '.html');

    // generate json
    const jsonPath = generateJson(outputFolder, filename, reportData);

    // generate html
    const htmlPath = generateHtml(outputFolder, filename, reportData);

    // onEnd hook
    if (typeof options.onEnd !== 'function') {
        return;
    }
    // for onEnd after saved
    reportData.jsonPath = jsonPath;
    reportData.htmlPath = htmlPath;

    return options.onEnd(reportData, config, root);

};


module.exports = generateReport;
