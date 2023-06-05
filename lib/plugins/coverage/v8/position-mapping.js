
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

class PositionMapping {
    constructor(source, sourceName) {
        this.source = source;
        this.sourceName = sourceName;
        this.lines = this.getLines(source);
        this.ranges = [];
    }

    // =============================================================================

    getSlice(s, e) {
        return this.source.slice(s, e);
    }

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

    offsetToLocation(offset) {
        const lineInfo = findLine(this.lines, offset);
        const column = Math.min(Math.max(offset - lineInfo.start, 0), lineInfo.length);

        // 1-based
        const line = lineInfo.line + 1;

        return {
            line,
            column
        };
    }

    // =============================================================================

    getLines(content) {
        let pos = 0;
        const lines = content.split(/\n/).map((text, line) => {
            const length = text.length;
            const start = pos;
            const end = start + length;

            pos += length + 1;

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

}

module.exports = PositionMapping;

