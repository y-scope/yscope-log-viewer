/* eslint max-lines: ["error", 450] */
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

import LogExportManager, {EXPORT_LOG_PROGRESS_VALUE_MIN} from "../services/LogExportManager";
import {Nullable} from "../typings/common";
import {CONFIG_KEY} from "../typings/config";
import {SEARCH_PARAM_NAMES} from "../typings/url";
import {
    LogLevelFilter,
} from "../typings/logs";
import {
    BeginLineNumToLogEventNumMap,
    CURSOR_CODE,
    CursorType,
    EVENT_POSITION_ON_PAGE,
    FileSrcType,
    MainWorkerRespMessage,
    WORKER_REQ_CODE,
    WORKER_RESP_CODE,
    WorkerReq,
} from "../typings/worker";
import {
    ACTION_NAME,
    NavigationAction,
} from "../utils/actions";
import {
    isWithinBounds,
    findNearestLessThanOrEqualElement,
} from "../utils/data";
import {
    EXPORT_LOGS_CHUNK_SIZE,
    getConfig,
} from "../utils/config";
import {
    clamp,
} from "../utils/math";
import {
    updateWindowUrlHashParams,
    updateWindowUrlSearchParams,
    URL_HASH_PARAMS_DEFAULT,
    URL_SEARCH_PARAMS_DEFAULT,
    UrlContext,
} from "./UrlContextProvider";


interface StateContextType {
    beginLineNumToLogEventNum: BeginLineNumToLogEventNumMap,
    fileName: string,
    exportProgress: Nullable<number>,
    logData: string,
    numEvents: number,
    numPages: number,
    pageNum: number,

    exportLogs: () => void,
    loadFile: (fileSrc: FileSrcType, cursor: CursorType) => void,
    loadPageByAction: (navAction: NavigationAction) => void,
    setLogLevelFilter: (newLogLevelFilter: LogLevelFilter) => void,
}
const StateContext = createContext<StateContextType>({} as StateContextType);

/**
 * Default values of the state object.
 */
const STATE_DEFAULT: Readonly<StateContextType> = Object.freeze({
    beginLineNumToLogEventNum: new Map<number, number>(),
    exportProgress: null,
    fileName: "",
    logData: "Loading...",
    numEvents: 0,
    numPages: 0,
    pageNum: 0,

    exportLogs: () => null,
    loadFile: () => null,
    loadPageByAction: () => null,
    setLogLevelFilter: () => null,
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
    if (STATE_DEFAULT.pageNum === currentPageNum) {
        // eslint-disable-next-line no-warning-comments
        // TODO: This shouldn't be possible, but currently, the page nav buttons remain enabled
        // even when a file hasn't been loaded.
        console.error("Page actions cannot be executed if the current page is not set.");

        return null;
    }

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
        decoderOptions: getConfig(CONFIG_KEY.DECODER_OPTIONS),
    });
};

/**
 * If the log event number changed, update the URL.
 *
 * @param logEventNum
 * @param newLogEventNum
 * @return Whether the log event number changed.
 */
function updateUrlIfModified(logEventNum: number, newLogEventNum: Nullable<number>): boolean {
    if (newLogEventNum !== logEventNum) {
        updateWindowUrlHashParams({
            logEventNum: newLogEventNum,
        });
        return true;
    }
    return false;
}

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
    const {filePath, logEventNum} = useContext(UrlContext);

    // States
    const [fileName, setFileName] = useState<string>(STATE_DEFAULT.fileName);
    const [logData, setLogData] = useState<string>(STATE_DEFAULT.logData);
    const [numEvents, setNumEvents] = useState<number>(STATE_DEFAULT.numEvents);
    const [pageNum, setPageNum] = useState<number>(STATE_DEFAULT.pageNum);
    const [numPages, setNumPages] = useState<number>(STATE_DEFAULT.numPages);
    const beginLineNumToLogEventNumRef =
        useRef<BeginLineNumToLogEventNumMap>(STATE_DEFAULT.beginLineNumToLogEventNum);
    const [exportProgress, setExportProgress] =
        useState<Nullable<number>>(STATE_DEFAULT.exportProgress);

    // Refs
    const logEventNumRef = useRef(logEventNum);
    const numPagesRef = useRef<number>(pageNum);
    const pageNumRef = useRef<number>(numPages);
    const logExportManagerRef = useRef<null|LogExportManager>(null);
    const mainWorkerRef = useRef<null|Worker>(null);

    const handleMainWorkerResp = useCallback((ev: MessageEvent<MainWorkerRespMessage>) => {
        const {code, args} = ev.data;
        console.log(`[MainWorker -> Renderer] code=${code}`);
        switch (code) {
            case WORKER_RESP_CODE.CHUNK_DATA:
                if (null !== logExportManagerRef.current) {
                    const progress = logExportManagerRef.current.appendChunk(args.logs);
                    setExportProgress(progress);
                }
                break;
            case WORKER_RESP_CODE.LOG_FILE_INFO:
                setFileName(args.fileName);
                setNumEvents(args.numEvents);
                break;
            case WORKER_RESP_CODE.NOTIFICATION:
                // eslint-disable-next-line no-warning-comments
                // TODO: notifications should be shown in the UI when the NotificationProvider
                //  is added
                console.error(args.logLevel, args.message);
                break;
            case WORKER_RESP_CODE.PAGE_DATA: {
                setLogData(args.logs);
                setPageNum(args.pageNum);
                setNumPages(args.numPages);
                beginLineNumToLogEventNumRef.current = args.beginLineNumToLogEventNum;
                updateWindowUrlHashParams({
                    logEventNum: args.logEventNum,
                });
                break;
            }
            default:
                console.error(`Unexpected ev.data: ${JSON.stringify(ev.data)}`);
                break;
        }
    }, []);

    const exportLogs = useCallback(() => {
        if (null === mainWorkerRef.current) {
            console.error("Unexpected null mainWorkerRef.current");

            return;
        }
        if (STATE_DEFAULT.numEvents === numEvents && STATE_DEFAULT.fileName === fileName) {
            console.error("numEvents and fileName not initialized yet");

            return;
        }

        setExportProgress(EXPORT_LOG_PROGRESS_VALUE_MIN);
        logExportManagerRef.current = new LogExportManager(
            Math.ceil(numEvents / EXPORT_LOGS_CHUNK_SIZE),
            fileName
        );
        workerPostReq(
            mainWorkerRef.current,
            WORKER_REQ_CODE.EXPORT_LOG,
            {decoderOptions: getConfig(CONFIG_KEY.DECODER_OPTIONS)}
        );
    }, [
        numEvents,
        fileName,
    ]);

    const loadFile = useCallback((fileSrc: FileSrcType, cursor: CursorType) => {
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

        setExportProgress(STATE_DEFAULT.exportProgress);
    }, [
        handleMainWorkerResp,
    ]);

    // Synchronize `pageNumRef` with `numPages`.
    useEffect(() => {
        pageNumRef.current = pageNum;
    }, [pageNum]);

    // Synchronize `numPagesRef` with `numPages`.
    useEffect(() => {
        numPagesRef.current = numPages;
    }, [numPages]);

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
        loadPageByCursor(mainWorkerRef.current, cursor);
    }, []);

    const setLogLevelFilter = (newLogLevelFilter: LogLevelFilter) => {
        if (null === mainWorkerRef.current) {
            return;
        }

        workerPostReq(mainWorkerRef.current, WORKER_REQ_CODE.SET_FILTER, {
            cursor: {code: CURSOR_CODE.EVENT_NUM, args: {eventNum: logEventNumRef.current}},
            logLevelFilter: newLogLevelFilter,
        });
    };

    // Synchronize `logEventNumRef` with `logEventNum`.
    useEffect(() => {
        logEventNumRef.current = logEventNum;
    }, [logEventNum]);

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

        if (isWithinBounds(logEventNumsOnPage, clampedLogEventNum)) {
            if (updateUrlIfModified(logEventNum, clampedLogEventNum)) {
                return;
            }

            let nearestIdx = findNearestLessThanOrEqualElement(logEventNumsOnPage, clampedLogEventNum);
            // First explicit cast since typescript thinks `nearestLogEventIdx` can be null, but
            // it can't as `clampedLogEventNum` must be inside `logEventNumsOnPage`. Second explicit
            // cast since typescript thinks `logEventNumsOnPage` can be empty, but it can't as
            // isWithinBounds would have returned false.
            let nearestLogEventNum = logEventNumsOnPage[nearestIdx as number] as number
            if (updateUrlIfModified(logEventNum, nearestLogEventNum)) {
                return;
            }
            return;
        }

        const cursor: CursorType = {
            code: CURSOR_CODE.EVENT_NUM,
            args: {eventNum: logEventNum},
        };

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
                logData: logData,
                numEvents: numEvents,
                numPages: numPages,
                pageNum: pageNum,

                exportLogs: exportLogs,
                loadFile: loadFile,
                loadPageByAction: loadPageByAction,
                setLogLevelFilter: setLogLevelFilter,
            }}
        >
            {children}
        </StateContext.Provider>
    );
};


export default StateContextProvider;
export {StateContext};
