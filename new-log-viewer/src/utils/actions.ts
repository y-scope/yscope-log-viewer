import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";

import {Nullable} from "../typings/common";


enum ACTION {
    FIRST_PAGE = "firstPage",
    PREV_PAGE = "prevPage",
    NEXT_PAGE = "nextPage",
    LAST_PAGE = "lastPage",
    PAGE_TOP = "pageTop",
    PAGE_BOTTOM = "pageBottom"
}

type ActionType = {
    action: Nullable<ACTION>,
    label: string,
    keybindings: monaco.KeyCode[],
}

/* eslint-disable sort-keys */
const EDITOR_ACTIONS : ActionType[] = [
    {
        action: null,
        label: "Focus on Editor",
        keybindings: [monaco.KeyCode.Backquote],
    },
    {
        action: ACTION.FIRST_PAGE,
        label: "First page",
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.BracketLeft],
    },
    {
        action: ACTION.PREV_PAGE,
        label: "Previous page",
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.BracketLeft],
    },
    {
        action: ACTION.NEXT_PAGE,
        label: "Next page",
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.BracketRight],
    },
    {
        action: ACTION.LAST_PAGE,
        label: "Last page",
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.BracketRight],
    },
    {
        action: ACTION.PAGE_TOP,
        label: "Top of page",
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyU],
    },
    {
        action: ACTION.PAGE_BOTTOM,
        label: "Bottom of page",
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI],
    },
];
/* eslint-enable sort-keys */

export {
    ACTION,
    EDITOR_ACTIONS,
};
export type {ActionType};
