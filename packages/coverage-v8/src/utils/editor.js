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
    const partialMarker = new GutterMarker();
    partialMarker.elementClass = 'mcr-line-partial';
    const uncoveredMarker = new GutterMarker();
    uncoveredMarker.elementClass = 'mcr-line-uncovered';

    let gutterTypes;
    let gutterMap;
    // let bgMap;

    const updateCoverage = (coverage) => {
        if (coverage.type === 'covered') {
            gutterTypes = [coveredMarker, partialMarker, uncoveredMarker];
        } else {
            gutterTypes = [uncoveredMarker, partialMarker, coveredMarker];
        }
        gutterMap = coverage.gutterMap;
        // bgMap = coverage.bgMap;
    };

    updateCoverage(report.coverage);

    const coverageGutter = gutter({
        class: 'mcr-coverage-gutter',
        lineMarker(view, line) {
            if (line.length === 0) {
                return null;
            }
            const lineIndex = Math.round(line.top / line.height);
            // console.log('lineIndex', lineIndex);
            const v = gutterMap.get(lineIndex);
            if (v) {
                if (v === 'partial') {
                    return gutterTypes[1];
                }
                return gutterTypes[0];
            }
            return gutterTypes[2];
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
            updateCoverage(newReport.coverage);
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

