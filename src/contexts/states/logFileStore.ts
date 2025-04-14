import {create} from "zustand";

import {Nullable} from "../../typings/common";
import {CONFIG_KEY} from "../../typings/config";
import {LogLevelFilter} from "../../typings/logs";
import {PopUpMessage} from "../../typings/notifications";
import {UI_STATE} from "../../typings/states";
import {TAB_NAME} from "../../typings/tab";
import {SEARCH_PARAM_NAMES} from "../../typings/url";
import {
    BeginLineNumToLogEventNumMap,
    CURSOR_CODE,
    CursorType,
    EVENT_POSITION_ON_PAGE,
    FileSrcType,
    WORKER_REQ_CODE,
} from "../../typings/worker";
import {
    ACTION_NAME,
    NavigationAction,
} from "../../utils/actions";
import {getConfig} from "../../utils/config";
import {clamp} from "../../utils/math";
import {updateWindowUrlSearchParams} from "../UrlContextProvider";
import useMainWorkerStore from "./mainWorkerStore";
import useUiStore from "./uiStore";


const LOG_FILE_DEFAULT = {
    activeTabName: getConfig(CONFIG_KEY.INITIAL_TAB_NAME),
    beginLineNumToLogEventNum: new Map<number, number>(),
    fileName: "Loading...",
    fileSrc: null,
    logData: "Loading...",
    logEventNum: 0,
    numEvents: 0,
    numPages: 0,
    onDiskFileSizeInBytes: 0,
    pageNum: 0,
    postPopUp: () => {
    },
};

interface LogFileState {
    activeTabName: TAB_NAME;
    beginLineNumToLogEventNum: BeginLineNumToLogEventNumMap;
    fileName: string;
    fileSrc: Nullable<FileSrcType>;
    logData: string;
    logEventNum: number;
    numEvents: number;
    numPages: number;
    onDiskFileSizeInBytes: number;
    pageNum: number;
    postPopUp: (message: PopUpMessage) => void;

    filterLogs: (filter: LogLevelFilter) => void;
    loadFile: (fileSrc: FileSrcType, cursor: CursorType) => void;
    loadPageByAction: (navAction: NavigationAction) => void;
    setActiveTabName: (tabName: TAB_NAME) => void;
    setBeginLineNumToLogEventNum: (newMap: BeginLineNumToLogEventNumMap) => void;
    setFileName: (newFileName: string) => void;
    setLogData: (newLogData: string) => void;
    setLogEventNum: (newLogEventNum: number) => void;
    setNumEvents: (newNumEvents: number) => void;
    setNumPages: (newNumPages: number) => void;
    setOnDiskFileSizeInBytes: (newOnDiskFileSizeInBytes: number) => void;
    setPageNum: (newPageNum: number) => void;
    setPostPopUp: (postPopUp: (message: PopUpMessage) => void) => void;
}

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

const useLogFileStore = create<LogFileState>((set, get) => ({
    ...LOG_FILE_DEFAULT,
    filterLogs: (filter: LogLevelFilter) => {
        const {mainWorker} = useMainWorkerStore.getState();
        if (null === mainWorker) {
            console.error("filterLogs: Main worker is not initialized.");

            return;
        }
        const {setUiState} = useUiStore.getState();
        setUiState(UI_STATE.FAST_LOADING);
        const {logEventNum} = get();

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
                logLevelFilter: filter,
            },
        });
    },
    loadFile: (fileSrc: FileSrcType, cursor: CursorType) => {
        useUiStore.getState().setUiState(UI_STATE.FILE_LOADING);
        useMainWorkerStore.getState().init();
        const {mainWorker} = useMainWorkerStore.getState();
        if (null === mainWorker) {
            console.error("loadFile: Main worker is not initialized.");

            return;
        }

        set({fileSrc});
        if ("string" !== typeof fileSrc) {
            updateWindowUrlSearchParams({[SEARCH_PARAM_NAMES.FILE_PATH]: null});
        }
        mainWorker.postMessage({
            code: WORKER_REQ_CODE.LOAD_FILE,
            args: {
                fileSrc: fileSrc,
                pageSize: getConfig(CONFIG_KEY.PAGE_SIZE),
                cursor: cursor,
                decoderOptions: getConfig(CONFIG_KEY.DECODER_OPTIONS),
            },
        });
    },
    loadPageByAction: (navAction: NavigationAction) => {
        const {mainWorker} = useMainWorkerStore.getState();
        if (null === mainWorker) {
            console.error("loadPageByAction: Main worker is not initialized.");

            return;
        }

        const {fileSrc, logEventNum, loadFile} = get();
        if (navAction.code === ACTION_NAME.RELOAD) {
            if (null === fileSrc || 0 === logEventNum) {
                throw new Error(`Unexpected fileSrc=${JSON.stringify(fileSrc)
                }, logEventNum=${logEventNum} when reloading.`);
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

        const {setUiState} = useUiStore.getState();
        setUiState(UI_STATE.FAST_LOADING);
        mainWorker.postMessage({
            code: WORKER_REQ_CODE.LOAD_PAGE,
            args: {
                cursor: cursor,
            },
        });
    },
    setActiveTabName: (tabName: TAB_NAME) => {
        set({activeTabName: tabName});
    },
    setBeginLineNumToLogEventNum: (newMap: BeginLineNumToLogEventNumMap) => {
        set({beginLineNumToLogEventNum: newMap});
    },
    setFileName: (newFileName) => {
        set({fileName: newFileName});
    },
    setLogData: (newLogData) => {
        set({logData: newLogData});
    },
    setLogEventNum: (newLogEventNum) => {
        set({logEventNum: newLogEventNum});
    },
    setNumEvents: (newNumEvents) => {
        set({numEvents: newNumEvents});
    },
    setNumPages: (newNumPages) => {
        set({numPages: newNumPages});
    },
    setOnDiskFileSizeInBytes: (newOnDiskFileSizeInBytes) => {
        set({onDiskFileSizeInBytes: newOnDiskFileSizeInBytes});
    },
    setPageNum: (newPageNum) => {
        set({pageNum: newPageNum});
    },
    setPostPopUp: (postPopUp) => {
        set({postPopUp});
    },
}));

export default useLogFileStore;
