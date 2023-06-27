const fs = require('fs');
const { parse } = require('../runtime/monocart-vendor.js');
const Util = require('../utils/util.js');

const cacheMap = new Map();

function getEmptyLines(lines) {
    const emptyLines = [];
    const reg = /\S/;
    lines.forEach((text, i) => {
        if (!reg.test(text)) {
            emptyLines.push(i + 1);
        }
    });
    return emptyLines;
}

const getFileComments = (filePath, parserOptions = {}) => {

    const map = new Map();

    if (!fs.existsSync(filePath)) {
        return map;
    }

    // console.log('babel parse file: ', filePath);

    const source = fs.readFileSync(filePath).toString('utf-8');

    let ast;
    try {
        ast = parse(source, parserOptions);
    } catch (e) {
        Util.logError(e.message);
        Util.logError(`failed to collect comments from the file: ${Util.relativePath(filePath)}`);
        return map;
    }

    ast.comments.forEach((item) => {
        // first line comments for file line 0
        const startLine = item.loc.start.line;
        if (startLine === 1) {
            map.set(1, {
                value: item.value
            });
        }
        map.set(item.loc.end.line, {
            value: item.value
        });
    });

    // get empty lines
    const lines = source.split(Util.lineBreakPattern);
    getEmptyLines(lines).forEach((line) => {
        map.set(line, {});
    });

    return map;
};

const findCommentAbove = (line, map) => {
    if (line <= 1) {
        return;
    }
    const lineAbove = line - 1;
    const comment = map.get(lineAbove);
    if (!comment) {
        return;
    }

    // found
    if (comment.value) {
        return comment;
    }

    // empty line, continue above
    return findCommentAbove(lineAbove, map);

};

const findComment = (line, map) => {
    if (line <= 1) {
        // first line comments for file line 0
        const comment = map.get(1);
        if (comment && comment.value) {
            return comment;
        }
        return;
    }
    return findCommentAbove(line, map);
};

module.exports = (metadata, parserOptions) => {
    const location = metadata.location;
    if (!location) {
        return;
    }

    // location {}
    // file: 'H:\\workspace\\monocart-reporter\\tests\\home-page\\home-page.spec.js',
    // line: 13,
    // column: 6

    let map = cacheMap.get(location.file);
    if (!map) {
        map = getFileComments(location.file, parserOptions);
        // cache file info
        cacheMap.set(location.file, map);
    }

    // location line above
    const comment = findComment(location.line, map);
    if (!comment) {
        return;
    }

    let parsedValue = comment.parsedValue;
    if (!parsedValue) {
        parsedValue = Util.parseComments(comment.value);
        comment.parsedValue = parsedValue;
    }

    return parsedValue;
};
