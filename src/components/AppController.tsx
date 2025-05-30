/* eslint max-statements: ["error", 30] */
import React, {useEffect} from "react";

import useLogFileManagerStore from "../stores/logFileManagerProxyStore";
import useLogFileStore from "../stores/logFileStore";
import {handleErrorWithNotification} from "../stores/notificationStore";
import useQueryStore from "../stores/queryStore";
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
import {
    getWindowUrlHashParams,
    getWindowUrlSearchParams,
    updateWindowUrlHashParams,
    URL_HASH_PARAMS_DEFAULT,
    URL_SEARCH_PARAMS_DEFAULT,
} from "../utils/url.ts";


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
): {isUpdated: boolean; nearestLogEventNum: number} => {
    if (false === isWithinBounds(logEventNumsOnPage, logEventNum)) {
        return {isUpdated: false, nearestLogEventNum: 0};
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

    return {isUpdated: true, nearestLogEventNum: nearestLogEventNum};
};

/**
 * Handle the hash parameters change.
 */
const handleHashChange = () => {
    const {setLogEventNum, updateIsPrettified} = useViewStore.getState();
    const hashParams = getWindowUrlHashParams();

    if (null !== hashParams.logEventNum) {
        setLogEventNum(hashParams.logEventNum);
    }

    if (null !== hashParams.isPrettified) {
        updateIsPrettified(hashParams.isPrettified);
    }
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
    // States
    const beginLineNumToLogEventNum = useViewStore((state) => state.beginLineNumToLogEventNum);

    const numEvents = useLogFileStore((state) => state.numEvents);

    const updatePageData = useViewStore((state) => state.updatePageData);

    const uiState = useUiStore((state) => state.uiState);

    useEffect(() => {
        const {loadFile} = useLogFileStore.getState();
        const {logEventNum} = useViewStore.getState();

        handleHashChange();
        window.addEventListener("hashchange", handleHashChange);

        // Handle initial page load and maintain full URL state
        const searchParams = getWindowUrlSearchParams();
        if (URL_SEARCH_PARAMS_DEFAULT.filePath !== searchParams.filePath) {
            let cursor: CursorType = {code: CURSOR_CODE.LAST_EVENT, args: null};
            if (URL_HASH_PARAMS_DEFAULT.logEventNum !== logEventNum) {
                cursor = {
                    code: CURSOR_CODE.EVENT_NUM,
                    args: {eventNum: logEventNum},
                };
            }
            loadFile(searchParams.filePath, cursor);
        }

        return () => {
            window.removeEventListener("hashchange", handleHashChange);
        };
    }, []);

    // On `logEventNum` update, clamp it then switch page if necessary or simply update the URL.
    useEffect(() => {
        const {isPrettified} = useViewStore.getState();
        const {logEventNum} = useViewStore.getState();
        const {logFileManagerProxy} = useLogFileManagerStore.getState();
        const {setLogEventNum} = useViewStore.getState();
        const {setUiState} = useUiStore.getState();

        if (0 === numEvents || URL_HASH_PARAMS_DEFAULT.logEventNum === logEventNum) {
            return;
        }

        const clampedLogEventNum = clamp(logEventNum, 1, numEvents);
        const logEventNumsOnPage: number [] =
            Array.from(beginLineNumToLogEventNum.values());

        const {
            isUpdated,
            nearestLogEventNum,
        } = updateUrlIfEventOnPage(clampedLogEventNum, logEventNumsOnPage);

        if (isUpdated) {
            // No need to request a new page since the log event is on the current page.
            setLogEventNum(nearestLogEventNum);

            return;
        }

        setUiState(UI_STATE.FAST_LOADING);

        (async () => {
            const cursor: CursorType = {
                code: CURSOR_CODE.EVENT_NUM,
                args: {eventNum: clampedLogEventNum},
            };
            const pageData = await logFileManagerProxy.loadPage(cursor, isPrettified);
            updatePageData(pageData);
        })().catch(handleErrorWithNotification);
    }, [
        beginLineNumToLogEventNum,
        numEvents,
        updatePageData,
    ]);

    useEffect(() => {
        if (UI_STATE.READY === uiState) {
            const {startQuery} = useQueryStore.getState();
            startQuery();
        }
    }, [
        uiState,
    ]);

    return children;
};


export default AppController;
