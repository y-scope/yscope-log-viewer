import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";

import {Nullable} from "../typings/common";


enum ACTION_NAME {
    SPECIFIC_PAGE = "specificPage",
    FIRST_PAGE = "firstPage",
    PREV_PAGE = "prevPage",
    NEXT_PAGE = "nextPage",
    LAST_PAGE = "lastPage",
    PAGE_TOP = "pageTop",
    PAGE_BOTTOM = "pageBottom",
    RELOAD = "reload",
    COPY_LOG_EVENT = "copyLogEvent",
    TOGGLE_PRETTIFY = "togglePrettify",
    WORD_WRAP = "wordWrap",
}

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
const EDITOR_ACTIONS : EditorAction[] = [
    {
        actionName: null,
        keyBindings: [monaco.KeyCode.Backquote],
        label: "Focus on Editor",
    },
    {
        actionName: ACTION_NAME.FIRST_PAGE,
        keyBindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.BracketLeft],
        label: "First page",
    },
    {
        actionName: ACTION_NAME.PREV_PAGE,
        keyBindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.BracketLeft],
        label: "Previous page",
    },
    {
        actionName: ACTION_NAME.NEXT_PAGE,
        keyBindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.BracketRight],
        label: "Next page",
    },
    {
        actionName: ACTION_NAME.LAST_PAGE,
        keyBindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.BracketRight],
        label: "Last page",
    },
    {
        actionName: ACTION_NAME.PAGE_TOP,
        keyBindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyU],
        label: "Top of page",
    },
    {
        actionName: ACTION_NAME.PAGE_BOTTOM,
        keyBindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI],
        label: "Bottom of page",
    },
    {
        actionName: ACTION_NAME.COPY_LOG_EVENT,
        contextMenuGroupId: "9_cutcopypaste",
        contextMenuOrder: 2,
        keyBindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyC],
        label: "Copy Log Event",
    },
    {
        actionName: ACTION_NAME.TOGGLE_PRETTIFY,
        keyBindings: [monaco.KeyMod.Alt | monaco.KeyCode.Shift | monaco.KeyCode.KeyF],
        label: "Toggle Prettify",
    },
    {
        actionName: ACTION_NAME.WORD_WRAP,
        keyBindings: [monaco.KeyMod.Alt | monaco.KeyCode.KeyZ],
        label: "Toggle word wrap",
    },
];

type NavigationActionsMap = {
    [ACTION_NAME.SPECIFIC_PAGE]: {
        pageNum: number;
    };
    [ACTION_NAME.FIRST_PAGE]: null;
    [ACTION_NAME.PREV_PAGE]: null;
    [ACTION_NAME.NEXT_PAGE]: null;
    [ACTION_NAME.LAST_PAGE]: null;
    [ACTION_NAME.RELOAD]: null;
};

type NavigationAction = {
    [T in keyof NavigationActionsMap]:
    {
        code: T;
        args: NavigationActionsMap[T];
    }
} [keyof NavigationActionsMap];

export {
    ACTION_NAME,
    EDITOR_ACTIONS,
};
export type {
    EditorAction,
    NavigationAction,
};
