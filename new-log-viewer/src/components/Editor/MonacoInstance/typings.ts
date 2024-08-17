// Note this is located under src/components/MonacoInstance instead of src/typings because we aim to
// make MonacoInstance a reusable component for other projects.


import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";

import {ACTION} from "../../../utils/actions";


type CursorExplicitPosChangeCallback = (ev: monaco.editor.ICursorPositionChangedEvent) => void;
type CustomActionCallback =
    (editor: monaco.editor.IStandaloneCodeEditor, action: ACTION) => void;

interface CustomMonacoEditorHandlers {
    onCursorExplicitPosChange?: CursorExplicitPosChangeCallback,
    onCustomAction?: CustomActionCallback,
}

export type {
    CursorExplicitPosChangeCallback,
    CustomActionCallback,
    CustomMonacoEditorHandlers,
};
