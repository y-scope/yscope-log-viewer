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
    loadFile: (fileSrc: FileSrcType, cursor: CursorType) => void,
    logData: string,
    numEvents: number,
    numPages: number,
    pageNum: Nullable<number>
}
const StateContext = createContext<StateContextType>({} as StateContextType);

/**
 * Default values of the state object.
 */
const STATE_DEFAULT: Readonly<StateContextType> = Object.freeze({
    beginLineNumToLogEventNum: new Map<number, number>(),
    fileName: "",
    loadFile: () => null,
    logData: "Loading...",
    numEvents: 0,
    numPages: 0,
    pageNum: 0,
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
    const beginLineNumToLogEventNumRef =
        useRef<BeginLineNumToLogEventNumMap>(STATE_DEFAULT.beginLineNumToLogEventNum);
    const logEventNumRef = useRef(logEventNum);
    const numPagesRef = useRef<number>(STATE_DEFAULT.numPages);
    const pageNumRef = useRef<Nullable<number>>(STATE_DEFAULT.pageNum);

    const mainWorkerRef = useRef<null|Worker>(null);

    const mainWorkerPostReq = useCallback(<T extends WORKER_REQ_CODE>(
        code: T,
        args: WorkerReq<T>
    ) => {
        mainWorkerRef.current?.postMessage({code, args});
    }, []);

    const handleMainWorkerResp = useCallback((ev: MessageEvent<MainWorkerRespMessage>) => {
        const {code, args} = ev.data;
        console.log(`[MainWorker -> Renderer] code=${code}`);
        switch (code) {
            case WORKER_RESP_CODE.LOG_FILE_INFO:
                setFileName(args.fileName);
                setNumEvents(args.numEvents);
                break;
            case WORKER_RESP_CODE.PAGE_DATA: {
                setLogData(args.logs);
                beginLineNumToLogEventNumRef.current = args.beginLineNumToLogEventNum;
                const lastLogEventNum = getLastLogEventNum(args.beginLineNumToLogEventNum);
                updateLogEventNumInUrl(lastLogEventNum, logEventNumRef.current);
                break;
            }
            case WORKER_RESP_CODE.NOTIFICATION:
                // TODO: notifications should be shown in the UI when the NotificationProvider
                //  is added
                console.error(args.logLevel, args.message);
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
        mainWorkerPostReq(WORKER_REQ_CODE.LOAD_FILE, {
            fileSrc: fileSrc,
            pageSize: getConfig(CONFIG_KEY.PAGE_SIZE),
            cursor: cursor,
            decoderOptions: getConfig(CONFIG_KEY.DECODER_OPTIONS),
        });
    }, [
        handleMainWorkerResp,
        mainWorkerPostReq,
    ]);

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
                mainWorkerPostReq(WORKER_REQ_CODE.LOAD_PAGE, {
                    cursor: {code: CURSOR_CODE.PAGE_NUM, args: {pageNum: newPageNum}},
                    decoderOptions: getConfig(CONFIG_KEY.DECODER_OPTIONS),
                });
            }
        }

        pageNumRef.current = newPageNum;
    }, [
        numEvents,
        logEventNum,
        mainWorkerPostReq,
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
                loadFile: loadFile,
                logData: logData,
                numEvents: numEvents,
                numPages: numPagesRef.current,
                pageNum: pageNumRef.current,
            }}
        >
            {children}
        </StateContext.Provider>
    );
};


export default StateContextProvider;
export {StateContext};
