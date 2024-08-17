import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";

import {ActionType} from "../../../utils/actions";
import {
    setupCursorExplicitPosChangeAction,
    setupCustomActions,
    setupFocusOnBacktickDown,
    setupMobileZoom,
} from "./actions";
import {CustomMonacoEditorHandlers} from "./typings";


/**
 * Centers the line in the editor and change the cursor position.
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
 * Initializes a Monaco Editor instance.
 *
 * @param editorContainer
 * @param actions
 * @param handlers
 * @return The initialized editor instance.
 */
const initMonacoEditor = (
    editorContainer: HTMLDivElement,
    actions: ActionType[],
    handlers: CustomMonacoEditorHandlers
): monaco.editor.IStandaloneCodeEditor => {
    const editor = monaco.editor.create(
        editorContainer,
        {
            // TODO: add custom observer debounce automatic layout
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
        setupCursorExplicitPosChangeAction(editor, handlers.onCursorExplicitPosChange);
    }
    setupMobileZoom(editor, editorContainer);
    setupFocusOnBacktickDown(editor);
    if ("undefined" !== typeof handlers.onCustomAction) {
        setupCustomActions(editor, actions, handlers.onCustomAction);
    }

    return editor;
};

export {
    goToPositionAndCenter,
    initMonacoEditor,
};
