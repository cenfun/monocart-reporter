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

    let ranges = report.ranges;
    const coverageGutter = gutter({
        class: 'mcr-coverage-gutter',
        lineMarker(view, line) {

            if (line.length === 0) {
                return null;
            }

            const from = line.from;
            const to = line.to;
            // console.log(from, to, report.code.slice(from, to));

            const res = ranges.find((range) => {
                if (from >= range.start && to <= range.end) {
                    return true;
                }
            });

            if (res) {
                return coveredMarker;
            }

            return uncoveredMarker;
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
            ranges = newReport.ranges;
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

