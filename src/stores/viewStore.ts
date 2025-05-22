import {create} from "zustand";

import {Nullable} from "../typings/common";
import {
    LOG_LEVEL,
    LogLevelFilter,
} from "../typings/logs";
import {DO_NOT_TIMEOUT_VALUE} from "../typings/notifications";
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
import {clamp} from "../utils/math";
import useContextStore, {CONTEXT_STORE_DEFAULT} from "./contextStore";
import useLogFileManagerStore from "./logFileManagerProxyStore";
import useLogFileStore from "./logFileStore";
import useQueryStore from "./queryStore";
import useUiStore from "./uiStore";
import { updateWindowUrlHashParams } from "../utils/url.ts";


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
    setLogEventNum: (newLogEventNum: number) => void;
    setNumPages: (newNumPages: number) => void;
    setPageNum: (newPageNum: number) => void;
    filterLogs: (filter: LogLevelFilter) => void;

    loadPageByAction: (navAction: NavigationAction) => void;
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

// eslint-disable-next-line max-lines-per-function
const useViewStore = create<ViewState>((set, get) => ({
    ...VIEW_STORE_DEFAULT,
    filterLogs: (filter: LogLevelFilter) => {
        const {updatePageData} = get();
        const {logEventNum, postPopUp} = useContextStore.getState();
        const {logFileManagerProxy} = useLogFileManagerStore.getState();
        const {setUiState} = useUiStore.getState();
        setUiState(UI_STATE.FAST_LOADING);

        (async () => {
            const pageData = await logFileManagerProxy.setFilter(
                {
                    code: CURSOR_CODE.EVENT_NUM,
                    args: {
                        eventNum: logEventNum,
                    },
                },
                get().isPrettified,
                filter
            );

            updatePageData(pageData);
        })().catch((e: unknown) => {
            postPopUp({
                level: LOG_LEVEL.ERROR,
                message: String(e),
                timeoutMillis: DO_NOT_TIMEOUT_VALUE,
                title: "Action failed",
            });
        });
        const {startQuery} = useQueryStore.getState();
        startQuery();
    },
    loadPageByAction: (navAction: NavigationAction) => {
        const {isPrettified, numPages, pageNum, updatePageData} = get();
        const {logEventNum, postPopUp} = useContextStore.getState();
        const {logFileManagerProxy} = useLogFileManagerStore.getState();
        const {fileSrc, loadFile} = useLogFileStore.getState();
        const {uiState, setUiState} = useUiStore.getState();
        if (navAction.code === ACTION_NAME.RELOAD) {
            if (null === fileSrc || CONTEXT_STORE_DEFAULT.logEventNum === logEventNum) {
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

        if (UI_STATE.READY !== uiState) {
            console.warn("Skipping navigation: page load in progress.");

            return;
        }

        const cursor = getPageNumCursor(navAction, pageNum, numPages);
        if (null === cursor) {
            console.error(`Error with nav action ${navAction.code}.`);

            return;
        }

        setUiState(UI_STATE.FAST_LOADING);

        (async () => {
            const pageData = await logFileManagerProxy.loadPage(cursor, isPrettified);
            updatePageData(pageData);
        })().catch((e: unknown) => {
            postPopUp({
                level: LOG_LEVEL.ERROR,
                message: String(e),
                timeoutMillis: DO_NOT_TIMEOUT_VALUE,
                title: "Action failed",
            });
        });
    },
    setBeginLineNumToLogEventNum: (newMap) => {
        set({beginLineNumToLogEventNum: newMap});
    },
    setLogData: (newLogData) => {
        set({logData: newLogData});
    },
    setLogEventNum: (newLogEventNum) => {
        set({logEventNum: newLogEventNum});
    },
    setNumPages: (newNumPages) => {
        set({numPages: newNumPages});
    },
    setPageNum: (newPageNum) => {
        set({pageNum: newPageNum});
    },
    updateIsPrettified: (newIsPrettified: boolean) => {
        const {updatePageData} = get();
        const {logEventNum, postPopUp} = useContextStore.getState();
        const {logFileManagerProxy} = useLogFileManagerStore.getState();
        const {setUiState} = useUiStore.getState();
        if (newIsPrettified === get().isPrettified) {
            return;
        }
        set({isPrettified: newIsPrettified});

        setUiState(UI_STATE.FAST_LOADING);
        let cursor: CursorType = {code: CURSOR_CODE.LAST_EVENT, args: null};
        if (CONTEXT_STORE_DEFAULT.logEventNum !== logEventNum) {
            cursor = {
                code: CURSOR_CODE.EVENT_NUM,
                args: {eventNum: logEventNum},
            };
        }

        (async () => {
            const pageData = await logFileManagerProxy.loadPage(cursor, newIsPrettified);
            updatePageData(pageData);
        })().catch((e: unknown) => {
            postPopUp({
                level: LOG_LEVEL.ERROR,
                message: String(e),
                timeoutMillis: DO_NOT_TIMEOUT_VALUE,
                title: "Action failed",
            });
        });
    },
    updatePageData: (pageData: PageData) => {
        const {setUiState} = useUiStore.getState();
        set({
            logData: pageData.logs,
            numPages: pageData.numPages,
            pageNum: pageData.pageNum,
            beginLineNumToLogEventNum: pageData.beginLineNumToLogEventNum,
        });
        updateWindowUrlHashParams({
            logEventNum: pageData.logEventNum,
        });
        setUiState(UI_STATE.READY);
    },
}));

export default useViewStore;
export {VIEW_STORE_DEFAULT};
