const fs = require('fs');
const path = require('path');
const EC = require('eight-colors');
const Util = require('../utils/util.js');

module.exports = (harPath, testInfo, options = {}) => {

    if (!fs.existsSync(harPath)) {
        EC.logRed(`[MCR] not found HAR file: ${harPath}`);
        return;
    }

    const outputDir = testInfo.outputDir;
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, {
            recursive: true
        });
    }

    options = {
        callback: 'onInputData',
        ... options
    };

    const filename = 'network.harp';

    const jsonStr = Util.readFileContentSync(harPath);
    const content = `${options.callback}(${jsonStr});`;

    const attachmentPath = path.resolve(outputDir, filename);

    fs.writeFileSync(attachmentPath, content);

    testInfo.attachments.push({
        ... Util.attachments.network,
        path: attachmentPath
    });

};
