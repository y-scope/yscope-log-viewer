import {StateCreator} from "zustand";

import {UI_STATE} from "../../typings/states";
import {
    CURSOR_CODE,
    CursorType,
} from "../../typings/worker";
import useLogFileManagerStore from "../logFileManagerProxyStore";
import {handleErrorWithNotification} from "../notificationStore";
import useUiStore from "../uiStore";
import {VIEW_EVENT_DEFAULT} from "./createViewEventSlice";
import {
    ViewFormattingSlice,
    ViewFormattingValues,
    ViewState,
} from "./types";


const VIEW_FORMATTING_DEFAULT: ViewFormattingValues = {
    isPrettified: false,
};

/**
 * Creates a slice for managing log formatting state.
 *
 * @param set
 * @param get
 * @return
 */
const createViewFormattingSlice: StateCreator<
    ViewState, [], [], ViewFormattingSlice
> = (set, get) => ({
    ...VIEW_FORMATTING_DEFAULT,
    updateIsPrettified: (newIsPrettified: boolean) => {
        const {isPrettified} = get();
        if (newIsPrettified === isPrettified) {
            return;
        }

        const {setUiState} = useUiStore.getState();
        setUiState(UI_STATE.FAST_LOADING);

        set({isPrettified: newIsPrettified});

        const {logEventNum} = get();
        let cursor: CursorType = {code: CURSOR_CODE.LAST_EVENT, args: null};
        if (VIEW_EVENT_DEFAULT.logEventNum !== logEventNum) {
            cursor = {
                code: CURSOR_CODE.EVENT_NUM,
                args: {eventNum: logEventNum},
            };
        }

        (async () => {
            const {logFileManagerProxy} = useLogFileManagerStore.getState();
            const pageData = await logFileManagerProxy.loadPage(cursor, newIsPrettified);

            const {updatePageData} = get();
            updatePageData(pageData);
        })().catch(handleErrorWithNotification);
    },
});

export default createViewFormattingSlice;
