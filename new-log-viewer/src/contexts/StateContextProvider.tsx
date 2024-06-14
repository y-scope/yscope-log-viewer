import React, {
    createContext,
    useCallback,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    FileSrcType,
    LineNumLogEventNumMap,
    MainWorkerRespMessage,
    WORKER_REQ_CODE,
    WORKER_RESP_CODE,
    WorkerReq,
} from "../typings/worker";


interface StateContextType {
    loadFile: (fileSrc: FileSrcType) => void,
    logData: string,
    logEventNum: number,
    logLines: LineNumLogEventNumMap,
    numEvents: number,
    numPages: number,
    pageNum: number
}
const StateContext = createContext<StateContextType>({} as StateContextType);

/**
 * Default values of the state object.
 */
const StateDefaultValue = Object.freeze({
    loadFile: () => null,
    logData: "Loading...",
    logEventNum: 1,
    logLines: new Map(),
    numEvents: 0,
    numPages: 0,
    pageNum: 0,
});
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
    const [logLines, setLogLines] = useState<LineNumLogEventNumMap>(StateDefaultValue.logLines);
    const [logData, setLogData] = useState<string>(StateDefaultValue.logData);
    const [numEvents, setNumEvents] = useState<number>(StateDefaultValue.numEvents);
    const [logEventNum, setLogEventNum] = useState<number>(StateDefaultValue.logEventNum);

    const mainWorkerRef = useRef<null|Worker>(null);

    const pageNum = useMemo(() => {
        return Math.ceil(logEventNum / PAGE_SIZE);
    }, [logEventNum]);

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
            case WORKER_RESP_CODE.PAGE_DATA:
                setLogData(args.logs);
                setLogLines(args.lines);
                setLogEventNum(args.lines.get(1) as number);
                break;
            case WORKER_RESP_CODE.NUM_EVENTS:
                setNumEvents(args.numEvents);
                break;
            default:
                console.error(`Unexpected ev.data: ${JSON.stringify(ev.data)}`);
                break;
        }
    }, []);

    const loadFile = useCallback((fileSrc: FileSrcType) => {
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
            cursor: null,
            decodeOptions: {
                // TODO: these shall come from config provider
                textPattern: "%d{yyyy-MM-dd HH:mm:ss.SSS} [%process.thread.name] %log.level" +
                    " %message%n",
                verbosityPropName: "log.level",
                timestampPropName: "@timestamp",
            },
        });
    }, [
        handleMainWorkerResp,
        mainWorkerPostReq,
    ]);

    return (
        <StateContext.Provider
            value={{
                loadFile,
                logData,
                logEventNum,
                logLines,
                numEvents,
                numPages,
                pageNum,
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
