const fs = require('fs');
const path = require('path');
const { deflateSync } = require('lz-utils');
const Util = require('./utils/util.js');
const assetsMap = require('./packages/monocart-reporter-assets.js');

const Assets = {

    getFileContent: (id) => {
        const content = assetsMap[id];
        if (!content) {
            Util.logError(`Not found module: ${id}`);
            return '';
        }
        return content;
    },

    saveHtmlReport: async (options) => {

        const {
            inline,
            reportData,
            jsFiles,
            assetsPath,
            outputDir,
            htmlFile,

            saveReportPath,

            reportDataFile
        } = options;

        // save path
        const htmlPath = path.resolve(outputDir, htmlFile);
        const reportPath = Util.relativePath(htmlPath);
        if (saveReportPath) {
            reportData[saveReportPath] = reportPath;
        }

        //  report data
        const reportDataCompressed = deflateSync(JSON.stringify(reportData));
        const reportDataStr = `window.reportData = '${reportDataCompressed}';`;

        // js libs
        const jsList = [];

        // deps
        jsFiles.forEach((id) => {
            jsList.push({
                filename: `${id}.js`,
                str: Assets.getFileContent(id)
            });
        });

        // html content
        let htmlStr = '';
        const EOL = Util.getEOL();
        if (inline) {
            htmlStr = [
                '<script>',
                reportDataStr,
                ... jsList.map((it) => it.str),
                '</script>'
            ].join(EOL);
        } else {

            await Util.writeFile(path.resolve(outputDir, reportDataFile), reportDataStr);

            const assetsDir = path.resolve(outputDir, assetsPath);
            const relAssetsDir = Util.relativePath(assetsDir, outputDir);

            for (const item of jsList) {
                const filePath = path.resolve(assetsDir, item.filename);
                if (!fs.existsSync(filePath)) {
                    await Util.writeFile(filePath, item.str);
                }
            }

            htmlStr = [
                `<script src="${reportDataFile}"></script>`,
                ... jsList.map((it) => `<script src="${relAssetsDir}/${it.filename}"></script>`)
            ].join(EOL);
        }

        // html
        const template = Assets.getFileContent('template');
        const html = Util.replace(template, {
            title: reportData.title,
            content: htmlStr
        });

        await Util.writeFile(htmlPath, html);

        return reportPath;
    }
};

module.exports = Assets;
