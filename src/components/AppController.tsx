import React, {
    useEffect,
    useRef,
} from "react";

import useLogFileStore from "../stores/logFileStore";
import {handleErrorWithNotification} from "../stores/notificationStore";
import useQueryStore from "../stores/queryStore";
import useViewStore from "../stores/viewStore";
import {
    HASH_PARAM_NAMES,
    UrlHashParams,
} from "../typings/url";
import {
    CURSOR_CODE,
    CursorType,
} from "../typings/worker";
import {
    getWindowUrlHashParams,
    getWindowUrlSearchParams,
    updateWindowUrlHashParams,
    URL_HASH_PARAMS_DEFAULT,
    URL_SEARCH_PARAMS_DEFAULT,
} from "../utils/url";
import {
    updateQueryHashParams,
    updateViewHashParams,
} from "../utils/url/urlHash";


/**
 * Handles hash change events by updating the application state based on the URL hash parameters.
 */
const handleHashChange = () => {
    updateViewHashParams();
    if (updateQueryHashParams()) {
        const {startQuery} = useQueryStore.getState();
        startQuery();
    }
};

/**
 * Returns the initial load file cursor based on the URL hash parameters.
 *
 * @param hashParams
 * @return
 */
const getInitialCursor = (hashParams: UrlHashParams) => {
    let cursor: CursorType = {code: CURSOR_CODE.LAST_EVENT, args: null};

    if (URL_HASH_PARAMS_DEFAULT.timestamp !== hashParams.timestamp) {
        cursor = {
            code: CURSOR_CODE.TIMESTAMP,
            args: {timestamp: hashParams.timestamp},
        };
    } else if (URL_HASH_PARAMS_DEFAULT.logEventNum !== hashParams.logEventNum) {
        const {setLogEventNum} = useViewStore.getState();
        setLogEventNum(hashParams.logEventNum);
        cursor = {
            code: CURSOR_CODE.EVENT_NUM,
            args: {eventNum: hashParams.logEventNum},
        };
    }

    return cursor;
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
        const hashParams = getWindowUrlHashParams();
        updateWindowUrlHashParams({
            isPrettified: hashParams[HASH_PARAM_NAMES.IS_PRETTIFIED],
            timestamp: URL_HASH_PARAMS_DEFAULT.timestamp,
        });
        const {setIsPrettified} = useViewStore.getState();
        setIsPrettified(hashParams.isPrettified);

        const searchParams = getWindowUrlSearchParams();
        if (URL_SEARCH_PARAMS_DEFAULT.filePath !== searchParams.filePath) {
            const {loadFile} = useLogFileStore.getState();
            (async () => {
                await loadFile(searchParams.filePath);
                const {loadPageByCursor} = useViewStore.getState();
                await loadPageByCursor(getInitialCursor(hashParams));
                if (updateQueryHashParams()) {
                    const {startQuery} = useQueryStore.getState();
                    startQuery();
                }
            })().catch(handleErrorWithNotification);
        }

        return () => {
            window.removeEventListener("hashchange", handleHashChange);
        };
    }, []);

    return children;
};

export default AppController;
