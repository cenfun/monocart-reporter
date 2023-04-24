const fs = require('fs');
const path = require('path');
const EC = require('eight-colors');
const Util = require('../utils/util.js');
const compress = require('lz-utils/lib/compress.js');

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
        callback: 'callback',
        ... options
    };

    const filename = 'network.jsonp';

    const jsonStr = Util.readFileSync(harPath);
    const content = `${options.callback}('${compress(jsonStr)}');`;

    const attachmentPath = path.resolve(outputDir, filename);

    fs.writeFileSync(attachmentPath, content);

    testInfo.attachments.push({
        ... Util.attachments.network,
        path: attachmentPath
    });

};
