import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";

import {Nullable} from "../typings/common";


enum ACTION_NAME {
    SPECIFIC_PAGE = "specificPage",
    FIRST_PAGE = "firstPage",
    PREV_PAGE = "prevPage",
    NEXT_PAGE = "nextPage",
    LAST_PAGE = "lastPage",
    PAGE_TOP = "pageTop",
    PAGE_BOTTOM = "pageBottom"
}

type EditorAction = {
    actionName: Nullable<ACTION_NAME>,
    label: string,
    keyBindings: monaco.KeyCode[],
}

/**
 * Actions that can be performed in the editor. Actions without a name are not triggered by Monaco
 * but will be displayed in a help dialog.
 */
/* eslint-disable sort-keys */
const EDITOR_ACTIONS : EditorAction[] = [
    {
        actionName: null,
        label: "Focus on Editor",
        keyBindings: [monaco.KeyCode.Backquote],
    },
    {
        actionName: ACTION_NAME.FIRST_PAGE,
        label: "First page",
        keyBindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.BracketLeft],
    },
    {
        actionName: ACTION_NAME.PREV_PAGE,
        label: "Previous page",
        keyBindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.BracketLeft],
    },
    {
        actionName: ACTION_NAME.NEXT_PAGE,
        label: "Next page",
        keyBindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.BracketRight],
    },
    {
        actionName: ACTION_NAME.LAST_PAGE,
        label: "Last page",
        keyBindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.BracketRight],
    },
    {
        actionName: ACTION_NAME.PAGE_TOP,
        label: "Top of page",
        keyBindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyU],
    },
    {
        actionName: ACTION_NAME.PAGE_BOTTOM,
        label: "Bottom of page",
        keyBindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI],
    },
];
/* eslint-enable sort-keys */

type NavigationActionsMap = {
    [ACTION_NAME.SPECIFIC_PAGE]: {
        pageNum: number,
    },
    [ACTION_NAME.FIRST_PAGE]: null,
    [ACTION_NAME.PREV_PAGE]: null,
    [ACTION_NAME.NEXT_PAGE]: null,
    [ACTION_NAME.LAST_PAGE]: null,
};

type NavigationAction = {
    [T in keyof NavigationActionsMap]:
    { code: T, args: NavigationActionsMap[T] }
} [keyof NavigationActionsMap];

export {
    ACTION_NAME,
    EDITOR_ACTIONS,
};
export type {
    EditorAction,
    NavigationAction,
};
