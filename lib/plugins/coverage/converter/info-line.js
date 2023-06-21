module.exports = class InfoLine {
    constructor(line, column) {
        this.line = line;
        this.column = column;
        this.count = 1;
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
