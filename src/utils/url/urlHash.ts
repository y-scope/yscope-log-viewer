import useLogFileManagerProxyStore from "../../stores/logFileManagerProxyStore";
import useLogFileStore from "../../stores/logFileStore";
import {handleErrorWithNotification} from "../../stores/notificationStore";
import useQueryStore from "../../stores/queryStore";
import useViewStore from "../../stores/viewStore";
import {Nullable} from "../../typings/common";
import {HASH_PARAM_NAMES} from "../../typings/url";
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
 * Converts a timestamp to an ISO 8601 date-time string (without the 'Z' suffix)
 *
 * @param timestamp
 */
const updateDateTimeString = (timestamp: number) => {
    const dateTimeString = new Date(timestamp).toISOString()
        .slice(0, -1);

    const {setDateTimeString} = useViewStore.getState();
    setDateTimeString(dateTimeString);
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
// eslint-disable-next-line max-statements
const getCursorFromHashParams = ({isPrettified, logEventNum, timestamp}: {
    isPrettified: boolean; logEventNum: number; timestamp: number;
}): Nullable<CursorType> => {
    const {numEvents} = useLogFileStore.getState();
    if (0 === numEvents) {
        updateWindowUrlHashParams({logEventNum: URL_HASH_PARAMS_DEFAULT.logEventNum});

        return null;
    }

    const {
        isPrettified: prevIsPrettified, setIsPrettified, setLogEventNum,
    } = useViewStore.getState();
    const clampedLogEventNum = clamp(logEventNum, 1, numEvents);

    if (isPrettified !== prevIsPrettified) {
        setIsPrettified(isPrettified);

        (async () => {
            const {logFileManagerProxy} = useLogFileManagerProxyStore.getState();
            await logFileManagerProxy.setIsPrettified(isPrettified);
        })().catch(handleErrorWithNotification);

        return {
            code: CURSOR_CODE.EVENT_NUM,
            args: {eventNum: clampedLogEventNum},
        };
    }

    if (timestamp !== URL_HASH_PARAMS_DEFAULT.timestamp) {
        updateDateTimeString(timestamp);

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
    return {
        code: CURSOR_CODE.LAST_EVENT,
        args: null,
    };
};

/**
 * Updates view-related states from URL hash parameters.
 * NOTE: this may modify the URL parameters.
 *
 * @return Whether any query-related parameters were modified.
 */
const updateViewHashParams = () => {
    const {isPrettified, logEventNum, filter, timestamp} = getWindowUrlHashParams();
    updateWindowUrlHashParams({
        filter: filter,
        isPrettified: isPrettified,
        timestamp: URL_HASH_PARAMS_DEFAULT.timestamp,
    });

    const {
        kqlFilterInput,
        kqlFilter,
        setKqlFilterInput,
        setKqlFilter,
        filterLogs,
    } = useViewStore.getState();

    let isQueryModified = false;
    if (filter !== kqlFilter) {
        if (kqlFilter === kqlFilterInput) {
            setKqlFilterInput(filter);
        }
        setKqlFilter(filter);
        filterLogs();
        isQueryModified = true;
    }

    const cursor = getCursorFromHashParams({isPrettified, logEventNum, timestamp});
    if (null === cursor) {
        // If no cursor was set, we can return early.
        return isQueryModified;
    }

    const {loadPageByCursor} = useViewStore.getState();
    loadPageByCursor(cursor).catch(handleErrorWithNotification);

    return isQueryModified;
};

/**
 * Updates query-related states from URL hash parameters.
 * NOTE: this may modify the URL parameters.
 *
 * @return Whether any query-related parameters were modified.
 */
const updateQueryHashParams = () => {
    const {searchIsCaseSensitive, searchIsRegex, search} = getWindowUrlHashParams();
    updateWindowUrlHashParams({searchIsCaseSensitive, searchIsRegex, search});

    const {
        queryIsCaseSensitive: currentQueryIsCaseSensitive,
        queryIsRegex: currentQueryIsRegex,
        queryString: currentQueryString,
        setQueryIsCaseSensitive,
        setQueryIsRegex,
        setQueryString,
    } = useQueryStore.getState();

    let isQueryModified = false;
    isQueryModified ||= searchIsCaseSensitive !== currentQueryIsCaseSensitive;
    setQueryIsCaseSensitive(searchIsCaseSensitive);

    isQueryModified ||= searchIsRegex !== currentQueryIsRegex;
    setQueryIsRegex(searchIsRegex);

    isQueryModified ||= search !== currentQueryString;
    setQueryString(search);

    return isQueryModified;
};

/**
 * Toggles the prettify state for formatted log viewing.
 */
const togglePrettify = () => {
    const {isPrettified} = useViewStore.getState();
    updateWindowUrlHashParams({[HASH_PARAM_NAMES.IS_PRETTIFIED]: !isPrettified});
    updateViewHashParams();
};

export {
    togglePrettify,
    updateQueryHashParams,
    updateViewHashParams,
};
