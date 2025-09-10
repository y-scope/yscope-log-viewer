import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";

import {EditorAction} from "../../../utils/actions";
import {
    setupCursorExplicitPosChangeCallback,
    setupCustomActions,
    setupFocusOnBacktickDown,
    setupMobileZoom,
} from "./actions";
import {
    LOG_LANGUAGE_NAME,
    setupCustomLogLanguage,
} from "./language";
import {setupThemes} from "./theme";
import {CustomMonacoEditorHandlers} from "./typings";


/**
 * Generates a source name for verifying explicit cursor position changes.
 *
 * @param funcName
 * @param isExplicit
 * @return
 */
const generateExplicitSourceName = (funcName: string, isExplicit: boolean) => {
    return JSON.stringify({funcName, isExplicit});
};

/**
 * Centers the line in the editor and moves the cursor to the given position.
 *
 * @param editor
 * @param position
 * @param isExplicit
 */
const goToPositionAndCenter = (
    editor: monaco.editor.IStandaloneCodeEditor,
    position: monaco.IPosition,
    isExplicit: boolean,
) => {
    editor.revealLineInCenter(position.lineNumber);
    editor.setPosition(
        position,
        generateExplicitSourceName(goToPositionAndCenter.name, isExplicit)
    );
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
    actions: EditorAction[],
    handlers: CustomMonacoEditorHandlers
): monaco.editor.IStandaloneCodeEditor => {
    setupCustomLogLanguage();
    setupThemes();

    const editor = monaco.editor.create(
        editorContainer,
        {
            // eslint-disable-next-line no-warning-comments
            // TODO: Add custom observer to debounce automatic layout
            automaticLayout: true,
            language: LOG_LANGUAGE_NAME,
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
