import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";

import {STATE_DEFAULT} from "../contexts/StateContextProvider";
import {Nullable} from "../typings/common";
import {LOG_EVENT_ANCHOR} from "../typings/worker";
import {clamp} from "../utils/math";


enum ACTION_NAME {
    SPECIFIC_PAGE = "specificPage",
    FIRST_PAGE = "firstPage",
    PREV_PAGE = "prevPage",
    NEXT_PAGE = "nextPage",
    LAST_PAGE = "lastPage",
    PAGE_TOP = "pageTop",
    PAGE_BOTTOM = "pageBottom"
}

type ActionType = {
    actionName: Nullable<ACTION_NAME>,
    label: string,
    keyBindings: monaco.KeyCode[],
}

/**
 * Actions that can be performed in the editor. Actions without a name are not triggered by Monaco
 * but will be displayed in a help dialog.
 */
/* eslint-disable sort-keys */
const EDITOR_ACTIONS : ActionType[] = [
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

/**
 * Calculates the new page number and log event anchor.
 *
 * @param action
 * @param specificPageNum Page number for specific page action.
 * @param currentPageNum
 * @param numPages
 * @return The new page number and the log event anchor required for the page request. Returns
 * null if the action is not setup or there is an error validating inputs.
 */
const getPageNumCursorArgs = (
    action: ACTION_NAME,
    specificPageNum: Nullable<number>,
    currentPageNum: number,
    numPages: number
): [Nullable<number>, Nullable<LOG_EVENT_ANCHOR>] => {
    let newPageNum: number;
    let anchor: LOG_EVENT_ANCHOR = LOG_EVENT_ANCHOR.FIRST;

    if (null === specificPageNum && ACTION_NAME.SPECIFIC_PAGE === action) {
        console.error("Specific page action missing page input");

        return [
            null,
            null,
        ];
    }

    if (STATE_DEFAULT.pageNum === currentPageNum) {
        console.error("Page actions cannot be executed if the current page is not set.");

        return [
            null,
            null,
        ];
    }

    switch (action) {
        case ACTION_NAME.SPECIFIC_PAGE:
            // specificPageNum cannot be null, since already checked during loadPage validation.
            // Clamp is to prevent someone from requesting non-existent page.
            newPageNum = clamp(specificPageNum as number, 1, numPages);
            break;
        case ACTION_NAME.FIRST_PAGE:
            newPageNum = 1;
            break;
        case ACTION_NAME.PREV_PAGE:
            anchor = LOG_EVENT_ANCHOR.LAST;
            newPageNum = clamp(currentPageNum - 1, 1, numPages);
            break;
        case ACTION_NAME.NEXT_PAGE:
            newPageNum = clamp(currentPageNum + 1, 1, numPages);
            break;
        case ACTION_NAME.LAST_PAGE:
            anchor = LOG_EVENT_ANCHOR.LAST;
            newPageNum = numPages;
            break;
        default:
            return [
                null,
                null,
            ];
    }

    return [
        newPageNum,
        anchor,
    ];
};

export {
    ACTION_NAME,
    EDITOR_ACTIONS,
    getPageNumCursorArgs,
};
export type {ActionType};
