import React, {
    useContext,
    useEffect,
    useRef,
} from "react";

import {
    updateWindowUrlHashParams,
    URL_HASH_PARAMS_DEFAULT,
    URL_SEARCH_PARAMS_DEFAULT,
    UrlContext,
} from "../contexts/UrlContextProvider";
import useContextStore from "../stores/contextStore";
import useLogFileManagerStore from "../stores/logFileManagerProxyStore";
import useLogFileStore from "../stores/logFileStore";
import {handleErrorWithNotification} from "../stores/notificationStore";
import useUiStore from "../stores/uiStore";
import useViewStore from "../stores/viewStore";
import {UI_STATE} from "../typings/states";
import {
    CURSOR_CODE,
    CursorType,
} from "../typings/worker";
import {
    findNearestLessThanOrEqualElement,
    isWithinBounds,
} from "../utils/data";
import {clamp} from "../utils/math";


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

interface AppControllerProps {
    children: React.ReactNode;
}

/**
 * Manages states for the application.
 *
 * @param props
 * @param props.children
 * @return
 */
const AppController = ({children}: AppControllerProps) => {
    const {filePath, isPrettified, logEventNum} = useContext(UrlContext);

    // States
    const setLogEventNum = useContextStore((state) => state.setLogEventNum);
    const logFileManagerProxy = useLogFileManagerStore((state) => state.logFileManagerProxy);
    const loadFile = useLogFileStore((state) => state.loadFile);
    const numEvents = useLogFileStore((state) => state.numEvents);
    const beginLineNumToLogEventNum = useViewStore((state) => state.beginLineNumToLogEventNum);
    const setIsPrettified = useViewStore((state) => state.updateIsPrettified);
    const updatePageData = useViewStore((state) => state.updatePageData);
    const setUiState = useUiStore((state) => state.setUiState);

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

        const clampedLogEventNum = clamp(logEventNum, 1, numEvents);
        const logEventNumsOnPage: number [] =
            Array.from(beginLineNumToLogEventNum.values());

        if (updateUrlIfEventOnPage(clampedLogEventNum, logEventNumsOnPage)) {
            // No need to request a new page since the log event is on the current page.
            return;
        }

        setUiState(UI_STATE.FAST_LOADING);

        (async () => {
            const cursor: CursorType = {
                code: CURSOR_CODE.EVENT_NUM,
                args: {eventNum: clampedLogEventNum},
            };
            const pageData = await logFileManagerProxy.loadPage(cursor, isPrettifiedRef.current);
            updatePageData(pageData);
        })().catch(handleErrorWithNotification);
    }, [
        beginLineNumToLogEventNum,
        logEventNum,
        logFileManagerProxy,
        numEvents,
        setUiState,
        updatePageData,
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

    return children;
};


export default AppController;
