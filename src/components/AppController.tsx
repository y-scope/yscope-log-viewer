import React, {
    useEffect,
    useRef,
} from "react";

import useLogFileStore from "../stores/logFileStore";
import useQueryStore from "../stores/queryStore";
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
import {
    updateQueryHashParams,
    updateViewHashParams,
} from "../utils/url/urlHash";


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

export {updateViewHashParams};
export default AppController;
