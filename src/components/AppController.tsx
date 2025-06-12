import React, {
    useEffect,
    useRef,
} from "react";

import useLogFileManagerStore from "../stores/logFileManagerProxyStore";
import useLogFileStore from "../stores/logFileStore";
import {handleErrorWithNotification} from "../stores/notificationStore";
import useQueryStore from "../stores/queryStore";
import useUiStore from "../stores/uiStore";
import useViewStore from "../stores/viewStore";
import {Nullable} from "../typings/common";
import {UI_STATE} from "../typings/states";
import {UrlHashParams} from "../typings/url";
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
 * Updates view-related parameters from URL hash.
 *
 * @param hashParams
 */
const updateViewHashParams = (hashParams: UrlHashParams): void => {
    const {isPrettified, logEventNum} = hashParams;
    const {updateIsPrettified, setLogEventNum} = useViewStore.getState();

    updateIsPrettified(isPrettified);
    setLogEventNum(logEventNum);
};

/**
 * Updates query-related parameters from URL hash.
 *
 * @param hashParams
 * @return Whether any query parameters were modified.
 */
const updateQueryHashParams = (hashParams: UrlHashParams): boolean => {
    const {queryIsCaseSensitive, queryIsRegex, queryString} = hashParams;
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
 * @return The parsed URL hash parameters.
 */
const handleHashChange = (ev: Nullable<HashChangeEvent>): UrlHashParams => {
    const hashParams = getWindowUrlHashParams();
    updateViewHashParams(hashParams);
    const isQueryModified = updateQueryHashParams(hashParams);
    const isTriggeredByHashChange = null !== ev;
    if (isTriggeredByHashChange && isQueryModified) {
        const {startQuery} = useQueryStore.getState();
        startQuery();
    }

    // eslint-disable-next-line no-warning-comments
    // TODO: Remove empty or falsy parameters.

    return hashParams;
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
    const logEventNum = useViewStore((state) => state.logEventNum);

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
        const hashParams = handleHashChange(null);
        const searchParams = getWindowUrlSearchParams();
        if (URL_SEARCH_PARAMS_DEFAULT.filePath !== searchParams.filePath) {
            let cursor: CursorType = {code: CURSOR_CODE.LAST_EVENT, args: null};

            if (URL_HASH_PARAMS_DEFAULT.logEventNum !== hashParams.logEventNum) {
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

    // On `logEventNum` update, clamp it then switch page if necessary or simply update the URL.
    useEffect(() => {
        const {numEvents} = useLogFileStore.getState();
        if (0 === numEvents || URL_HASH_PARAMS_DEFAULT.logEventNum === logEventNum) {
            return;
        }

        const clampedLogEventNum = clamp(logEventNum, 1, numEvents);
        const {beginLineNumToLogEventNum} = useViewStore.getState();
        const logEventNumsOnPage: number [] = Array.from(beginLineNumToLogEventNum.values());
        if (updateUrlIfEventOnPage(clampedLogEventNum, logEventNumsOnPage)) {
            // No need to request a new page since the log event is on the current page.
            return;
        }

        // If the log event is not on the current page, request a new page.
        const {setUiState} = useUiStore.getState();
        setUiState(UI_STATE.FAST_LOADING);
        (async () => {
            const {logFileManagerProxy} = useLogFileManagerStore.getState();
            const cursor: CursorType = {
                code: CURSOR_CODE.EVENT_NUM,
                args: {eventNum: clampedLogEventNum},
            };
            const {isPrettified} = useViewStore.getState();

            const pageData = await logFileManagerProxy.loadPage(cursor, isPrettified);
            const {updatePageData} = useViewStore.getState();
            updatePageData(pageData);
        })().catch(handleErrorWithNotification);
    }, [logEventNum]);

    return children;
};


export default AppController;
