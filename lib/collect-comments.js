const fs = require('fs');
const babelParser = require('@babel/parser');

const cacheMap = new Map();

const getFileComments = (filePath) => {
    if (!fs.existsSync(filePath)) {
        return [];
    }

    const source = fs.readFileSync(filePath).toString('utf-8');
    const parserOptions = {};
    let ast;
    try {
        ast = babelParser.parse(source, parserOptions);
    } catch (e) {
        console.error(`Unable to parse ${filePath}: ${e.message}`);
        return [];
    }

    return ast.comments;
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

    let list = cacheMap.get(location.file);
    if (!list) {
        list = getFileComments(location.file);
        // cache file info
        cacheMap.set(location.file, list);
    }

    // location prev line
    const comment = list.find((item) => item.loc.end.line === location.line - 1);
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
