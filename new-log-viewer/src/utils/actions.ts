import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";

import {Nullable} from "../typings/common";
import {clamp} from "../utils/math";


enum ACTION_NAME {
  FIRST_PAGE = "firstPage",
  PREV_PAGE = "prevPage",
  NEXT_PAGE = "nextPage",
  LAST_PAGE = "lastPage",
  PAGE_TOP = "pageTop",
  PAGE_BOTTOM = "pageBottom",
}

type ActionType = {
  actionName: Nullable<ACTION_NAME>;
  label: string;
  keyBindings: monaco.KeyCode[];
};

/**
 * Actions that can be performed in the editor. Actions without a name are not triggered by Monaco
 * but will be displayed in a help dialog.
 */
/* eslint-disable sort-keys */
const EDITOR_ACTIONS: ActionType[] = [
    {
        actionName: null,
        label: "Focus on Editor",
        keyBindings: [monaco.KeyCode.Backquote],
    },
    {
        actionName: ACTION_NAME.FIRST_PAGE,
        label: "First page",
        keyBindings: [
            monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.BracketLeft,
        ],
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
        keyBindings: [
            monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.BracketRight,
        ],
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

/**
 * Handles an action based on the given action name.
 *
 * @param actionName
 * @param pageNum
 * @param numPages
 * @param loadPage
 */
const handleAction = (
    actionName: ACTION_NAME,
    pageNum: Nullable<number>,
    numPages: number,
    loadPage: (newPageNum: number) => void,
) => {
    const safeCurrentPage = pageNum ?? 1;
    let newPage: number = safeCurrentPage;
    switch (actionName) {
        case ACTION_NAME.FIRST_PAGE:
            newPage = 1;
            break;
        case ACTION_NAME.PREV_PAGE: {
            newPage = clamp(safeCurrentPage - 1, 1, numPages);
            break;
        }
        case ACTION_NAME.NEXT_PAGE: {
            newPage = clamp(safeCurrentPage + 1, 1, numPages);
            break;
        }
        case ACTION_NAME.LAST_PAGE:
            newPage = numPages;
            break;
        default:
            break;
    }
    loadPage(newPage);
};

export {
    ACTION_NAME, EDITOR_ACTIONS, handleAction,
};
export type {ActionType};
