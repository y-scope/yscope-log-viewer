import * as monaco from "monaco-editor";

import MODIFY_PAGE_ACTION from "../../services/MODIFY_PAGE_ACTION";
import STATE_CHANGE_TYPE from "../../services/STATE_CHANGE_TYPE";

const SHORTCUTS = [
    {
        id: "nextPage",
        label: "Go To Next Page",
        keybindings: monaco.KeyMod.CtrlCmd | monaco.KeyCode.BracketRight,
        action: STATE_CHANGE_TYPE.page,
        actionArgs: {action: MODIFY_PAGE_ACTION.nextPage},
    },
    {
        id: "prevPage",
        label: "Go To Previous Page",
        keybindings: monaco.KeyMod.CtrlCmd | monaco.KeyCode.BracketLeft,
        action: STATE_CHANGE_TYPE.page,
        actionArgs: {action: MODIFY_PAGE_ACTION.prevPage},
    },
    {
        id: "firstPage",
        label: "Go To First Page",
        keybindings: monaco.KeyMod.CtrlCmd | monaco.KeyCode.Comma,
        action: STATE_CHANGE_TYPE.page,
        actionArgs: {action: MODIFY_PAGE_ACTION.firstPage},
    },
    {
        id: "lastPage",
        label: "Go To Last Page",
        keybindings: monaco.KeyMod.CtrlCmd | monaco.KeyCode.Period,
        action: STATE_CHANGE_TYPE.page,
        actionArgs: {action: MODIFY_PAGE_ACTION.lastPage},
    },
];

export {SHORTCUTS};
