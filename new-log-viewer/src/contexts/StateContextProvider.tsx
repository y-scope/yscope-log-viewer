// eslint-disable-next-line no-warning-comments
// TODO: move handlers out from StateContextProvider.
/* eslint-disable max-lines, max-lines-per-function, max-statements */
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
    firstLogEventNumOnPage: number[],
    lastLogEventNumOnPage: number[],
    logData: string,
    numEvents: number,
    numFilteredEvents: number,
    pageNum: Nullable<number>,

    changeLogLevelFilter: (newLogLevelFilter: LogLevelFilter) => void,
    loadFile: (fileSrc: FileSrcType, cursor: CursorType) => void,
    loadPage: (newPageNum: number) => void,
}
const StateContext = createContext<StateContextType>({} as StateContextType);

/**
 * Default values of the state object.
 */
const STATE_DEFAULT: Readonly<StateContextType> = Object.freeze({
    beginLineNumToLogEventNum: new Map<number, number>(),
    fileName: "",
    firstLogEventNumOnPage: [],
    lastLogEventNumOnPage: [],
    logData: "Loading...",
    numEvents: 0,
    numFilteredEvents: 0,
    numPages: 0,
    pageNum: 0,

    changeLogLevelFilter: () => null,
    loadFile: () => null,
    loadPage: () => null,
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

    const [fileName, setFileName] = useState<string>(STATE_DEFAULT.fileName);

    const [logData, setLogData] = useState<string>(STATE_DEFAULT.logData);
    const [numEvents, setNumEvents] = useState<number>(STATE_DEFAULT.numEvents);

    const [numFilteredEvents, setNumFilteredEvents] = useState<number>(STATE_DEFAULT.numFilteredEvents);

    const [pageNum, setPageNum] = useState<Nullable<number>>(STATE_DEFAULT.pageNum);

    const beginLineNumToLogEventNumRef =
        useRef<BeginLineNumToLogEventNumMap>(STATE_DEFAULT.beginLineNumToLogEventNum);

    const firstLogEventNumPerPage =
        useRef<number[]>(STATE_DEFAULT.firstLogEventNumOnPage);
    const lastLogEventNumPerPage =
        useRef<number[]>(STATE_DEFAULT.lastLogEventNumOnPage);

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
                console.log(`page data log event`)
                //console.log(logEventNumRef.current);
                //let logEventInput = logEventNumRef.current;
                const newLogEventNum: number = getClosestLogEventNum(args.beginLineNumToLogEventNum)
                updateWindowUrlHashParams({
                    logEventNum: newLogEventNum,
                });
                break;
            }
            case WORKER_RESP_CODE.VIEW_INFO:
                setNumFilteredEvents(args.numFilteredEvents)
                firstLogEventNumPerPage.current = args.firstLogEventNumPerPage;
                lastLogEventNumPerPage.current = args.lastLogEventNumPerPage;
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
        workerPostReq(mainWorkerRef.current, WORKER_REQ_CODE.CHANGE_FILTER, {
            cursor: {code: CURSOR_CODE.PAGE_NUM, args: {pageNum: 1}},
            logLevelFilter: newLogLevelFilter,
        });
    };


    const loadPage = (newPageNum: number) => {
        if (null === mainWorkerRef.current) {
            console.error("Unexpected null mainWorkerRef.current");
            return;
        }
        workerPostReq(mainWorkerRef.current, WORKER_REQ_CODE.LOAD_PAGE, {
            cursor: {code: CURSOR_CODE.PAGE_NUM, args: {pageNum: newPageNum}},
        });
    };

    // On `logEventNum` update, clamp it then switch page if necessary or simply update the URL.
    useEffect(() => {
        console.log(logEventNum)
        if (null === mainWorkerRef.current || URL_HASH_PARAMS_DEFAULT.logEventNum === logEventNum ||
            0 === firstLogEventNumPerPage.current.length || numEvents === STATE_DEFAULT.numEvents) {
            return;
        }

        let clampedLogEventNum: number  = clamp(logEventNum, 1, numEvents);

        console.log(logEventNum)

        const newPageIndex = firstLogEventNumPerPage.current.findLastIndex((value: number) => value <= clampedLogEventNum);

        if (-1 === newPageIndex) {
            // logEventNum is not on any available page
            if (logEventNum !== clampedLogEventNum)
            updateWindowUrlHashParams({
                logEventNum: clampedLogEventNum,
            });
            return;
        }

        const newPageNum = newPageIndex + 1

        if (newPageNum !== pageNum) {
            loadPage(newPageNum);
            setPageNum(newPageNum);
        } else {
            // Page has not changed
            // This will trigger another useEffect but shouldn't do anything
            const newLogEventNum = getClosestLogEventNum(beginLineNumToLogEventNumRef.current)
            updateWindowUrlHashParams({
                logEventNum: newLogEventNum,
            });
        }
    }, [
        logEventNum,
    ]);

    // On `filePath` update, load file.
    useEffect(() => {
        if (URL_SEARCH_PARAMS_DEFAULT.filePath === filePath) {
            return;
        }

        let cursor: CursorType = {code: CURSOR_CODE.LAST_EVENT, args: null};
        if (URL_HASH_PARAMS_DEFAULT.logEventNum !== logEventNum) {
            // Set which page to load since the user specified a specific `logEventNum`.\=
            // NOTE: Since we don't know how many pages the log file contains, we only clamp the
            // minimum of the page number.
            const newPageNum = Math.max(
                getChunkNum(logEventNum, getConfig(CONFIG_KEY.PAGE_SIZE)),
                1
            );

            cursor = {code: CURSOR_CODE.PAGE_NUM, args: {pageNum: newPageNum}};
            setPageNum(newPageNum)
        }
        loadFile(filePath, cursor);
    }, [
        filePath,
        loadFile,
    ]);

    // Do not move this out of component. There are some strange effects with React that will occasionally
    // set logEventNum to null if outside.
    const getClosestLogEventNum = (beginLineNumToLogEventNum: BeginLineNumToLogEventNumMap) => {
        let inputLogEventNum = logEventNum;
        let newLogEventNum: Nullable<number>  = null;
        const logEventNumOnPage = Array.from(beginLineNumToLogEventNum.values())

        // On initial load we don't know load event so just use last value
        if (!inputLogEventNum) {
            newLogEventNum = logEventNumOnPage.at(-1) as number
            return newLogEventNum;
        }

        for (let i = logEventNumOnPage.length; i > 0; i--) {
            if (logEventNumOnPage[i] as number <= inputLogEventNum) {
                newLogEventNum = logEventNumOnPage[i] as number;
                break;
            }
        }

        if (!newLogEventNum) {
            //If all elements larger than logEvent, i.e. all checks in findLastIndex are false, i.e. logEvent is the smallest return first one
            newLogEventNum = logEventNumOnPage[0] as number;
        }

        return newLogEventNum;
    };

    return (
        <StateContext.Provider
            value={{
                beginLineNumToLogEventNum: beginLineNumToLogEventNumRef.current,
                changeLogLevelFilter: changeLogLevelFilter,
                fileName: fileName,
                firstLogEventNumOnPage: firstLogEventNumPerPage.current,
                lastLogEventNumOnPage: lastLogEventNumPerPage.current,
                loadFile: loadFile,
                loadPage: loadPage,
                logData: logData,
                numEvents: numEvents,
                numFilteredEvents: numFilteredEvents,
                pageNum: pageNum,
            }}
        >
            {children}
        </StateContext.Provider>
    );
};


export default StateContextProvider;
export {StateContext};
