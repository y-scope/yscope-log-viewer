import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";

import {ActionType} from "../../../utils/actions";
import {
    setupCursorExplicitPosChangeCallback,
    setupCustomActions,
    setupFocusOnBacktickDown,
    setupMobileZoom,
} from "./actions";
import {CustomMonacoEditorHandlers} from "./typings";


/**
 * Centers the line in the editor and moves the cursor to the given position.
 *
 * @param editor
 * @param position
 */
const goToPositionAndCenter = (
    editor: monaco.editor.IStandaloneCodeEditor,
    position: monaco.IPosition,
) => {
    editor.revealLineInCenter(position.lineNumber);
    editor.setPosition(position);
    editor.focus();
};

/**
 * Creates and initializes a Monaco Editor instance.
 *
 * @param editorContainer
 * @param actions
 * @param handlers
 * @return The initialized editor instance.
 */
const createMonacoEditor = (
    editorContainer: HTMLDivElement,
    actions: ActionType[],
    handlers: CustomMonacoEditorHandlers
): monaco.editor.IStandaloneCodeEditor => {
    const editor = monaco.editor.create(
        editorContainer,
        {
            // eslint-disable-next-line no-warning-comments
            // TODO: Add custom observer to debounce automatic layout
            automaticLayout: true,
            maxTokenizationLineLength: 30_000,
            mouseWheelZoom: true,
            readOnly: true,
            renderWhitespace: "none",
            scrollBeyondLastLine: false,
            wordWrap: "on",
        }
    );

    if ("undefined" !== typeof handlers.onCursorExplicitPosChange) {
        setupCursorExplicitPosChangeCallback(editor, handlers.onCursorExplicitPosChange);
    }
    setupMobileZoom(editor, editorContainer);
    setupFocusOnBacktickDown(editor);
    if ("undefined" !== typeof handlers.onCustomAction) {
        setupCustomActions(editor, actions, handlers.onCustomAction);
    }

    return editor;
};

export {
    createMonacoEditor,
    goToPositionAndCenter,
};
