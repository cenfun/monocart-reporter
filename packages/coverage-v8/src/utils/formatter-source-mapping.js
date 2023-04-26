
const findIndexesOfSubString = (inputString, searchString) => {
    const matches = [];
    let i = inputString.indexOf(searchString);
    while (i !== -1) {
        matches.push(i);
        i = inputString.indexOf(searchString, i + searchString.length);
    }
    return matches;
};

const findLineEndingIndexes = (inputString) => {
    const endings = findIndexesOfSubString(inputString, '\n');
    endings.push(inputString.length);
    return endings;
};

const locationToPosition = (lineEndings, lineNumber, columnNumber) => {
    const position = lineNumber ? lineEndings[lineNumber - 1] + 1 : 0;
    return position + columnNumber;
};

const DEFAULT_COMPARATOR = (a, b) => {
    const n = a > b ? 1 : 0;
    return a < b ? -1 : n;
};

const upperBound = (array, needle, comparator) => {
    let l = 0;
    let r = array.length;
    while (l < r) {
        const m = (l + r) >> 1;
        if (comparator(needle, array[m]) >= 0) {
            l = m + 1;
        } else {
            r = m;
        }
    }
    return r;
};

const positionToLocation = (lineEndings, position) => {
    const lineNumber = upperBound(lineEndings, position - 1, DEFAULT_COMPARATOR);
    let columnNumber;
    if (lineNumber) {
        columnNumber = position - lineEndings[lineNumber - 1] - 1;
    } else {
        columnNumber = position;
    }
    return [lineNumber, columnNumber];
};


export default class {

    constructor(originalContent, formattedContent, mapping) {

        const originalLineEndings = findLineEndingIndexes(originalContent);
        const formattedLineEndings = findLineEndingIndexes(formattedContent);

        this.originalLineEndings = originalLineEndings;
        this.formattedLineEndings = formattedLineEndings;
        this.mapping = mapping;
    }

    positionToFormatted(originalPosition) {
        const formattedPosition = this.convertPosition(this.mapping.original, this.mapping.formatted, originalPosition);
        return positionToLocation(this.formattedLineEndings, formattedPosition);
    }

    originalToFormatted(lineNumber, columnNumber) {
        const originalPosition = locationToPosition(this.originalLineEndings, lineNumber, columnNumber || 0);
        const formattedPosition = this.convertPosition(this.mapping.original, this.mapping.formatted, originalPosition);
        return positionToLocation(this.formattedLineEndings, formattedPosition);
    }

    formattedToOriginal(lineNumber, columnNumber) {
        const formattedPosition = locationToPosition(this.formattedLineEndings, lineNumber, columnNumber || 0);
        const originalPosition = this.convertPosition(this.mapping.formatted, this.mapping.original, formattedPosition);
        return positionToLocation(this.originalLineEndings, originalPosition);
    }

    convertPosition(positions1, positions2, position) {
        const index = upperBound(positions1, position, DEFAULT_COMPARATOR) - 1;
        let convertedPosition = positions2[index] + position - positions1[index];
        if (index < positions2.length - 1 && convertedPosition > positions2[index + 1]) {
            convertedPosition = positions2[index + 1];
        }
        return convertedPosition;
    }
}
