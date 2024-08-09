import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {Nullable} from "../typings/common";
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
    clamp,
    getChunkNum,
} from "../utils/math";
import {
    updateWindowUrlHashParams,
    UrlContext,
} from "./UrlContextProvider";


interface StateContextType {
    beginLineNumToLogEventNum: BeginLineNumToLogEventNumMap,
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
const STATE_DEFAULT = Object.freeze({
    beginLineNumToLogEventNum: new Map(),
    loadFile: () => null,
    logData: "Loading...",
    numEvents: 0,
    numPages: 0,
    pageNum: 0,
});

const PAGE_SIZE = 10_000;

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

    const [beginLineNumToLogEventNum, setBeginLineNumToLogEventNum] =
        useState<BeginLineNumToLogEventNumMap>(STATE_DEFAULT.beginLineNumToLogEventNum);
    const [logData, setLogData] = useState<string>(STATE_DEFAULT.logData);
    const [numEvents, setNumEvents] = useState<number>(STATE_DEFAULT.numEvents);
    const logEventNumRef = useRef(logEventNum);
    const pageNumRef = useRef<Nullable<number>>(null);

    const mainWorkerRef = useRef<null|Worker>(null);

    const numPages = useMemo(() => {
        return getChunkNum(numEvents, PAGE_SIZE);
    }, [numEvents]);

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
            case WORKER_RESP_CODE.PAGE_DATA: {
                setLogData(args.logs);
                setBeginLineNumToLogEventNum(args.beginLineNumToLogEventNum);
                const lastLogEventNum = getLastLogEventNum(args.beginLineNumToLogEventNum);
                updateLogEventNumInUrl(lastLogEventNum, logEventNumRef.current);
                break;
            }
            case WORKER_RESP_CODE.NUM_EVENTS:
                setNumEvents(args.numEvents);
                break;
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
        if (null !== mainWorkerRef.current) {
            mainWorkerRef.current.terminate();
        }
        mainWorkerRef.current = new Worker(
            new URL("../services/MainWorker.ts", import.meta.url)
        );
        mainWorkerRef.current.onmessage = handleMainWorkerResp;
        mainWorkerPostReq(WORKER_REQ_CODE.LOAD_FILE, {
            fileSrc: fileSrc,
            pageSize: PAGE_SIZE,
            cursor: cursor,
            decoderOptions: {
                // TODO: these shall come from config provider
                formatString: "%d{yyyy-MM-dd HH:mm:ss.SSS} [%process.thread.name] %log.level" +
                    " %message%n",
                logLevelKey: "log.level",
                timestampKey: "@timestamp",
            },
        });
    }, [
        handleMainWorkerResp,
        mainWorkerPostReq,
    ]);

    // Synchronize `logEventNumRef` with `logEventNum`.
    useEffect(() => {
        logEventNumRef.current = logEventNum;
    }, [logEventNum]);

    // On `logEventNum` update, clamp it then switch page if necessary or simply update the URL.
    useEffect(() => {
        const newPage = (null === logEventNum) ?
            1 :
            clamp(getChunkNum(logEventNum, PAGE_SIZE), 1, numPages);

        if (newPage === pageNumRef.current) {
            const lastLogEventNum = getLastLogEventNum(beginLineNumToLogEventNum);
            updateLogEventNumInUrl(lastLogEventNum, logEventNumRef.current);
        } else {
            pageNumRef.current = newPage;
            mainWorkerPostReq(WORKER_REQ_CODE.LOAD_PAGE, {
                cursor: {code: CURSOR_CODE.PAGE_NUM, args: {pageNum: pageNumRef.current}},
                decoderOptions: {
                    // TODO: these shall come from config provider
                    formatString: "%d{yyyy-MM-dd HH:mm:ss.SSS} [%process.thread.name] %log.level" +
                        " %message%n",
                    logLevelKey: "log.level",
                    timestampKey: "@timestamp",
                },
            });
        }
    }, [
        beginLineNumToLogEventNum,
        logEventNum,
        numPages,
        mainWorkerPostReq,
    ]);

    // On `filePath` update, load file.
    useEffect(() => {
        if (null !== filePath) {
            const cursor: CursorType = (null === pageNumRef.current) ?
                {code: CURSOR_CODE.LAST_EVENT, args: null} :
                {code: CURSOR_CODE.PAGE_NUM, args: {pageNum: pageNumRef.current}};

            loadFile(filePath, cursor);
        }
    }, [
        filePath,
        loadFile,
    ]);

    return (
        <StateContext.Provider
            value={{
                beginLineNumToLogEventNum: beginLineNumToLogEventNum,
                loadFile: loadFile,
                logData: logData,
                numEvents: numEvents,
                numPages: numPages,
                pageNum: pageNumRef.current,
            }}
        >
            {children}
        </StateContext.Provider>
    );
};


export default StateContextProvider;
export {
    PAGE_SIZE,
    StateContext,
};
