import {StateCreator} from "zustand";

import {UI_STATE} from "../../typings/states";
import {
    CURSOR_CODE,
    CursorType,
} from "../../typings/worker";
import {clamp} from "../../utils/math";
import {updateUrlIfEventOnPage} from "../../utils/url";
import useLogFileManagerStore from "../logFileManagerProxyStore";
import useLogFileStore from "../logFileStore";
import {handleErrorWithNotification} from "../notificationStore";
import useUiStore from "../uiStore";
import {
    ViewEventSlice,
    ViewEventValues,
    ViewState,
} from "./types";


const VIEW_EVENT_DEFAULT: ViewEventValues = {
    logEventNum: 0,
};

/**
 * Creates a slice for updating log events.
 *
 * @param set
 * @param get
 * @return
 */
const createViewEventSlice: StateCreator<
    ViewState, [], [], ViewEventSlice
> = (set, get) => ({
    ...VIEW_EVENT_DEFAULT,
    updateLogEventNum: (newLogEventNum) => {
        const {numEvents} = useLogFileStore.getState();
        if (0 === numEvents) {
            return;
        }

        const clampedLogEventNum = clamp(newLogEventNum, 1, numEvents);
        set({logEventNum: clampedLogEventNum});
        const {beginLineNumToLogEventNum} = get();
        const logEventNumsOnPage: number [] = Array.from(beginLineNumToLogEventNum.values());
        if (updateUrlIfEventOnPage(clampedLogEventNum, logEventNumsOnPage)) {
            // No need to request a new page since the log event is on the current page.
            return;
        }

        // If the log event is not on the current page, request a new page.
        const {setUiState} = useUiStore.getState();
        setUiState(UI_STATE.FAST_LOADING);
        (async () => {
            const {logFileManagerProxy} = useLogFileManagerStore.getState();
            const cursor: CursorType = {
                code: CURSOR_CODE.EVENT_NUM,
                args: {eventNum: clampedLogEventNum},
            };
            const {isPrettified} = get();

            const pageData = await logFileManagerProxy.loadPage(cursor, isPrettified);
            const {updatePageData} = get();
            updatePageData(pageData);
        })().catch(handleErrorWithNotification);
    },
});

export {VIEW_EVENT_DEFAULT};
export default createViewEventSlice;
