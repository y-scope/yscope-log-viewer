import React, {
    useEffect,
    useRef,
} from "react";

import useLogFileManagerProxyStore from "../stores/logFileManagerProxyStore";
import useLogFileStore from "../stores/logFileStore";
import {handleErrorWithNotification} from "../stores/notificationStore";
import useQueryStore from "../stores/queryStore";
import useViewStore from "../stores/viewStore";
import {Nullable} from "../typings/common";
import {
    CURSOR_CODE,
    CursorType,
} from "../typings/worker";
import {
    findNearestLessThanOrEqualElement,
    isWithinBounds,
} from "../utils/data";
import {clamp} from "../utils/math.ts";
import {
    getWindowUrlHashParams,
    getWindowUrlSearchParams,
    updateWindowUrlHashParams,
    URL_HASH_PARAMS_DEFAULT,
    URL_SEARCH_PARAMS_DEFAULT,
} from "../utils/url";


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
 * Determines the cursor for navigating log events based on URL hash parameters.
 *
 * @param params An object containing the following properties:
 * @param params.isPrettified Whether the log view is in prettified mode.
 * @param params.logEventNum The log event number from the URL hash.
 * @param params.timestamp The timestamp from the URL hash.
 * @return `CursorType` object if a navigation action is needed, or `null` if no action is required.
 */
const getCursorFromHashParams = ({isPrettified, logEventNum, timestamp}: {
    isPrettified: boolean; logEventNum: number; timestamp: number;
}): Nullable<CursorType> => {
    const {numEvents} = useLogFileStore.getState();
    if (0 === numEvents) {
        updateWindowUrlHashParams({logEventNum: URL_HASH_PARAMS_DEFAULT.logEventNum});

        return null;
    }

    const {
        isPrettified: prevIsPrettified, updateIsPrettified, updateLogEventNum,
    } = useViewStore.getState();
    const clampedLogEventNum = clamp(logEventNum, 1, numEvents);

    if (isPrettified !== prevIsPrettified) {
        updateIsPrettified(isPrettified);

        return {
            code: CURSOR_CODE.EVENT_NUM,
            args: {eventNum: clampedLogEventNum},
        };
    }

    if (timestamp !== URL_HASH_PARAMS_DEFAULT.timestamp) {
        return {
            code: CURSOR_CODE.TIMESTAMP,
            args: {timestamp: timestamp},
        };
    } else if (logEventNum !== URL_HASH_PARAMS_DEFAULT.logEventNum) {
        updateLogEventNum(logEventNum);
        const {beginLineNumToLogEventNum} = useViewStore.getState();
        const logEventNumsOnPage: number[] = Array.from(beginLineNumToLogEventNum.values());
        if (updateUrlIfEventOnPage(clampedLogEventNum, logEventNumsOnPage)) {
            // No need to request a new page since the log event is on the current page.
            return null;
        }

        return {
            code: CURSOR_CODE.EVENT_NUM,
            args: {eventNum: clampedLogEventNum},
        };
    }

    // If we reach here, we have no valid cursor.
    return null;
};

/**
 * Updates view-related states from URL hash parameters.
 * NOTE: this may modify the URL parameters.
 */
const updateViewHashParams = () => {
    const {isPrettified, logEventNum, timestamp} = getWindowUrlHashParams();
    updateWindowUrlHashParams({
        isPrettified: URL_HASH_PARAMS_DEFAULT.isPrettified,
        timestamp: URL_HASH_PARAMS_DEFAULT.timestamp,
    });

    const cursor = getCursorFromHashParams({isPrettified, logEventNum, timestamp});
    if (null === cursor) {
        // If no cursor was set, we can return early.
        return;
    }

    (async () => {
        const {logFileManagerProxy} = useLogFileManagerProxyStore.getState();
        const {updatePageData} = useViewStore.getState();
        const pageData = await logFileManagerProxy.loadPage(cursor, isPrettified);
        updatePageData(pageData);
    })().catch(handleErrorWithNotification);
};

/**
 * Updates query-related states from URL hash parameters.
 * NOTE: this may modify the URL parameters.
 *
 * @return Whether any query-related parameters were modified.
 */
const updateQueryHashParams = () => {
    const {queryIsCaseSensitive, queryIsRegex, queryString} = getWindowUrlHashParams();
    updateWindowUrlHashParams({queryIsCaseSensitive, queryIsRegex, queryString});

    const {
        queryIsCaseSensitive: currentQueryIsCaseSensitive,
        queryIsRegex: currentQueryIsRegex,
        queryString: currentQueryString,
        setQueryIsCaseSensitive,
        setQueryIsRegex,
        setQueryString,
    } = useQueryStore.getState();

    let isQueryModified = false;
    isQueryModified ||= queryIsCaseSensitive !== currentQueryIsCaseSensitive;
    setQueryIsCaseSensitive(queryIsCaseSensitive);

    isQueryModified ||= queryIsRegex !== currentQueryIsRegex;
    setQueryIsRegex(queryIsRegex);

    isQueryModified ||= queryString !== currentQueryString;
    setQueryString(queryString);

    return isQueryModified;
};

/**
 * Handles hash change events by updating the application state based on the URL hash parameters.
 *
 * @param [ev] The hash change event, or `null` when called on application initialization.
 */
const handleHashChange = (ev: Nullable<HashChangeEvent>) => {
    updateViewHashParams();
    const isTriggeredByHashChange = null !== ev;
    if (isTriggeredByHashChange && updateQueryHashParams()) {
        const {startQuery} = useQueryStore.getState();
        startQuery();
    }

    // eslint-disable-next-line no-warning-comments
    // TODO: Remove empty or falsy parameters.
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
    // Refs
    const isInitialized = useRef<boolean>(false);

    // On app init, register hash change handler, and handle hash and search parameters.
    useEffect(() => {
        window.addEventListener("hashchange", handleHashChange);

        // Prevent re-initialization on re-renders.
        if (isInitialized.current) {
            return () => null;
        }
        isInitialized.current = true;

        // Handle initial page load and maintain full URL state
        handleHashChange(null);
        const hashParams = getWindowUrlHashParams();
        const searchParams = getWindowUrlSearchParams();
        if (URL_SEARCH_PARAMS_DEFAULT.filePath !== searchParams.filePath) {
            let cursor: CursorType = {code: CURSOR_CODE.LAST_EVENT, args: null};

            if (URL_HASH_PARAMS_DEFAULT.timestamp !== hashParams.timestamp) {
                cursor = {
                    code: CURSOR_CODE.TIMESTAMP,
                    args: {timestamp: hashParams.timestamp},
                };
            } else if (URL_HASH_PARAMS_DEFAULT.logEventNum !== hashParams.logEventNum) {
                cursor = {
                    code: CURSOR_CODE.EVENT_NUM,
                    args: {eventNum: hashParams.logEventNum},
                };
            }
            const {loadFile} = useLogFileStore.getState();
            loadFile(searchParams.filePath, cursor);
        }

        return () => {
            window.removeEventListener("hashchange", handleHashChange);
        };
    }, []);

    return children;
};


export default AppController;
