import useLogFileManagerProxyStore from "../../stores/logFileManagerProxyStore.ts";
import useLogFileStore from "../../stores/logFileStore.ts";
import {handleErrorWithNotification} from "../../stores/notificationStore.ts";
import useQueryStore from "../../stores/queryStore";
import useUiStore from "../../stores/uiStore";
import useViewStore from "../../stores/viewStore";
import {Nullable} from "../../typings/common";
import {UI_STATE} from "../../typings/states";
import {
    CURSOR_CODE,
    CursorType,
} from "../../typings/worker";
import {clamp} from "../math";
import {
    getWindowUrlHashParams,
    updateUrlIfEventOnPage,
    updateWindowUrlHashParams,
    URL_HASH_PARAMS_DEFAULT,
} from "./index";


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

    const {isPrettified: prevIsPrettified, setLogEventNum} = useViewStore.getState();
    const clampedLogEventNum = clamp(logEventNum, 1, numEvents);

    if (isPrettified !== prevIsPrettified) {
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
        setLogEventNum(clampedLogEventNum);
        updateWindowUrlHashParams({logEventNum: clampedLogEventNum});
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
        isPrettified: isPrettified,
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
        const {isPrettified: prevIsPrettified, setIsPrettified} = useViewStore.getState();
        if (isPrettified !== prevIsPrettified) {
            setIsPrettified(isPrettified);
            await logFileManagerProxy.setIsPrettified(isPrettified);
        }
        const pageData = await logFileManagerProxy.loadPage(cursor);
        updatePageData(pageData);
        const {setUiState} = useUiStore.getState();
        setUiState(UI_STATE.READY);
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

export {
    updateQueryHashParams,
    updateViewHashParams,
};
