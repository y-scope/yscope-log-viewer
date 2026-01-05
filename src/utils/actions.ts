import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";

import {ACTION_NAME} from "../typings/actions";
import {Nullable} from "../typings/common";


interface EditorAction {
    actionName: Nullable<ACTION_NAME>;
    contextMenuGroupId?: string;
    contextMenuOrder?: number;
    keyBindings: monaco.KeyCode[];
    label: string;
}

/**
 * Actions that can be performed in the editor. Actions without a name are not triggered by Monaco
 * but will be displayed in a help dialog.
 */
const EDITOR_ACTIONS: EditorAction[] = [
    {
        actionName: null,
        keyBindings: [monaco.KeyCode.Backquote],
        label: "Focus on Editor",
    },
    {
        actionName: ACTION_NAME.FIRST_PAGE,
        keyBindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.BracketLeft],
        label: "Page: First Page",
    },
    {
        actionName: ACTION_NAME.PREV_PAGE,
        keyBindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.BracketLeft],
        label: "Page: Previous Page",
    },
    {
        actionName: ACTION_NAME.NEXT_PAGE,
        keyBindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.BracketRight],
        label: "Page: Next Page",
    },
    {
        actionName: ACTION_NAME.LAST_PAGE,
        keyBindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.BracketRight],
        label: "Page: Last Page",
    },
    {
        actionName: ACTION_NAME.PAGE_TOP,
        keyBindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyU],
        label: "Page: Top of Page",
    },
    {
        actionName: ACTION_NAME.PAGE_BOTTOM,
        keyBindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI],
        label: "Page: Bottom of Page",
    },
    {
        actionName: ACTION_NAME.COPY_LOG_EVENT,
        contextMenuGroupId: "9_cutcopypaste",
        contextMenuOrder: 2,
        keyBindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyC],
        label: "View: Copy Log Event",
    },
    {
        actionName: ACTION_NAME.TOGGLE_PRETTIFY,
        keyBindings: [monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.KeyF],
        label: "View: Toggle Prettify",
    },
    {
        actionName: ACTION_NAME.TOGGLE_WORD_WRAP,
        keyBindings: [monaco.KeyMod.Alt | monaco.KeyCode.KeyZ],
        label: "View: Toggle Word Wrap",
    },
];


export type {EditorAction};
export {EDITOR_ACTIONS};
