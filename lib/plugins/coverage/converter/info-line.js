module.exports = class InfoLine {
    constructor(line, column, count = 1) {
        this.line = line;
        this.column = column;
        this.count = count;
    }

    generate() {
        return {
            start: {
                line: this.line,
                column: 0
            },
            end: {
                line: this.line,
                column: this.column
            }
        };
    }
};
