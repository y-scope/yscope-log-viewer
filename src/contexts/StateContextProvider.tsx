import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
} from "react";

import {UI_STATE} from "../typings/states";
import {
    CURSOR_CODE,
    CursorType,
    WORKER_REQ_CODE,
} from "../typings/worker";
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


const StateContext = createContext<null>(null);

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
    const beginLineNumToLogEventNum = useLogFileStore((state) => state.beginLineNumToLogEventNum);
    const loadFile = useLogFileStore((state) => state.loadFile);
    const mainWorker = useMainWorkerStore((state) => state.mainWorker);
    const numEvents = useLogFileStore((state) => state.numEvents);
    const setLogEventNum = useLogFileStore((state) => state.setLogEventNum);
    const setUiState = useUiStore((state) => state.setUiState);
    const setPostPopUp = useLogFileStore((state) => state.setPostPopUp);

    // Refs
    const logEventNumRef = useRef(logEventNum);

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

    useEffect(() => {
        setPostPopUp(postPopUp);
    }, [
        postPopUp,
        setPostPopUp,
    ]);


    return (
        <StateContext.Provider value={null}>
            {children}
        </StateContext.Provider>
    );
};


export default StateContextProvider;
export {StateContext};
