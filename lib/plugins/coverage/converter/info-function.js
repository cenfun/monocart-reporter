module.exports = class InfoFunction {
    constructor(sLoc, eLoc, count, name) {
        this.startLine = sLoc.line;
        this.startColumn = sLoc.column;
        this.endLine = eLoc.line;
        this.endColumn = eLoc.column;
        this.count = count;
        this.name = name || '(anonymous)';
    }

    generate() {
        const loc = {
            start: {
                line: this.startLine,
                column: this.startColumn
            },
            end: {
                line: this.endLine,
                column: this.endColumn
            }
        };
        return {
            name: this.name,
            decl: loc,
            loc: loc,
            line: this.startLine
        };
    }
};
