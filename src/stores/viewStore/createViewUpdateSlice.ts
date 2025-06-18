import {StateCreator} from "zustand";

import {UI_STATE} from "../../typings/states";
import {
    CURSOR_CODE,
    CursorType,
    PageData,
} from "../../typings/worker";
import {
    findNearestLessThanOrEqualElement,
    isWithinBounds,
} from "../../utils/data";
import {clamp} from "../../utils/math";
import {updateWindowUrlHashParams} from "../../utils/url";
import useLogFileManagerStore from "../logFileManagerProxyStore";
import useLogFileStore from "../logFileStore";
import {handleErrorWithNotification} from "../notificationStore";
import useUiStore from "../uiStore";
import {
    ViewState,
    ViewUpdateSlice,
    ViewValues,
} from "./types";


/**
 * Updates the log event number in the URL to `logEventNum` if it's within the bounds of
 * `logEventNumsOnPage`.
 *
 * @param logEventNum
 * @param logEventNumsOnPage
 * @return Whether `logEventNum` is within the bounds of `logEventNumsOnPage`.
 */
const updateUrlIfEventOnPage = (
    logEventNum: number,
    logEventNumsOnPage: number[]
): boolean => {
    if (false === isWithinBounds(logEventNumsOnPage, logEventNum)) {
        return false;
    }

    const nearestIdx = findNearestLessThanOrEqualElement(
        logEventNumsOnPage,
        logEventNum
    );

    // Since `isWithinBounds` returned `true`, then:
    // - `logEventNumsOnPage` must bound `logEventNum`.
    // - `logEventNumsOnPage` cannot be empty.
    // - `nearestIdx` cannot be `null`.
    //
    // Therefore, we can safely cast:
    // - `nearestIdx` from `Nullable<number>` to `number`.
    // - `logEventNumsOnPage[nearestIdx]` from `number | undefined` to `number`.
    const nearestLogEventNum = logEventNumsOnPage[nearestIdx as number] as number;

    updateWindowUrlHashParams({
        logEventNum: nearestLogEventNum,
    });

    return true;
};

const VIEW_VALUES_DEFAULT: ViewValues = {
    beginLineNumToLogEventNum: new Map<number, number>(),
    isPrettified: false,
    logData: "No file is open.",
    logEventNum: 0,
    numPages: 0,
    pageNum: 0,
};

/**
 * Creates a slice for updating the view state.
 *
 * @param set
 * @param get
 * @return
 */
const createViewUpdateSlice: StateCreator<
    ViewState, [], [], ViewUpdateSlice
// eslint-disable-next-line max-lines-per-function
> = (set, get) => ({
    ...VIEW_VALUES_DEFAULT,
    setBeginLineNumToLogEventNum: (newMap) => {
        set({beginLineNumToLogEventNum: newMap});
    },
    setLogData: (newLogData) => {
        set({logData: newLogData});
    },
    setNumPages: (newNumPages) => {
        set({numPages: newNumPages});
    },
    setPageNum: (newPageNum) => {
        set({pageNum: newPageNum});
    },
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
        if (VIEW_VALUES_DEFAULT.logEventNum !== logEventNum) {
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
    updateLogEventNum: (newLogEventNum) => {
        const {numEvents} = useLogFileStore.getState();
        if (0 === numEvents) {
            return;
        }

        const clampedLogEventNum = clamp(newLogEventNum, 1, numEvents);
        const {beginLineNumToLogEventNum} = get();
        const logEventNumsOnPage: number [] = Array.from(beginLineNumToLogEventNum.values());
        set({logEventNum: clampedLogEventNum});
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
    updatePageData: (pageData: PageData) => {
        set({
            logData: pageData.logs,
            numPages: pageData.numPages,
            pageNum: pageData.pageNum,
            beginLineNumToLogEventNum: pageData.beginLineNumToLogEventNum,
        });
        const newLogEventNum = pageData.logEventNum;
        updateWindowUrlHashParams({logEventNum: newLogEventNum});
        const {updateLogEventNum} = get();
        updateLogEventNum(newLogEventNum);
        const {setUiState} = useUiStore.getState();
        setUiState(UI_STATE.READY);
    },
});

export {
    createViewUpdateSlice,
    VIEW_VALUES_DEFAULT,
};
