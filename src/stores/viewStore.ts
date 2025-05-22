import {create} from "zustand";

import {updateWindowUrlHashParams} from "../contexts/UrlContextProvider";
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
import useNotificationStore from "./notificationStore";
import useQueryStore from "./queryStore";
import useUiStore from "./uiStore";


interface ViewStoreValues {
    beginLineNumToLogEventNum: BeginLineNumToLogEventNumMap;
    isPrettified: boolean;
    logData: string;
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
    updateIsPrettified: (newIsPrettified: boolean) => void;
    updatePageData: (pageData: PageData) => void;
}

type ViewState = ViewStoreValues & ViewStoreActions;

const VIEW_STORE_DEFAULT: ViewStoreValues = {
    beginLineNumToLogEventNum: new Map<number, number>(),
    isPrettified: false,
    logData: "No file is open.",
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
        const {setUiState} = useUiStore.getState();
        setUiState(UI_STATE.FAST_LOADING);

        const {clearQuery} = useQueryStore.getState();
        clearQuery();

        (async () => {
            const {logFileManagerProxy} = useLogFileManagerStore.getState();
            const {logEventNum} = useContextStore.getState();
            const {isPrettified} = get();
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
        })().catch((e: unknown) => {
            console.error(e);

            const {postPopUp} = useNotificationStore.getState();
            postPopUp({
                level: LOG_LEVEL.ERROR,
                message: String(e),
                timeoutMillis: DO_NOT_TIMEOUT_VALUE,
                title: "Action failed",
            });
        });
    },
    loadPageByAction: (navAction: NavigationAction) => {
        if (navAction.code === ACTION_NAME.RELOAD) {
            const {fileSrc, loadFile} = useLogFileStore.getState();
            const {logEventNum} = useContextStore.getState();
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
        })().catch((e: unknown) => {
            console.error(e);

            const {postPopUp} = useNotificationStore.getState();
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

        const {logEventNum} = useContextStore.getState();
        let cursor: CursorType = {code: CURSOR_CODE.LAST_EVENT, args: null};
        if (CONTEXT_STORE_DEFAULT.logEventNum !== logEventNum) {
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
        })().catch((e: unknown) => {
            console.error(e);

            const {postPopUp} = useNotificationStore.getState();
            postPopUp({
                level: LOG_LEVEL.ERROR,
                message: String(e),
                timeoutMillis: DO_NOT_TIMEOUT_VALUE,
                title: "Action failed",
            });
        });
    },
    updatePageData: (pageData: PageData) => {
        set({
            logData: pageData.logs,
            numPages: pageData.numPages,
            pageNum: pageData.pageNum,
            beginLineNumToLogEventNum: pageData.beginLineNumToLogEventNum,
        });
        updateWindowUrlHashParams({
            logEventNum: pageData.logEventNum,
        });
        const {setUiState} = useUiStore.getState();
        setUiState(UI_STATE.READY);
    },
}));

export default useViewStore;
export {VIEW_STORE_DEFAULT};
