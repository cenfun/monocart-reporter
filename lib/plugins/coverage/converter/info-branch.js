module.exports = class InfoBranch {
    constructor(sLoc, eLoc, count) {
        this.startLine = sLoc.line + 1;
        this.startColumn = sLoc.column;
        this.endLine = eLoc.line + 1;
        this.endColumn = eLoc.column;
        this.count = count;
    }

    generate() {
        const location = {
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
            type: 'branch',
            line: this.startLine,
            loc: location,
            locations: [{
                ... location
            }]
        };
    }
};
