// eslint-disable-next-line no-warning-comments
// TODO: move handlers out from StateContextProvider.
/* eslint-disable max-lines, max-lines-per-function */
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

import {Nullable} from "../typings/common";
import {CONFIG_KEY} from "../typings/config";
import {LogLevelFilter} from "../typings/logs";
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
import {getConfig} from "../utils/config";
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
    logData: string,
    logLevelFilter: LogLevelFilter,
    numEvents: number,
    numFilteredEvents: number,
    numPages: number,
    pageNum: Nullable<number>,

    changeLogLevelFilter: (newLogLevelFilter: LogLevelFilter) => void,
    loadFile: (fileSrc: FileSrcType, cursor: CursorType) => void,
}
const StateContext = createContext<StateContextType>({} as StateContextType);

/**
 * Default values of the state object.
 */
const STATE_DEFAULT: Readonly<StateContextType> = Object.freeze({
    beginLineNumToLogEventNum: new Map<number, number>(),
    fileName: "",
    logData: "Loading...",
    logLevelFilter: null,
    numEvents: 0,
    numFilteredEvents: 0,
    numPages: 0,
    pageNum: 0,

    changeLogLevelFilter: () => null,
    loadFile: () => null,
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
const StateContextProvider = ({children}: StateContextProviderProps) => {
    const {filePath, logEventNum} = useContext(UrlContext);

    const [fileName, setFileName] = useState<string>(STATE_DEFAULT.fileName);
    const [logData, setLogData] = useState<string>(STATE_DEFAULT.logData);
    const [numEvents, setNumEvents] = useState<number>(STATE_DEFAULT.numEvents);
    const [numFilteredEvents, setNumFilteredEvents] =
        useState<number>(STATE_DEFAULT.numFilteredEvents);
    const beginLineNumToLogEventNumRef =
        useRef<BeginLineNumToLogEventNumMap>(STATE_DEFAULT.beginLineNumToLogEventNum);
    const logEventNumRef = useRef(logEventNum);
    const logLevelFilterRef = useRef<LogLevelFilter>(STATE_DEFAULT.logLevelFilter);
    const numPagesRef = useRef<number>(STATE_DEFAULT.numPages);
    const pageNumRef = useRef<Nullable<number>>(STATE_DEFAULT.pageNum);

    const mainWorkerRef = useRef<null|Worker>(null);

    const handleMainWorkerResp = useCallback((ev: MessageEvent<MainWorkerRespMessage>) => {
        const {code, args} = ev.data;
        console.log(`[MainWorker -> Renderer] code=${code}`);
        switch (code) {
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
                beginLineNumToLogEventNumRef.current = args.beginLineNumToLogEventNum;
                const lastLogEventNum = getLastLogEventNum(args.beginLineNumToLogEventNum);
                updateLogEventNumInUrl(lastLogEventNum, logEventNumRef.current);
                break;
            }
            case WORKER_RESP_CODE.VIEW_INFO:
                setNumFilteredEvents(args.numFilteredEvents);
                break;
            default:
                console.error(`Unexpected ev.data: ${JSON.stringify(ev.data)}`);
                break;
        }
    }, []);

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
    }, [
        handleMainWorkerResp,
    ]);

    const changeLogLevelFilter = (newLogLevelFilter: LogLevelFilter) => {
        if (null === mainWorkerRef.current) {
            return;
        }
        logLevelFilterRef.current = newLogLevelFilter;
        workerPostReq(mainWorkerRef.current, WORKER_REQ_CODE.LOAD_PAGE, {
            cursor: {code: CURSOR_CODE.PAGE_NUM, args: {pageNum: 1}},
            decoderOptions: {
                ...getConfig(CONFIG_KEY.DECODER_OPTIONS),
                logLevelFilter: newLogLevelFilter,
            },
        });
    };

    // Synchronize `logEventNumRef` with `logEventNum`.
    useEffect(() => {
        logEventNumRef.current = logEventNum;
    }, [logEventNum]);

    // On `numEvents` update, recalculate `numPagesRef`.
    useEffect(() => {
        if (STATE_DEFAULT.numFilteredEvents === numFilteredEvents) {
            return;
        }

        numPagesRef.current = getChunkNum(numFilteredEvents, getConfig(CONFIG_KEY.PAGE_SIZE));
    }, [numFilteredEvents]);

    // On `logEventNum` update, clamp it then switch page if necessary or simply update the URL.
    useEffect(() => {
        if (null === mainWorkerRef.current || URL_HASH_PARAMS_DEFAULT.logEventNum === logEventNum) {
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
                updateLogEventNumInUrl(numFilteredEvents, logEventNumRef.current);
            } else {
                // NOTE: We don't need to call `updateLogEventNumInUrl()` since it's called when
                // handling the `WORKER_RESP_CODE.PAGE_DATA` response (the response to
                // `WORKER_REQ_CODE.LOAD_PAGE` requests) .
                workerPostReq(mainWorkerRef.current, WORKER_REQ_CODE.LOAD_PAGE, {
                    cursor: {code: CURSOR_CODE.PAGE_NUM, args: {pageNum: newPageNum}},
                    decoderOptions: {
                        ...getConfig(CONFIG_KEY.DECODER_OPTIONS),
                        logLevelFilter: logLevelFilterRef.current,
                    },
                });
            }
        }

        pageNumRef.current = newPageNum;
    }, [
        numFilteredEvents,
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
                fileName: fileName,
                logData: logData,
                logLevelFilter: logLevelFilterRef.current,
                numEvents: numEvents,
                numFilteredEvents: numFilteredEvents,
                numPages: numPagesRef.current,
                pageNum: pageNumRef.current,

                changeLogLevelFilter: changeLogLevelFilter,
                loadFile: loadFile,
            }}
        >
            {children}
        </StateContext.Provider>
    );
};


export default StateContextProvider;
export {StateContext};
