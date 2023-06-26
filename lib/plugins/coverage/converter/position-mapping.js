
const findLine = function(list, position) {
    let start = 0;
    let end = list.length - 1;
    while (end - start > 1) {
        const i = Math.floor((start + end) * 0.5);
        const item = list[i];
        if (position < item.start) {
            end = i;
            continue;
        }
        if (position > item.end) {
            start = i;
            continue;
        }
        return list[i];
    }
    // last two items, less is start
    const endItem = list[end];
    if (position < endItem.start) {
        return list[start];
    }
    return list[end];
};

// =======================================================================================

const isLineSingleCommented = (codeStr) => {
    const singleBlock = /^\s*\/\//g;
    return singleBlock.test(codeStr);
};

const isLineStartCommented = (codeStr) => {
    const multiStartBlock = /^\s*\/\*/g;
    return multiStartBlock.test(codeStr);
};

// multi-comment end but not at end
const isLineEndCommented = (codeStr) => {
    const multiEndBlock = /.*\*\//g;
    return multiEndBlock.test(codeStr);
};

const isLineEndCommentedToEnd = (codeStr) => {
    const multiEndBlock = /.*\*\/\s*$/g;
    return multiEndBlock.test(codeStr);
};

const isLineBlank = (codeStr) => {
    const blankBlock = /\S/;
    return !blankBlock.test(codeStr);
};

class PositionMapping {
    constructor(source) {
        this.source = source;
        this.lines = this.buildLines(source);
        this.commentedLines = [];
        this.blankLines = [];
        this.parseLines(this.lines);
    }

    // =============================================================================

    getSlice(s, e) {
        return this.source.slice(s, e);
    }

    // 1-base
    locationToOffset(location) {
        const { line, column } = location;
        // 1-based
        const lineInfo = this.lines[line - 1];
        if (lineInfo) {
            if (column === Infinity) {
                return lineInfo.start + lineInfo.length;
            }
            return lineInfo.start + column;
        }
        return 0;
    }

    // 1-base
    offsetToLocation(offset) {
        const lineInfo = findLine(this.lines, offset);

        let indent = lineInfo.text.search(/\S/);
        if (indent === -1) {
            indent = lineInfo.length;
        }

        // 1-base
        const line = lineInfo.line + 1;
        const column = Math.min(Math.max(offset - lineInfo.start, 0), lineInfo.length);

        return {
            ... lineInfo,
            line,
            column,
            indent
        };
    }

    // 1-base
    getLine(line) {
        return this.lines[line - 1];
    }

    // =============================================================================

    buildLines(content) {
        let pos = 0;
        const lines = content.split(/\n/).map((text, line) => {

            let n = 1;
            // may ends with \r (don't consider double \r\r for now)
            const reg = /\r$/;
            if (reg.test(text)) {
                text = text.slice(0, -1);
                n += 1;
            }

            const length = text.length;
            const start = pos;
            const end = start + length;

            pos += length + n;

            return {
                line,
                start,
                end,
                length,
                text
            };
        });

        return lines;
    }

    parseLines(lines) {
        const commentedLines = [];
        const blankLines = [];

        let startCommented = false;

        const multiEndHandler = (text, i) => {
            if (isLineEndCommented(text)) {
                startCommented = false;
                if (isLineEndCommentedToEnd(text)) {
                    commentedLines.push(i);
                }
                return;
            }
            commentedLines.push(i);
        };

        lines.forEach((line, i) => {
            const text = line.text;
            if (startCommented) {
                return multiEndHandler(text, i);
            }
            if (isLineStartCommented(text)) {
                startCommented = true;
                return multiEndHandler(text, i);
            }
            if (isLineSingleCommented(text)) {
                commentedLines.push(i);
                return;
            }
            if (isLineBlank(text)) {
                blankLines.push(i);
            }
        });

        this.commentedLines = commentedLines;
        this.blankLines = blankLines;
    }

}

module.exports = PositionMapping;

