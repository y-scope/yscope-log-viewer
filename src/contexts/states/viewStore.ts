import {create} from "zustand";

import {Nullable} from "../../typings/common";
import {LogLevelFilter} from "../../typings/logs";
import {UI_STATE} from "../../typings/states";
import {
    BeginLineNumToLogEventNumMap,
    CURSOR_CODE,
    CursorType,
    EVENT_POSITION_ON_PAGE,
    WORKER_REQ_CODE,
} from "../../typings/worker";
import {
    ACTION_NAME,
    NavigationAction,
} from "../../utils/actions";
import {clamp} from "../../utils/math";
import useLogFileStore from "./logFileStore";
import useMainWorkerStore from "./mainWorkerStore";
import useQueryStore from "./queryStore";
import useUiStore from "./uiStore";


interface ViewState {
    // States
    beginLineNumToLogEventNum: BeginLineNumToLogEventNumMap;
    logData: string;
    numPages: number;
    pageNum: number;

    // Setters
    setBeginLineNumToLogEventNum: (newMap: BeginLineNumToLogEventNumMap) => void;
    setLogData: (newLogData: string) => void;
    setNumPages: (newNumPages: number) => void;
    setPageNum: (newPageNum: number) => void;

    // Actions
    loadPageByAction: (navAction: NavigationAction) => void;
    filterLogs: (filter: LogLevelFilter) => void;
}

const PAGE_METADATA_DEFAULT = {
    beginLineNumToLogEventNum: new Map<number, number>(),
    logData: "Loading...",
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
    ...PAGE_METADATA_DEFAULT,
    filterLogs: (filter: LogLevelFilter) => {
        const {mainWorker} = useMainWorkerStore.getState();
        if (null === mainWorker) {
            console.error("filterLogs: Main worker is not initialized.");

            return;
        }
        const {isPrettified, setUiState} = useUiStore.getState();
        setUiState(UI_STATE.FAST_LOADING);
        const {logEventNum} = useLogFileStore.getState();

        mainWorker.postMessage({
            code: WORKER_REQ_CODE.SET_FILTER,
            args: {
                cursor: {
                    code: CURSOR_CODE.EVENT_NUM,
                    args: {
                        eventNum: 0 === logEventNum ?
                            1 :
                            logEventNum,
                    },
                },
                isPrettified: isPrettified,
                logLevelFilter: filter,
            },
        });
        useQueryStore.getState().startQuery();
    },
    loadPageByAction: (navAction: NavigationAction) => {
        const {mainWorker} = useMainWorkerStore.getState();
        if (null === mainWorker) {
            console.error("loadPageByAction: Main worker is not initialized.");

            return;
        }

        const {fileSrc, logEventNum, loadFile} = useLogFileStore.getState();
        if (navAction.code === ACTION_NAME.RELOAD) {
            if (null === fileSrc || 0 === logEventNum) {
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

        const {numPages, pageNum} = get();
        const cursor = getPageNumCursor(navAction, pageNum, numPages);
        if (null === cursor) {
            console.error(`Error with nav action ${navAction.code}.`);

            return;
        }

        const {isPrettified, setUiState} = useUiStore.getState();
        setUiState(UI_STATE.FAST_LOADING);
        mainWorker.postMessage({
            code: WORKER_REQ_CODE.LOAD_PAGE,
            args: {
                cursor: cursor,
                isPrettified: isPrettified,
            },
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
}));

export default useViewStore;
