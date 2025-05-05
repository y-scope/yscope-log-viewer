import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
} from "react";

import {LOG_LEVEL} from "../typings/logs";
import {DO_NOT_TIMEOUT_VALUE} from "../typings/notifications";
import {UI_STATE} from "../typings/states";
import {
    CURSOR_CODE,
    CursorType,
    PageData,
} from "../typings/worker";
import {
    findNearestLessThanOrEqualElement,
    isWithinBounds,
} from "../utils/data";
import {clamp} from "../utils/math";
import {NotificationContext} from "./NotificationContextProvider";
import useContextStore from "./states/contextStore";
import useLogFileManagerStore from "./states/LogFileManagerStore";
import useLogFileStore from "./states/logFileStore";
import useUiStore from "./states/uiStore";
import useViewStore from "./states/viewStore";
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
    const {filePath, isPrettified, logEventNum} = useContext(UrlContext);

    // States
    const beginLineNumToLogEventNum = useViewStore((state) => state.beginLineNumToLogEventNum);
    const loadFile = useLogFileStore((state) => state.loadFile);
    const {logFileManagerProxy} = useLogFileManagerStore.getState();
    const numEvents = useLogFileStore((state) => state.numEvents);
    const setIsPrettified = useUiStore((state) => state.setIsPrettified);
    const setLogEventNum = useContextStore((state) => state.setLogEventNum);
    const setUiState = useUiStore((state) => state.setUiState);
    const setPostPopUp = useContextStore((state) => state.setPostPopUp);

    // Refs
    const isPrettifiedRef = useRef<boolean>(isPrettified ?? false);
    const logEventNumRef = useRef(logEventNum);

    // Synchronize `logEventNumRef` with `logEventNum`.
    useEffect(() => {
        if (null !== logEventNum) {
            logEventNumRef.current = logEventNum;
            setLogEventNum(logEventNum);
        }
    }, [
        logEventNum,
        setLogEventNum,
    ]);

    // Synchronize `isPrettifiedRef` with `isPrettified`.
    useEffect(() => {
        isPrettifiedRef.current = isPrettified ?? false;
        setIsPrettified(isPrettifiedRef.current);
    }, [
        isPrettified,
        setIsPrettified,
    ]);

    // On `logEventNum` update, clamp it then switch page if necessary or simply update the URL.
    useEffect(() => {
        if (0 === numEvents || URL_HASH_PARAMS_DEFAULT.logEventNum === logEventNum) {
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

        logFileManagerProxy
            .loadPage(
                cursor,
                isPrettifiedRef.current
            )
            .then((pageData: PageData) => {
                useViewStore.getState().updatePageData(pageData);
            })
            .catch((reason: unknown) => {
                postPopUp({
                    level: LOG_LEVEL.ERROR,
                    message: String(reason),
                    timeoutMillis: DO_NOT_TIMEOUT_VALUE,
                    title: "Action failed",
                });
            });
    }, [
        beginLineNumToLogEventNum,
        logEventNum,
        logFileManagerProxy,
        numEvents,
        setUiState,
        postPopUp,
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
