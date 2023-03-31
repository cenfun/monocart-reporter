const fs = require('fs');
const babelParser = require('@babel/parser');

const cacheMap = new Map();

function getEmptyLines(lines) {
    return lines.map((line, i) => ({
        code: line.trim(),
        num: i + 1
    })).filter((line) => !line.code).map((line) => line.num);
}

const getFileComments = (filePath) => {

    const map = new Map();

    if (!fs.existsSync(filePath)) {
        return map;
    }

    const source = fs.readFileSync(filePath).toString('utf-8');

    const parserOptions = {};
    let ast;
    try {
        ast = babelParser.parse(source, parserOptions);
    } catch (e) {
        console.error(`Unable to parse ${filePath}: ${e.message}`);
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
    const lineBreakPattern = /\r\n|[\r\n\u2028\u2029]/gu;
    const lines = source.split(lineBreakPattern);
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

const getParsedValue = (value) => {

    // starts with @ , ends with * or next @
    const reg = /@(\w+)\s+([^@*]+)/g;

    const matches = `${value}`.matchAll(reg);

    const parsed = {};
    for (const match of matches) {
        // 0 is whole matched
        parsed[match[1]] = match[2].trim();
    }

    return parsed;
};

const collectComments = (metadata) => {
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
        map = getFileComments(location.file);
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
        parsedValue = getParsedValue(comment.value);
        comment.parsedValue = parsedValue;
    }

    return parsedValue;
};

module.exports = collectComments;
