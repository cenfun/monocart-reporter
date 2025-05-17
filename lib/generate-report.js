const fs = require('fs');
const path = require('path');
const EC = require('eight-colors');
const nodemailer = require('nodemailer');
const Util = require('./utils/util.js');
const emailPlugin = require('./plugins/email.js');
const Assets = require('./assets.js');
const { ZipFile } = require('./packages/monocart-reporter-vendor.js');
// ===========================================================================

const generateJson = (outputDir, filename, reportData, options) => {
    if (!options.json) {
        return;
    }

    const jsonPath = path.resolve(outputDir, `${filename}.json`);
    Util.writeJSONSync(jsonPath, reportData);
    reportData.jsonPath = Util.relativePath(jsonPath);
};

const initZipOptions = (outputDir, filename, zipOptions) => {
    let clean = false;
    let outputFile;
    if (typeof zipOptions === 'string') {
        outputFile = zipOptions;
    } else if (typeof zipOptions === 'object') {
        if (zipOptions.outputFile) {
            outputFile = zipOptions.outputFile;
        }
        if (zipOptions.clean) {
            clean = true;
        }
    }

    if (outputFile) {
        if (!outputFile.endsWith('.zip')) {
            outputFile += '.zip';
        }
        const zipDir = path.dirname(outputFile);
        if (!fs.existsSync(zipDir)) {
            fs.mkdirSync(zipDir, {
                recursive: true
            });
        }

    } else {
        outputFile = path.resolve(outputDir, `${filename}.zip`);
    }


    return {
        outputFile,
        clean
    };
};

const generateZip = (outputDir, filename, reportData, options) => {

    const zipOptions = options.zip;
    if (!zipOptions) {
        return;
    }

    const { outputFile, clean } = initZipOptions(outputDir, filename, zipOptions);

    const reportFiles = [];
    return new Promise((resolve) => {
        const zipFile = new ZipFile();
        zipFile.outputStream.pipe(fs.createWriteStream(outputFile)).on('close', function() {

            reportData.reportFiles = reportFiles;

            // whether to clean the files after zipped
            if (clean) {
                // console.log('clean', reportFiles);
                const dirSet = new Set();
                reportFiles.forEach((f) => {
                    const fp = path.resolve(outputDir, f);
                    dirSet.add(path.dirname(fp));
                    Util.rmSync(fp);
                });

                // clean empty dirs
                const dirList = Array.from(dirSet).reverse();
                dirList.forEach((dir) => {
                    const files = fs.readdirSync(dir);
                    if (files.length === 0) {
                        Util.rmSync(dir);
                    }
                });

            }

            reportData.zipPath = Util.relativePath(outputFile);

            resolve();
        });

        Util.forEachFile(outputDir, (name, dir) => {
            const absPath = path.resolve(dir, name);
            const relPath = Util.relativePath(absPath, outputDir);
            reportFiles.push(relPath);
            // console.log(relPath);
            zipFile.addFile(absPath, relPath);
        });

        zipFile.end();
    });
};

const generateHtml = async (outputDir, filename, reportData, options) => {

    // generate html
    let inline = true;
    if (typeof options.inline === 'boolean') {
        inline = options.inline;
    }

    // deps
    const jsFiles = ['monocart-reporter-app'];
    const htmlFile = `${filename}.html`;

    const htmlPath = await Assets.saveHtmlReport({
        inline,
        reportData,
        jsFiles,
        assetsPath: './assets',
        outputDir,
        htmlFile,

        reportDataFile: 'report-data.js'
    });

    reportData.htmlPath = htmlPath;

};

const showTestResults = (reportData) => {
    Util.logInfo(EC.cyan(reportData.name));

    const summary = reportData.summary;

    const colorHandler = (item, row) => {

        // do not show 'errors' in red
        if (['failed'].includes(item.id) && item.value > 0) {
            row.name = EC.red(row.name);
            row.value = EC.red(row.value);
            return;
        }

        if (['flaky'].includes(item.id) && item.value > 0) {
            row.name = EC.yellow(row.name);
            row.value = EC.yellow(row.value);
            return;
        }

        if (item.id === 'passed') {
            if (summary.failed.value === 0 && summary.passed.value > 0) {
                row.name = EC.green(row.name);
                row.value = EC.green(row.value);
            }
        }
    };

    let rows = [];

    const caseTypes = reportData.caseTypes;
    const suiteSubs = reportData.suiteTypes.map((item) => `${item}s`);

    Object.values(summary).forEach((item) => {
        if (caseTypes.includes(item.id) || suiteSubs.includes(item.id)) {
            return;
        }

        const row = {
            ... item
        };
        colorHandler(item, row);
        rows.push(row);
    });

    const tests = rows.find((it) => it.id === 'tests');
    tests.subs = caseTypes.map((k) => {
        const item = {
            ... summary[k]
        };
        const value = `${item.value}`.padEnd(`${tests.value}`.length, ' ');
        const percent = `(${item.percent})`;
        const row = {
            name: item.name,
            value: `${value} ${percent}`
        };
        colorHandler(item, row);
        return row;
    });

    const suites = rows.find((it) => it.id === 'suites');
    suites.subs = suiteSubs.map((k) => {
        return {
            ... summary[k]
        };
    });

    // for shards
    const system = Array.isArray(reportData.system) ? reportData.system[0] : reportData.system;

    rows = rows.concat([{
        name: 'Playwright',
        value: `v${system.playwright}`
    }, {
        name: 'Date',
        value: Util.dateFormat(reportData.date, reportData.locale)
    }, {
        name: 'Duration',
        value: Util.TF(reportData.duration)
    }]);

    Util.logGrid({
        options: {
            headerVisible: false
        },
        columns: [{
            id: 'name'
        }, {
            id: 'value'
        }],
        rows
    });

};

const onEndHandler = async (reportData, options) => {
    // onEnd callback
    const onEnd = options.onEnd;
    if (typeof onEnd !== 'function') {
        return;
    }

    // generate email data
    emailPlugin(reportData);

    // helper APIs
    const helper = {

        find: (callback) => {
            let foundItem;
            Util.forEach(reportData.rows, (item, parent) => {
                if (callback(item, parent)) {
                    foundItem = item;
                    return 'break';
                }
            });
            return foundItem;
        },

        filter: (callback) => {
            const list = [];
            Util.forEach(reportData.rows, (item, parent) => {
                if (callback(item, parent)) {
                    list.push(item);
                }
            });
            return list;
        },

        forEach: (callback) => {
            Util.forEach(reportData.rows, callback);
        },

        sendEmail: (emailOptions) => {
            if (!emailOptions.transport || !emailOptions.message) {
                Util.logError('invalid email options, transport and message are required (https://nodemailer.com/)');
                return;
            }
            Util.logInfo('sending email ...');
            const transporter = nodemailer.createTransport(emailOptions.transport);
            return transporter.sendMail(emailOptions.message);
        }
    };

    await onEnd(reportData, helper);
};

const onDataHandler = async (reportData, options, rawData) => {
    // onData callback
    const onData = options.onData;
    if (typeof onData !== 'function') {
        return;
    }
    await onData(reportData, rawData);
};


const generateReport = async (reportData, options, rawData) => {

    Util.logInfo('generating test report ...');

    const {
        outputFile, outputDir, artifacts
    } = reportData;

    if (artifacts) {
        artifacts.forEach((report) => {
            const g = report.global ? `${EC.magenta('(global)')}` : '';
            Util.logInfo(`${report.type}: ${EC.cyan(report.path)} ${report.name} ${g}`);
            // convert path to relative reporter
            if (report.path) {
                report.path = Util.relativePath(report.path, outputDir);
            }
        });

        reportData.summary.artifacts = {
            name: 'Artifacts',
            value: artifacts.length
        };

    }

    await onDataHandler(reportData, options, rawData);

    // console.log(reportData);
    const filename = path.basename(outputFile, '.html');

    await generateHtml(outputDir, filename, reportData, options);
    await generateJson(outputDir, filename, reportData, options);
    await generateZip(outputDir, filename, reportData, options);

    await onEndHandler(reportData, options);

    // after onEnd for summary changes
    showTestResults(reportData);

    // clean .cache for merge
    if (options.cacheDir) {
        Util.rmSync(options.cacheDir);
    }

    const {
        htmlPath, jsonPath, zipPath
    } = reportData;

    const assets = [];
    if (jsonPath) {
        assets.push(`json: ${EC.cyan(jsonPath)}`);
    }
    if (zipPath) {
        assets.push(`zip: ${EC.cyan(zipPath)}`);
    }

    if (assets.length) {
        Util.logInfo(assets.join('  '));
    }

    Util.logInfo(`view report: ${EC.cyan(`npx monocart show-report ${htmlPath}`)}`);

    return reportData;
};

module.exports = generateReport;
