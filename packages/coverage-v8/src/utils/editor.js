import { EditorView } from 'codemirror';

import { EditorState, Compartment } from '@codemirror/state';

import {
    keymap, highlightSpecialChars, drawSelection, highlightActiveLine, dropCursor,
    rectangularSelection, crosshairCursor,
    lineNumbers, highlightActiveLineGutter,
    gutter, GutterMarker
} from '@codemirror/view';

import {
    defaultHighlightStyle, syntaxHighlighting, indentOnInput, bracketMatching,
    foldGutter, foldKeymap
} from '@codemirror/language';

import { javascript } from '@codemirror/lang-javascript';
import { css } from '@codemirror/lang-css';

const readOnlyCompartment = new Compartment();

let editor;
export const createEditor = (container, report) => {


    // https://github.com/codemirror/basic-setup/
    const basicSetup = [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),

        foldGutter({
            // custom fold icon
            markerDOM: function(open) {
                const div = document.createElement('div');
                div.className = open ? 'cm-fold cm-fold-open' : 'cm-fold cm-fold-close';
                return div;
            }
        }),
        drawSelection(),
        dropCursor(),
        EditorState.allowMultipleSelections.of(true),
        indentOnInput(),
        syntaxHighlighting(defaultHighlightStyle, {
            fallback: true
        }),
        bracketMatching(),

        rectangularSelection(),
        crosshairCursor(),
        highlightActiveLine(),
        keymap.of([
            ... foldKeymap
        ])
    ];

    // =====================================================================

    const coveredMarker = new GutterMarker();
    coveredMarker.elementClass = 'mcr-line-covered';
    const uncoveredMarker = new GutterMarker();
    uncoveredMarker.elementClass = 'mcr-line-uncovered';

    let rangeLines;
    let lineTypes;
    const updateRanges = (ranges) => {
        rangeLines = ranges.lines;
        if (ranges.type === 'covered') {
            lineTypes = [coveredMarker, uncoveredMarker];
        } else {
            lineTypes = [uncoveredMarker, coveredMarker];
        }
    };

    updateRanges(report.ranges);

    const coverageGutter = gutter({
        class: 'mcr-coverage-gutter',
        lineMarker(view, line) {

            if (line.length === 0) {
                return null;
            }

            const lineIndex = Math.round(line.top / line.height);
            // console.log('lineIndex', lineIndex);

            return rangeLines.includes(lineIndex) ? lineTypes[0] : lineTypes[1];
        }
    });

    // =====================================================================

    const readOnly = readOnlyCompartment.of(EditorState.readOnly.of(true));

    editor = new EditorView({
        parent: container,
        doc: report.content,
        extensions: [
            basicSetup,

            coverageGutter,

            javascript(),
            css(),

            readOnly
        ]
    });

    return {
        showContent: (newReport) => {
            updateRanges(newReport.ranges);
            const text = editor.state.doc.toString();
            const transaction = editor.state.update({
                changes: {
                    from: 0,
                    to: text.length,
                    insert: newReport.content
                }
            });
            editor.dispatch(transaction);
        }
    };

};

