/* eslint max-lines: ["error", 600] */
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

import {CONFIG_KEY} from "../typings/config";
import {LogLevelFilter} from "../typings/logs";
import {UI_STATE} from "../typings/states";
import {TAB_NAME} from "../typings/tab";
import {
    CURSOR_CODE,
    CursorType,
    WORKER_REQ_CODE,
} from "../typings/worker";
import {getConfig} from "../utils/config";
import {
    findNearestLessThanOrEqualElement,
    isWithinBounds,
} from "../utils/data";
import {clamp} from "../utils/math";
import {NotificationContext} from "./NotificationContextProvider";
import useLogFileStore from "./states/logFileStore";
import useMainWorkerStore from "./states/mainWorkerStore";
import useUiStore from "./states/uiStore";
import {
    updateWindowUrlHashParams,
    URL_HASH_PARAMS_DEFAULT,
    URL_SEARCH_PARAMS_DEFAULT,
    UrlContext,
} from "./UrlContextProvider";


interface StateContextType {
    activeTabName: TAB_NAME;

    filterLogs: (filter: LogLevelFilter) => void;
    setActiveTabName: (tabName: TAB_NAME) => void;
}

const StateContext = createContext<StateContextType>({} as StateContextType);

/**
 * Default values of the state object.
 */
const STATE_DEFAULT: Readonly<StateContextType> = Object.freeze({
    activeTabName: getConfig(CONFIG_KEY.INITIAL_TAB_NAME),

    filterLogs: () => null,
    setActiveTabName: () => null,
});

interface StateContextProviderProps {
    children: React.ReactNode;
}

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
const StateContextProvider = ({children}: StateContextProviderProps) => {
    const {postPopUp} = useContext(NotificationContext);
    const {filePath, logEventNum} = useContext(UrlContext);

    // States
    const [activeTabName, setActiveTabName] = useState<TAB_NAME>(STATE_DEFAULT.activeTabName);

    const beginLineNumToLogEventNum = useLogFileStore((state) => state.beginLineNumToLogEventNum);
    const loadFile = useLogFileStore((state) => state.loadFile);
    const mainWorker = useMainWorkerStore((state) => state.mainWorker);
    const numEvents = useLogFileStore((state) => state.numEvents);
    const setLogEventNum = useLogFileStore((state) => state.setLogEventNum);
    const setUiState = useUiStore((state) => state.setUiState);

    // Refs
    const logEventNumRef = useRef(logEventNum);

    const handleFormatPopupPrimaryAction = useCallback(() => {
        setActiveTabName(TAB_NAME.SETTINGS);
    }, []);

    /*
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
            case WORKER_RESP_CODE.FORMAT_POPUP:
                postPopUp({
                    level: LOG_LEVEL.INFO,
                    message: "Adding a format string can enhance the readability of your" +
                    " structured logs by customizing how fields are displayed.",
                    primaryAction: {
                        children: "Settings",
                        startDecorator: <SettingsOutlinedIcon/>,
                        onClick: handleFormatPopupPrimaryAction,
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
                if (QUERY_PROGRESS_VALUE_MIN === args.progress) {
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
    }, [
        handleFormatPopupPrimaryAction,
        postPopUp,
    ]);
     */

    const filterLogs = useCallback((filter: LogLevelFilter) => {
        if (null === mainWorker) {
            return;
        }

        setUiState(UI_STATE.FAST_LOADING);
        mainWorker.postMessage({
            code: WORKER_REQ_CODE.SET_FILTER,
            args: {
                cursor: {
                    code: CURSOR_CODE.EVENT_NUM,
                    args: {eventNum: logEventNumRef.current ?? 1},
                },
                logLevelFilter: filter,
            },
        });
    }, [
        mainWorker,
        setUiState,
    ]);

    // Synchronize `logEventNumRef` with `logEventNum`.
    useEffect(() => {
        logEventNumRef.current = logEventNum;
        if (null !== logEventNum) {
            setLogEventNum(logEventNum);
        } else {
            setLogEventNum(0);
        }
    }, [
        logEventNum,
        setLogEventNum,
    ]);

    // On `logEventNum` update, clamp it then switch page if necessary or simply update the URL.
    useEffect(() => {
        if (null === mainWorker) {
            return;
        }

        if (URL_HASH_PARAMS_DEFAULT.logEventNum === logEventNum) {
            return;
        }

        const logEventNumsOnPage: number [] =
            Array.from(beginLineNumToLogEventNum.values());

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
        mainWorker.postMessage({
            code: WORKER_REQ_CODE.LOAD_PAGE,
            args: {cursor: cursor},
        });
    }, [
        beginLineNumToLogEventNum,
        logEventNum,
        mainWorker,
        numEvents,
        setUiState,
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
                activeTabName: activeTabName,

                filterLogs: filterLogs,
                setActiveTabName: setActiveTabName,
            }}
        >
            {children}
        </StateContext.Provider>
    );
};


export default StateContextProvider;
export {StateContext};
