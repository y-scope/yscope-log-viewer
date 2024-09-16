// Note this is located under src/components/MonacoInstance instead of src/typings because we aim to
// make MonacoInstance a reusable component for other projects.


import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";

import {ACTION_NAME} from "../../../utils/actions";


enum TOKEN_NAME {
    CUSTOM_INFO = "customInfo",
    CUSTOM_WARN = "customWarn",
    CUSTOM_ERROR = "customError",
    CUSTOM_FATAL = "customFatal",
    CUSTOM_DATE = "customDate",
    CUSTOM_EXCEPTION = "customException",
    CUSTOM_NUMBER = "customNumber",
    COMMENT = "comment",
}

/**
 * Gets called when the cursor position is explicitly changed in the editor.
 *
 * @param ev The event object containing information about the cursor position change.
 */
type CursorExplicitPosChangeCallback = (ev: monaco.editor.ICursorPositionChangedEvent) => void;

/**
 * Gets called from registered Monaco editor actions.
 *
 * @param editor
 * @param actionName
 */
type CustomActionCallback =
    (editor: monaco.editor.IStandaloneCodeEditor, actionName: ACTION_NAME) => void;


/**
 * Gets called before the `monaco-editor` instance is mounted.
 */
type BeforeMountCallback = () => void;

/**
 * Gets called after the `monaco-editor` instance is mounted.
 *
 * @param editor
 */
type MountCallback = (editor: monaco.editor.IStandaloneCodeEditor) => void;

/**
 * Gets called before the text of the editor is updated.
 *
 * @param editor
 */
type BeforeTextUpdateCallback = (editor: monaco.editor.IStandaloneCodeEditor) => void;

/**
 * Gets called after the text of the editor is updated.
 *
 * @param editor
 */
type TextUpdateCallback = (editor: monaco.editor.IStandaloneCodeEditor) => void;

interface CustomMonacoEditorHandlers {
    onCursorExplicitPosChange?: CursorExplicitPosChangeCallback,
    onCustomAction?: CustomActionCallback,
}

export {TOKEN_NAME};
export type {
    BeforeMountCallback,
    BeforeTextUpdateCallback,
    CursorExplicitPosChangeCallback,
    CustomActionCallback,
    CustomMonacoEditorHandlers,
    MountCallback,
    TextUpdateCallback,
};
