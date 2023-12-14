const Util = require('./util.js');
const { parse } = require('../packages/monocart-vendor.js');

const parseSource = (data) => {
    const {
        source, sourcePath, options
    } = data;

    let ast;
    try {
        ast = parse(source, options);
    } catch (e) {
        Util.logError(`failed to parse source file: ${Util.relativePath(sourcePath)} ${e.message}`);
    }
    return ast;
};

module.exports = parseSource;

