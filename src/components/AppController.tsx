import React, {
    useEffect,
    useRef,
} from "react";

import useLogFileStore from "../stores/logFileStore";
import {handleErrorWithNotification} from "../stores/notificationStore";
import useQueryStore from "../stores/queryStore";
import useUiStore from "../stores/uiStore";
import useViewStore from "../stores/viewStore";
import {TAB_NAME} from "../typings/tab";
import {
    getWindowUrlHashParams,
    getWindowUrlSearchParams,
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
        const {setActiveTabName} = useUiStore.getState();
        setActiveTabName(TAB_NAME.SEARCH);
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
        const hashParams = getWindowUrlHashParams();
        const {setIsPrettified} = useViewStore.getState();
        setIsPrettified(hashParams.isPrettified);

        const searchParams = getWindowUrlSearchParams();
        if (URL_SEARCH_PARAMS_DEFAULT.filePath !== searchParams.filePath) {
            (async () => {
                const {setLogEventNum} = useViewStore.getState();
                setLogEventNum(hashParams.logEventNum);

                const {loadFile} = useLogFileStore.getState();
                await loadFile(searchParams.filePath);

                handleHashChange();
            })().catch(handleErrorWithNotification);
        }

        return () => {
            window.removeEventListener("hashchange", handleHashChange);
        };
    }, []);

    return children;
};

export default AppController;
