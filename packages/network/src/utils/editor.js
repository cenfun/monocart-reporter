import { EditorView } from 'codemirror';

import { EditorState, Compartment } from '@codemirror/state';

import {
    keymap, highlightSpecialChars, drawSelection, highlightActiveLine, dropCursor,
    rectangularSelection, crosshairCursor,
    lineNumbers, highlightActiveLineGutter
} from '@codemirror/view';

import {
    defaultHighlightStyle, syntaxHighlighting, indentOnInput, bracketMatching,
    foldGutter, foldKeymap
} from '@codemirror/language';

import { javascript } from '@codemirror/lang-javascript';
import { css } from '@codemirror/lang-css';

const readOnlyCompartment = new Compartment();

let editor;
export const createEditor = (container, textFormatted) => {

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

    const readOnly = readOnlyCompartment.of(EditorState.readOnly.of(true));

    editor = new EditorView({
        parent: container,
        doc: textFormatted,
        extensions: [
            basicSetup,

            javascript(),
            css(),

            readOnly
        ]
    });

    return {
        showContent: (newTextFormatted) => {
            const text = editor.state.doc.toString();
            const transaction = editor.state.update({
                changes: {
                    from: 0,
                    to: text.length,
                    insert: newTextFormatted
                }
            });
            editor.dispatch(transaction);
            editor.scrollDOM.scrollTo(0, 0);
        }
    };

};

