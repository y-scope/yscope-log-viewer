// Note this is located under src/components/MonacoInstance instead of src/typings because we aim to
// make MonacoInstance a reusable component for other projects.


import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";

import {ACTION} from "../../../utils/actions";


/**
 * Gets called before the `monaco-editor` instance is mounted.
 */
type BeforeMountCallback = () => void;

/**
 * Gets called before the text of the editor is updated.
 *
 * @param editor
 */
type BeforeTextUpdateCallback = (editor: monaco.editor.IStandaloneCodeEditor) => void;

/**
 * Gets called when the cursor position is explicitly changed in the editor.
 *
 * @param ev The event object containing information about the cursor position changes.
 */
type CursorExplicitPosChangeCallback = (ev: monaco.editor.ICursorPositionChangedEvent) => void;

/**
 * Gets called in registered Monaco editor actions.
 *
 * @param action Identifier representing the custom action being performed.
 */
type CustomActionCallback =
    (editor: monaco.editor.IStandaloneCodeEditor, actionName: ACTION) => void;

/**
 * Gets called after the `monaco-editor` instance is mounted.
 */
type MountCallback = (editor: monaco.editor.IStandaloneCodeEditor) => void;

/**
 * Gets called after the text of the editor is updated.
 */
type TextUpdateCallback = (editor: monaco.editor.IStandaloneCodeEditor) => void;

interface CustomMonacoEditorHandlers {
    onCursorExplicitPosChange?: CursorExplicitPosChangeCallback,
    onCustomAction?: CustomActionCallback,
}

export type {
    BeforeMountCallback,
    BeforeTextUpdateCallback,
    CursorExplicitPosChangeCallback,
    CustomActionCallback,
    CustomMonacoEditorHandlers,
    MountCallback,
    TextUpdateCallback,
};
