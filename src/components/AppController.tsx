/* eslint max-statements: ["error", 30] */
import React, {
    useEffect,
    useRef,
} from "react";

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

    const fileSrc = useLogFileStore((state) => state.fileSrc);
    const loadFile = useLogFileStore((state) => state.loadFile);
    const setFileSrc = useLogFileStore((state) => state.setFileSrc);

    const isPrettified = useViewStore((state) => state.isPrettified);
    const updateIsPrettified = useViewStore((state) => state.updateIsPrettified);

    const {logFileManagerProxy} = useLogFileManagerStore.getState();
    const numEvents = useLogFileStore((state) => state.numEvents);

    const logEventNum = useViewStore((state) => state.logEventNum);
    const setLogEventNum = useViewStore((state) => state.setLogEventNum);

    const updatePageData = useViewStore((state) => state.updatePageData);

    const setUiState = useUiStore((state) => state.setUiState);

    // Refs
    const isPrettifiedRef = useRef<boolean>(isPrettified);
    const logEventNumRef = useRef(logEventNum);

    useEffect(() => {
        const handleHashChange = () => {
            const hashParams = getWindowUrlHashParams();

            if (null !== hashParams.logEventNum) {
                setLogEventNum(hashParams.logEventNum);
            }

            if (null !== hashParams.isPrettified) {
                updateIsPrettified(hashParams.isPrettified);
            }

            // Also check search params to handle initial page load and maintain full URL state
            const searchParams = getWindowUrlSearchParams();

            if (null !== searchParams.filePath) {
                setFileSrc(searchParams.filePath);
            }
        };

        handleHashChange();

        window.addEventListener("hashchange", handleHashChange);

        return () => {
            window.removeEventListener("hashchange", handleHashChange);
        };
    }, [setFileSrc,
        setLogEventNum,
        updateIsPrettified]);

    // Synchronize `isPrettifiedRef` with `isPrettified`.
    useEffect(() => {
        isPrettifiedRef.current = isPrettified;
    }, [
        isPrettified,
    ]);

    // Synchronize `logEventNumRef` with `logEventNum`.
    useEffect(() => {
        logEventNumRef.current = logEventNum;
    }, [
        logEventNum,
    ]);

    // On `logEventNum` update, clamp it then switch page if necessary or simply update the URL.
    useEffect(() => {
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
            const pageData = await logFileManagerProxy.loadPage(cursor, isPrettifiedRef.current);
            updatePageData(pageData);
        })().catch(handleErrorWithNotification);
    }, [
        beginLineNumToLogEventNum,
        logEventNum,
        logFileManagerProxy,
        numEvents,
        setLogEventNum,
        setUiState,
        updatePageData,
    ]);

    // On `fileSrc` update, load file.
    useEffect(() => {
        if (URL_SEARCH_PARAMS_DEFAULT.filePath === fileSrc) {
            return;
        }

        let cursor: CursorType = {code: CURSOR_CODE.LAST_EVENT, args: null};
        if (URL_HASH_PARAMS_DEFAULT.logEventNum !== logEventNumRef.current) {
            cursor = {
                code: CURSOR_CODE.EVENT_NUM,
                args: {eventNum: logEventNumRef.current},
            };
        }
        loadFile(fileSrc, cursor);
    }, [
        fileSrc,
        loadFile,
    ]);

    return children;
};


export default AppController;
