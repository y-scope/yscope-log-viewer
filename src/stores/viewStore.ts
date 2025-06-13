/* eslint-disable max-lines */
import {create} from "zustand";

import {Nullable} from "../typings/common";
import {LogLevelFilter} from "../typings/logs";
import {UI_STATE} from "../typings/states";
import {
    BeginLineNumToLogEventNumMap,
    CURSOR_CODE,
    CursorType,
    EVENT_POSITION_ON_PAGE,
    PageData,
} from "../typings/worker";
import {
    ACTION_NAME,
    NavigationAction,
} from "../utils/actions";
import {
    findNearestLessThanOrEqualElement,
    isWithinBounds,
} from "../utils/data.ts";
import {clamp} from "../utils/math";
import {updateWindowUrlHashParams} from "../utils/url";
import useLogFileManagerStore from "./logFileManagerProxyStore";
import useLogFileStore from "./logFileStore";
import {handleErrorWithNotification} from "./notificationStore";
import useQueryStore from "./queryStore";
import useUiStore from "./uiStore";


interface ViewStoreValues {
    beginLineNumToLogEventNum: BeginLineNumToLogEventNumMap;
    isPrettified: boolean;
    logData: string;
    logEventNum: number;
    numPages: number;
    pageNum: number;
}

interface ViewStoreActions {
    setBeginLineNumToLogEventNum: (newMap: BeginLineNumToLogEventNumMap) => void;
    setLogData: (newLogData: string) => void;
    setNumPages: (newNumPages: number) => void;
    setPageNum: (newPageNum: number) => void;
    filterLogs: (filter: LogLevelFilter) => void;

    loadPageByAction: (navAction: NavigationAction) => void;
    updateLogEventNum: (newLogEventNum: number) => void;
    updateIsPrettified: (newIsPrettified: boolean) => void;
    updatePageData: (pageData: PageData) => void;
}

type ViewState = ViewStoreValues & ViewStoreActions;

const VIEW_STORE_DEFAULT: ViewStoreValues = {
    beginLineNumToLogEventNum: new Map<number, number>(),
    isPrettified: false,
    logData: "No file is open.",
    logEventNum: 0,
    numPages: 0,
    pageNum: 0,
};

/**
 * Returns a `PAGE_NUM` cursor based on a navigation action.
 *
 * @param navAction Action to navigate to a new page.
 * @param currentPageNum
 * @param numPages
 * @return `PAGE_NUM` cursor.
 */
const getPageNumCursor = (
    navAction: NavigationAction,
    currentPageNum: number,
    numPages: number
): Nullable<CursorType> => {
    let newPageNum: number;
    let position: EVENT_POSITION_ON_PAGE;
    switch (navAction.code) {
        case ACTION_NAME.SPECIFIC_PAGE:
            position = EVENT_POSITION_ON_PAGE.TOP;

            // Clamp is to prevent someone from requesting non-existent page.
            newPageNum = clamp(navAction.args.pageNum, 1, numPages);
            break;
        case ACTION_NAME.FIRST_PAGE:
            position = EVENT_POSITION_ON_PAGE.TOP;
            newPageNum = 1;
            break;
        case ACTION_NAME.PREV_PAGE:
            position = EVENT_POSITION_ON_PAGE.BOTTOM;
            newPageNum = clamp(currentPageNum - 1, 1, numPages);
            break;
        case ACTION_NAME.NEXT_PAGE:
            position = EVENT_POSITION_ON_PAGE.TOP;
            newPageNum = clamp(currentPageNum + 1, 1, numPages);
            break;
        case ACTION_NAME.LAST_PAGE:
            position = EVENT_POSITION_ON_PAGE.BOTTOM;
            newPageNum = numPages;
            break;
        default:
            return null;
    }

    return {
        code: CURSOR_CODE.PAGE_NUM,
        args: {pageNum: newPageNum, eventPositionOnPage: position},
    };
};

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

// eslint-disable-next-line max-lines-per-function
const useViewStore = create<ViewState>((set, get) => ({
    ...VIEW_STORE_DEFAULT,
    filterLogs: (filter: LogLevelFilter) => {
        const {setUiState} = useUiStore.getState();
        setUiState(UI_STATE.FAST_LOADING);

        (async () => {
            const {logFileManagerProxy} = useLogFileManagerStore.getState();
            const {isPrettified, logEventNum} = get();
            const pageData = await logFileManagerProxy.setFilter(
                {
                    code: CURSOR_CODE.EVENT_NUM,
                    args: {
                        eventNum: logEventNum,
                    },
                },
                isPrettified,
                filter
            );

            const {updatePageData} = get();
            updatePageData(pageData);

            const {startQuery} = useQueryStore.getState();
            startQuery();
        })().catch(handleErrorWithNotification);
    },
    loadPageByAction: (navAction: NavigationAction) => {
        if (navAction.code === ACTION_NAME.RELOAD) {
            const {fileSrc, loadFile} = useLogFileStore.getState();
            const {logEventNum} = get();
            if (null === fileSrc || VIEW_STORE_DEFAULT.logEventNum === logEventNum) {
                throw new Error(
                    `Unexpected fileSrc=${JSON.stringify(
                        fileSrc
                    )}, logEventNum=${logEventNum} when reloading.`
                );
            }
            loadFile(fileSrc, {
                code: CURSOR_CODE.EVENT_NUM,
                args: {eventNum: logEventNum},
            });

            return;
        }

        const {uiState, setUiState} = useUiStore.getState();
        if (UI_STATE.READY !== uiState) {
            console.warn("Skipping navigation: page load in progress.");

            return;
        }
        setUiState(UI_STATE.FAST_LOADING);

        const {numPages, pageNum} = get();
        const cursor = getPageNumCursor(navAction, pageNum, numPages);
        if (null === cursor) {
            console.error(`Error with nav action ${navAction.code}.`);

            return;
        }

        (async () => {
            const {logFileManagerProxy} = useLogFileManagerStore.getState();
            const {isPrettified} = get();
            const pageData = await logFileManagerProxy.loadPage(cursor, isPrettified);

            const {updatePageData} = get();
            updatePageData(pageData);
        })().catch(handleErrorWithNotification);
    },
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
        if (VIEW_STORE_DEFAULT.logEventNum !== logEventNum) {
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
        const {beginLineNumToLogEventNum} = useViewStore.getState();
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
            const {isPrettified} = useViewStore.getState();

            const pageData = await logFileManagerProxy.loadPage(cursor, isPrettified);
            const {updatePageData} = useViewStore.getState();
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
}));

export default useViewStore;
export {VIEW_STORE_DEFAULT};
