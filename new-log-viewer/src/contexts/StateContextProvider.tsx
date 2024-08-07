import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

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
    updateWindowHashParams,
    UrlContext,
} from "./UrlContextProvider";


interface StateContextType {
    beginLineNumToLogEventNum: BeginLineNumToLogEventNumMap,
    loadFile: (fileSrc: FileSrcType, cursor: CursorType) => void,
    logData: string,
    numEvents: number,
    numPages: number,
    pageNum: number
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

const INVALID_PAGE_NUM = 0;
const PAGE_SIZE = 10_000;

interface StateContextProviderProps {
    children: React.ReactNode
}

/**
 * Provides state management for the application.
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
    const initialLogEventRef = useRef(logEventNum);
    const pageNumRef = useRef(INVALID_PAGE_NUM);

    const mainWorkerRef = useRef<null|Worker>(null);

    const numPages = useMemo(() => {
        return Math.ceil(numEvents / PAGE_SIZE);
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

                // Correct logEventNum if it is out of valid range
                const allLogEventNums = Array.from(args.beginLineNumToLogEventNum.values());
                let lastLogEventNum = allLogEventNums.at(-1);
                if ("undefined" === typeof lastLogEventNum) {
                    lastLogEventNum = 1;
                }
                const newLogEventNum = (null === initialLogEventRef.current) ?
                    lastLogEventNum :
                    Math.min(initialLogEventRef.current, lastLogEventNum);

                updateWindowHashParams({
                    logEventNum: newLogEventNum,
                });
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

    useEffect(() => {
        pageNumRef.current = (null === logEventNum) ?
            INVALID_PAGE_NUM :
            Math.ceil(logEventNum / PAGE_SIZE);
    }, [logEventNum]);

    useEffect(() => {
        if (null !== filePath) {
            const cursor: CursorType = (INVALID_PAGE_NUM === pageNumRef.current) ?
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
