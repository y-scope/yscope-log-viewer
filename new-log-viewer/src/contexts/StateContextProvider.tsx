/* eslint max-lines: ["error", 400] */
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
    BeginLineNumToLogEventNumMap,
    CURSOR_CODE,
    CursorType,
    FileSrcType,
    MainWorkerRespMessage,
    WORKER_REQ_CODE,
    WORKER_RESP_CODE,
    WorkerReq,
} from "../typings/worker";
import {
    EXPORT_LOGS_CHUNK_SIZE,
    getConfig,
} from "../utils/config";
import {
    clamp,
    getChunkNum,
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
    originalFileSizeInBytes: number,
    pageNum: Nullable<number>,

    exportLogs: () => void,
    loadFile: (fileSrc: FileSrcType, cursor: CursorType) => void,
    loadPage: (newPageNum: number) => void,
}
const StateContext = createContext<StateContextType>({} as StateContextType);

/**
 * Default values of the state object.
 */
const STATE_DEFAULT: Readonly<StateContextType> = Object.freeze({
    beginLineNumToLogEventNum: new Map<number, number>(),
    exportProgress: null,
    fileName: "",
    logData: "No file is open.",
    numEvents: 0,
    numPages: 0,
    originalFileSizeInBytes: 0,
    pageNum: 0,

    exportLogs: () => null,
    loadFile: () => null,
    loadPage: () => null,
});

interface StateContextProviderProps {
    children: React.ReactNode
}

/**
 * Updates the log event number in the current window's URL hash parameters.
 *
 * @param lastLogEventNum The last log event number value.
 * @param inputLogEventNum The log event number to set.  If `null`, the hash parameter log event
 * number will be set to `lastLogEventNum`. If it's outside the range `[1, lastLogEventNum]`, the
 * hash parameter log event number will be clamped to that range.
 */
const updateLogEventNumInUrl = (
    lastLogEventNum: number,
    inputLogEventNum: Nullable<number>
) => {
    const newLogEventNum = (null === inputLogEventNum) ?
        lastLogEventNum :
        clamp(inputLogEventNum, 1, lastLogEventNum);

    updateWindowUrlHashParams({
        logEventNum: newLogEventNum,
    });
};

/**
 * Gets the last log event number from a map of begin line numbers to log event numbers.
 *
 * @param beginLineNumToLogEventNum
 * @return The last log event number.
 */
const getLastLogEventNum = (beginLineNumToLogEventNum: BeginLineNumToLogEventNumMap) => {
    const allLogEventNums = Array.from(beginLineNumToLogEventNum.values());
    let lastLogEventNum = allLogEventNums.at(-1);
    if ("undefined" === typeof lastLogEventNum) {
        lastLogEventNum = 1;
    }

    return lastLogEventNum;
};

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
 * Provides state management for the application. This provider must be wrapped by
 * UrlContextProvider to function correctly.
 *
 * @param props
 * @param props.children
 * @return
 */
// eslint-disable-next-line max-lines-per-function
const StateContextProvider = ({children}: StateContextProviderProps) => {
    const {filePath, logEventNum} = useContext(UrlContext);

    // States
    const [fileName, setFileName] = useState<string>(STATE_DEFAULT.fileName);
    const [logData, setLogData] = useState<string>(STATE_DEFAULT.logData);
    const [numEvents, setNumEvents] = useState<number>(STATE_DEFAULT.numEvents);
    const [originalFileSizeInBytes, setOriginalFileSizeInBytes] =
        useState(STATE_DEFAULT.originalFileSizeInBytes);
    const beginLineNumToLogEventNumRef =
        useRef<BeginLineNumToLogEventNumMap>(STATE_DEFAULT.beginLineNumToLogEventNum);
    const [exportProgress, setExportProgress] =
        useState<Nullable<number>>(STATE_DEFAULT.exportProgress);

    // Refs
    const logEventNumRef = useRef(logEventNum);
    const numPagesRef = useRef<number>(STATE_DEFAULT.numPages);
    const pageNumRef = useRef<Nullable<number>>(STATE_DEFAULT.pageNum);
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
                setOriginalFileSizeInBytes(args.originalFileSizeInBytes);
                break;
            case WORKER_RESP_CODE.NOTIFICATION:
                // eslint-disable-next-line no-warning-comments
                // TODO: notifications should be shown in the UI when the NotificationProvider
                //  is added
                console.error(args.logLevel, args.message);
                break;
            case WORKER_RESP_CODE.PAGE_DATA: {
                setLogData(args.logs);
                beginLineNumToLogEventNumRef.current = args.beginLineNumToLogEventNum;
                const lastLogEventNum = getLastLogEventNum(args.beginLineNumToLogEventNum);
                updateLogEventNumInUrl(lastLogEventNum, logEventNumRef.current);
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

        setFileName("Loading...");
        setLogData("Loading...");
        setOriginalFileSizeInBytes(STATE_DEFAULT.originalFileSizeInBytes);
        setExportProgress(STATE_DEFAULT.exportProgress);
    }, [
        handleMainWorkerResp,
    ]);

    const loadPage = (newPageNum: number) => {
        if (null === mainWorkerRef.current) {
            console.error("Unexpected null mainWorkerRef.current");

            return;
        }
        workerPostReq(mainWorkerRef.current, WORKER_REQ_CODE.LOAD_PAGE, {
            cursor: {code: CURSOR_CODE.PAGE_NUM, args: {pageNum: newPageNum}},
            decoderOptions: getConfig(CONFIG_KEY.DECODER_OPTIONS),
        });
    };

    // Synchronize `logEventNumRef` with `logEventNum`.
    useEffect(() => {
        logEventNumRef.current = logEventNum;
    }, [logEventNum]);

    // On `numEvents` update, recalculate `numPagesRef`.
    useEffect(() => {
        if (STATE_DEFAULT.numEvents === numEvents) {
            return;
        }

        numPagesRef.current = getChunkNum(numEvents, getConfig(CONFIG_KEY.PAGE_SIZE));
    }, [numEvents]);

    // On `logEventNum` update, clamp it then switch page if necessary or simply update the URL.
    useEffect(() => {
        if (URL_HASH_PARAMS_DEFAULT.logEventNum === logEventNum) {
            return;
        }

        const newPageNum = clamp(
            getChunkNum(logEventNum, getConfig(CONFIG_KEY.PAGE_SIZE)),
            1,
            numPagesRef.current
        );

        // Request a page switch only if it's not the initial page load.
        if (STATE_DEFAULT.pageNum !== pageNumRef.current) {
            if (newPageNum === pageNumRef.current) {
                // Don't need to switch pages so just update `logEventNum` in the URL.
                updateLogEventNumInUrl(numEvents, logEventNumRef.current);
            } else {
                // NOTE: We don't need to call `updateLogEventNumInUrl()` since it's called when
                // handling the `WORKER_RESP_CODE.PAGE_DATA` response (the response to
                // `WORKER_REQ_CODE.LOAD_PAGE` requests) .
                loadPage(newPageNum);
            }
        }

        pageNumRef.current = newPageNum;
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
            // Set which page to load since the user specified a specific `logEventNum`.
            // NOTE: Since we don't know how many pages the log file contains, we only clamp the
            // minimum of the page number.
            const newPageNum = Math.max(
                getChunkNum(logEventNumRef.current, getConfig(CONFIG_KEY.PAGE_SIZE)),
                1
            );

            cursor = {code: CURSOR_CODE.PAGE_NUM, args: {pageNum: newPageNum}};
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
                numPages: numPagesRef.current,
                originalFileSizeInBytes: originalFileSizeInBytes,
                pageNum: pageNumRef.current,

                exportLogs: exportLogs,
                loadFile: loadFile,
                loadPage: loadPage,
            }}
        >
            {children}
        </StateContext.Provider>
    );
};

export default StateContextProvider;
export {StateContext};
