const fs = require('fs');
const Util = require('../utils/util.js');
const { Locator } = require('monocart-formatter/node');

const cacheMap = new Map();

const getFileComments = (sourcePath) => {

    const map = new Map();

    if (!fs.existsSync(sourcePath)) {
        return map;
    }

    // console.log('babel parse file: ', sourcePath);

    const source = fs.readFileSync(sourcePath).toString('utf-8');

    const locator = new Locator(source);

    const { comments, lines } = locator.lineParser;

    // get empty lines, no value
    lines.forEach((item) => {
        if (item.blank) {
            // 0-base
            map.set(item.line + 1, {});
        }
    });

    comments.forEach((item) => {
        const {
            start, end, text
        } = item;

        // using last line
        // 1-base
        const eLoc = locator.offsetToLocation(end);
        map.set(eLoc.line, {
            value: text
        });

        // exists first line
        if (map.has(1)) {
            return;
        }

        // first line comments for file line 0
        const sLoc = locator.offsetToLocation(start);
        if (sLoc.line === 1) {
            map.set(1, {
                value: text
            });
        }

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

module.exports = (metadata) => {
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
        parsedValue = Util.parseComments(comment.value);
        comment.parsedValue = parsedValue;
    }

    return parsedValue;
};
