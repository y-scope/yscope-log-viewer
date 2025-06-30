import React, {
    useEffect,
    useRef,
} from "react";

import useLogFileStore from "../stores/logFileStore";
import useQueryStore from "../stores/queryStore";
import useViewStore from "../stores/viewStore";
import {Nullable} from "../typings/common";
import {
    CURSOR_CODE,
    CursorType,
} from "../typings/worker";
import {
    getWindowUrlHashParams,
    getWindowUrlSearchParams,
    URL_HASH_PARAMS_DEFAULT,
    URL_SEARCH_PARAMS_DEFAULT,
} from "../utils/url";


/**
 * Updates view-related states from URL hash parameters.
 * NOTE: this may modify the URL parameters.
 */
const updateViewHashParams = () => {
    const {isPrettified, logEventNum} = getWindowUrlHashParams();
    const {updateIsPrettified, updateLogEventNum} = useViewStore.getState();

    updateIsPrettified(isPrettified);
    updateLogEventNum(logEventNum);
};

/**
 * Updates query-related states from URL hash parameters.
 * NOTE: this may modify the URL parameters.
 *
 * @return Whether any query-related parameters were modified.
 */
const updateQueryHashParams = () => {
    const {queryIsCaseSensitive, queryIsRegex, queryString} = getWindowUrlHashParams();
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

    return children;
};


export default AppController;
