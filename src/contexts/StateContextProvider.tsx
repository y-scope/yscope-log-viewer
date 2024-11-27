/* eslint max-lines: ["error", 600] */
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

import LogExportManager, {
    EXPORT_LOG_PROGRESS_VALUE_MAX,
    EXPORT_LOG_PROGRESS_VALUE_MIN,
} from "../services/LogExportManager";
import {Nullable} from "../typings/common";
import {CONFIG_KEY} from "../typings/config";
import {
    LOG_LEVEL,
    LogLevelFilter,
} from "../typings/logs";
import {
    DEFAULT_AUTO_DISMISS_TIMEOUT_MILLIS,
    LONG_AUTO_DISMISS_TIMEOUT_MILLIS,
} from "../typings/notifications";
import {UI_STATE} from "../typings/states";
import {SEARCH_PARAM_NAMES} from "../typings/url";
import {
    BeginLineNumToLogEventNumMap,
    CURSOR_CODE,
    CursorType,
    EVENT_POSITION_ON_PAGE,
    FileSrcType,
    MainWorkerRespMessage,
    QUERY_PROGRESS_INIT,
    QueryResults,
    WORKER_REQ_CODE,
    WORKER_RESP_CODE,
    WorkerReq,
} from "../typings/worker";
import {
    ACTION_NAME,
    NavigationAction,
} from "../utils/actions";
import {
    EXPORT_LOGS_CHUNK_SIZE,
    getConfig,
} from "../utils/config";
import {
    findNearestLessThanOrEqualElement,
    isWithinBounds,
} from "../utils/data";
import {clamp} from "../utils/math";
import {NotificationContext} from "./NotificationContextProvider";
import {
    updateWindowUrlHashParams,
    updateWindowUrlSearchParams,
    URL_HASH_PARAMS_DEFAULT,
    URL_SEARCH_PARAMS_DEFAULT,
    UrlContext,
} from "./UrlContextProvider";


interface StateContextType {
    beginLineNumToLogEventNum: BeginLineNumToLogEventNumMap,
    exportProgress: Nullable<number>,
    fileName: string,
    isSettingsModalOpen: boolean,
    uiState: UI_STATE,
    logData: string,
    numEvents: number,
    numPages: number,
    onDiskFileSizeInBytes: number,
    pageNum: number,
    queryProgress: number,
    queryResults: QueryResults,

    exportLogs: () => void,
    loadFile: (fileSrc: FileSrcType, cursor: CursorType) => void,
    loadPageByAction: (navAction: NavigationAction) => void,
    setIsSettingsModalOpen: (isOpen: boolean) => void,
    setLogLevelFilter: (filter: LogLevelFilter) => void,
    startQuery: (queryString: string, isRegex: boolean, isCaseSensitive: boolean) => void,
}
const StateContext = createContext<StateContextType>({} as StateContextType);

/**
 * Default values of the state object.
 */
const STATE_DEFAULT: Readonly<StateContextType> = Object.freeze({
    beginLineNumToLogEventNum: new Map<number, number>(),
    exportProgress: null,
    fileName: "",
    isSettingsModalOpen: false,
    logData: "No file is open.",
    numEvents: 0,
    numPages: 0,
    onDiskFileSizeInBytes: 0,
    pageNum: 0,
    queryProgress: QUERY_PROGRESS_INIT,
    queryResults: new Map(),
    uiState: UI_STATE.UNOPENED,

    exportLogs: () => null,
    loadFile: () => null,
    loadPageByAction: () => null,
    setIsSettingsModalOpen: () => null,
    setLogLevelFilter: () => null,
    startQuery: () => null,
});

interface StateContextProviderProps {
    children: React.ReactNode
}

/**
 * Sends a post message to a worker with the given code and arguments. This wrapper around
 * `worker.postMessage()` ensures type safety for both the request code and its corresponding
 * arguments.
 *
 * @param worker
 * @param code
 * @param args
 */
const workerPostReq = <T extends WORKER_REQ_CODE>(
    worker: Worker,
    code: T,
    args: WorkerReq<T>
) => {
    worker.postMessage({code, args});
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
 * Submits a `LOAD_PAGE` request to a worker.
 *
 * @param worker
 * @param cursor
 */
const loadPageByCursor = (
    worker: Worker,
    cursor: CursorType,
) => {
    workerPostReq(worker, WORKER_REQ_CODE.LOAD_PAGE, {
        cursor: cursor,
    });
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

/**
 * Provides state management for the application. This provider must be wrapped by
 * UrlContextProvider to function correctly.
 *
 * @param props
 * @param props.children
 * @return
 */
// eslint-disable-next-line max-lines-per-function, max-statements
const StateContextProvider = ({children}: StateContextProviderProps) => {
    const {postPopUp} = useContext(NotificationContext);
    const {filePath, logEventNum} = useContext(UrlContext);

    // States
    const [exportProgress, setExportProgress] =
        useState<Nullable<number>>(STATE_DEFAULT.exportProgress);
    const [isSettingsModalOpen, setIsSettingsModalOpen] =
        useState<boolean>(STATE_DEFAULT.isSettingsModalOpen);
    const [fileName, setFileName] = useState<string>(STATE_DEFAULT.fileName);
    const [logData, setLogData] = useState<string>(STATE_DEFAULT.logData);
    const [numEvents, setNumEvents] = useState<number>(STATE_DEFAULT.numEvents);
    const [numPages, setNumPages] = useState<number>(STATE_DEFAULT.numPages);
    const [onDiskFileSizeInBytes, setOnDiskFileSizeInBytes] =
        useState(STATE_DEFAULT.onDiskFileSizeInBytes);
    const [pageNum, setPageNum] = useState<number>(STATE_DEFAULT.pageNum);
    const [queryProgress, setQueryProgress] = useState<number>(STATE_DEFAULT.queryProgress);
    const [queryResults, setQueryResults] = useState<QueryResults>(STATE_DEFAULT.queryResults);
    const [uiState, setUiState] = useState<UI_STATE>(STATE_DEFAULT.uiState);

    // Refs
    const beginLineNumToLogEventNumRef =
            useRef<BeginLineNumToLogEventNumMap>(STATE_DEFAULT.beginLineNumToLogEventNum);
    const logEventNumRef = useRef(logEventNum);
    const logExportManagerRef = useRef<null|LogExportManager>(null);
    const mainWorkerRef = useRef<null|Worker>(null);
    const numPagesRef = useRef<number>(numPages);
    const pageNumRef = useRef<number>(pageNum);
    const uiStateRef = useRef<UI_STATE>(uiState);

    const handleMainWorkerResp = useCallback((ev: MessageEvent<MainWorkerRespMessage>) => {
        const {code, args} = ev.data;
        console.log(`[MainWorker -> Renderer] code=${code}`);
        switch (code) {
            case WORKER_RESP_CODE.CHUNK_DATA:
                if (null !== logExportManagerRef.current) {
                    const progress = logExportManagerRef.current.appendChunk(args.logs);
                    setExportProgress(progress);
                    if (EXPORT_LOG_PROGRESS_VALUE_MAX === progress) {
                        setUiState(UI_STATE.READY);
                    }
                }
                break;
            case WORKER_RESP_CODE.FORMAT_POPUP:
                postPopUp({
                    level: LOG_LEVEL.INFO,
                    message: "Adding a format string can enhance the readability of your" +
                    " structured logs by customizing how fields are displayed.",
                    primaryAction: {
                        children: "Settings",
                        startDecorator: <SettingsOutlinedIcon/>,
                        onClick: () => { setIsSettingsModalOpen(true); },
                    },
                    timeoutMillis: LONG_AUTO_DISMISS_TIMEOUT_MILLIS,
                    title: "A format string has not been configured",
                });
                break;
            case WORKER_RESP_CODE.LOG_FILE_INFO:
                setFileName(args.fileName);
                setNumEvents(args.numEvents);
                setOnDiskFileSizeInBytes(args.onDiskFileSizeInBytes);
                break;
            case WORKER_RESP_CODE.NOTIFICATION:
                postPopUp({
                    level: args.logLevel,
                    message: args.message,
                    timeoutMillis: DEFAULT_AUTO_DISMISS_TIMEOUT_MILLIS,
                    title: "Action failed",
                });

                switch (uiStateRef.current) {
                    case UI_STATE.FAST_LOADING:
                        setUiState(UI_STATE.READY);
                        break;
                    case UI_STATE.SLOW_LOADING:
                        setUiState(UI_STATE.READY);
                        break;
                    case UI_STATE.FILE_LOADING:
                        setUiState(UI_STATE.UNOPENED);
                        break;
                    default:
                        break;
                }

                break;
            case WORKER_RESP_CODE.PAGE_DATA: {
                setLogData(args.logs);
                setNumPages(args.numPages);
                setPageNum(args.pageNum);
                beginLineNumToLogEventNumRef.current = args.beginLineNumToLogEventNum;
                updateWindowUrlHashParams({
                    logEventNum: args.logEventNum,
                });
                setUiState(UI_STATE.READY);
                break;
            }
            case WORKER_RESP_CODE.QUERY_RESULT:
                setQueryProgress(args.progress);
                if (QUERY_PROGRESS_INIT === args.progress) {
                    setQueryResults(STATE_DEFAULT.queryResults);
                } else {
                    setQueryResults((v) => {
                        v = structuredClone(v);
                        args.results.forEach((resultsPerPage, queryPageNum) => {
                            if (false === v.has(queryPageNum)) {
                                v.set(queryPageNum, []);
                            }
                            v.get(queryPageNum)?.push(...resultsPerPage);
                        });

                        return v;
                    });
                }
                break;
            default:
                console.error(`Unexpected ev.data: ${JSON.stringify(ev.data)}`);
                break;
        }
    }, [postPopUp]);

    const startQuery = useCallback((
        queryString: string,
        isRegex: boolean,
        isCaseSensitive: boolean
    ) => {
        setQueryResults(STATE_DEFAULT.queryResults);
        if (null === mainWorkerRef.current) {
            console.error("Unexpected null mainWorkerRef.current");

            return;
        }
        workerPostReq(mainWorkerRef.current, WORKER_REQ_CODE.START_QUERY, {
            queryString: queryString,
            isRegex: isRegex,
            isCaseSensitive: isCaseSensitive,
        });
    }, []);

    const exportLogs = useCallback(() => {
        if (null === mainWorkerRef.current) {
            console.error("Unexpected null mainWorkerRef.current");

            return;
        }
        setUiState(UI_STATE.SLOW_LOADING);
        setExportProgress(EXPORT_LOG_PROGRESS_VALUE_MIN);
        logExportManagerRef.current = new LogExportManager(
            Math.ceil(numEvents / EXPORT_LOGS_CHUNK_SIZE),
            fileName
        );
        workerPostReq(
            mainWorkerRef.current,
            WORKER_REQ_CODE.EXPORT_LOG,
            null
        );
    }, [
        numEvents,
        fileName,
    ]);

    const loadFile = useCallback((fileSrc: FileSrcType, cursor: CursorType) => {
        setUiState(UI_STATE.FILE_LOADING);
        setFileName("Loading...");
        setLogData("Loading...");
        setOnDiskFileSizeInBytes(STATE_DEFAULT.onDiskFileSizeInBytes);
        setExportProgress(STATE_DEFAULT.exportProgress);

        if ("string" !== typeof fileSrc) {
            updateWindowUrlSearchParams({[SEARCH_PARAM_NAMES.FILE_PATH]: null});
        }
        if (null !== mainWorkerRef.current) {
            mainWorkerRef.current.terminate();
        }
        mainWorkerRef.current = new Worker(
            new URL("../services/MainWorker.ts", import.meta.url)
        );
        mainWorkerRef.current.onmessage = handleMainWorkerResp;
        workerPostReq(mainWorkerRef.current, WORKER_REQ_CODE.LOAD_FILE, {
            fileSrc: fileSrc,
            pageSize: getConfig(CONFIG_KEY.PAGE_SIZE),
            cursor: cursor,
            decoderOptions: getConfig(CONFIG_KEY.DECODER_OPTIONS),
        });
    }, [
        handleMainWorkerResp,
    ]);

    const loadPageByAction = useCallback((navAction: NavigationAction) => {
        if (null === mainWorkerRef.current) {
            console.error("Unexpected null mainWorkerRef.current");

            return;
        }

        const cursor = getPageNumCursor(navAction, pageNumRef.current, numPagesRef.current);
        if (null === cursor) {
            console.error(`Error with nav action ${navAction.code}.`);

            return;
        }

        setUiState(UI_STATE.FAST_LOADING);
        loadPageByCursor(mainWorkerRef.current, cursor);
    }, []);

    const setLogLevelFilter = useCallback((filter: LogLevelFilter) => {
        if (null === mainWorkerRef.current) {
            return;
        }
        setUiState(UI_STATE.FAST_LOADING);
        workerPostReq(mainWorkerRef.current, WORKER_REQ_CODE.SET_FILTER, {
            cursor: {code: CURSOR_CODE.EVENT_NUM, args: {eventNum: logEventNumRef.current ?? 1}},
            logLevelFilter: filter,
        });
    }, []);

    // Synchronize `logEventNumRef` with `logEventNum`.
    useEffect(() => {
        logEventNumRef.current = logEventNum;
    }, [logEventNum]);

    // Synchronize `pageNumRef` with `pageNum`.
    useEffect(() => {
        pageNumRef.current = pageNum;
    }, [pageNum]);

    // Synchronize `numPagesRef` with `numPages`.
    useEffect(() => {
        numPagesRef.current = numPages;
    }, [numPages]);

    // Synchronize `uiStateRef` with `uiState`.
    useEffect(() => {
        uiStateRef.current = uiState;
        if (uiState === UI_STATE.UNOPENED) {
            setFileName(STATE_DEFAULT.fileName);
            setLogData(STATE_DEFAULT.logData);
        }
    }, [uiState]);

    // On `logEventNum` update, clamp it then switch page if necessary or simply update the URL.
    useEffect(() => {
        if (null === mainWorkerRef.current) {
            return;
        }

        if (URL_HASH_PARAMS_DEFAULT.logEventNum === logEventNum) {
            return;
        }

        const logEventNumsOnPage: number [] =
            Array.from(beginLineNumToLogEventNumRef.current.values());

        const clampedLogEventNum = clamp(logEventNum, 1, numEvents);

        if (updateUrlIfEventOnPage(clampedLogEventNum, logEventNumsOnPage)) {
            // No need to request a new page since the log event is on the current page.
            return;
        }

        const cursor: CursorType = {
            code: CURSOR_CODE.EVENT_NUM,
            args: {eventNum: logEventNum},
        };

        setUiState(UI_STATE.FAST_LOADING);
        loadPageByCursor(mainWorkerRef.current, cursor);
    }, [
        numEvents,
        logEventNum,
    ]);

    // On `filePath` update, load file.
    useEffect(() => {
        if (URL_SEARCH_PARAMS_DEFAULT.filePath === filePath) {
            return;
        }

        let cursor: CursorType = {code: CURSOR_CODE.LAST_EVENT, args: null};
        if (URL_HASH_PARAMS_DEFAULT.logEventNum !== logEventNumRef.current) {
            cursor = {
                code: CURSOR_CODE.EVENT_NUM,
                args: {eventNum: logEventNumRef.current},
            };
        }
        loadFile(filePath, cursor);
    }, [
        filePath,
        loadFile,
    ]);

    return (
        <StateContext.Provider
            value={{
                beginLineNumToLogEventNum: beginLineNumToLogEventNumRef.current,
                exportProgress: exportProgress,
                fileName: fileName,
                isSettingsModalOpen: isSettingsModalOpen,
                logData: logData,
                numEvents: numEvents,
                numPages: numPages,
                onDiskFileSizeInBytes: onDiskFileSizeInBytes,
                pageNum: pageNum,
                queryProgress: queryProgress,
                queryResults: queryResults,
                uiState: uiState,

                exportLogs: exportLogs,
                loadFile: loadFile,
                loadPageByAction: loadPageByAction,
                setIsSettingsModalOpen: setIsSettingsModalOpen,
                setLogLevelFilter: setLogLevelFilter,
                startQuery: startQuery,
            }}
        >
            {children}
        </StateContext.Provider>
    );
};


export default StateContextProvider;
export {StateContext};
