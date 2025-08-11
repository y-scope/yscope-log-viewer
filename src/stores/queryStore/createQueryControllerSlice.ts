import {StateCreator} from "zustand";

import useLogFileManagerStore from "../logFileManagerProxyStore";
import {handleErrorWithNotification} from "../notificationStore";
import {QUERY_CONFIG_DEFAULT} from "./createQueryConfigSlice.ts";
import {QUERY_RESULTS_DEFAULT} from "./createQueryResultsSlice";
import {
    QueryControllerSlice,
    QueryControllerValues,
    QueryState,
} from "./types";


const QUERY_CONTROLLER_DEFAULT: QueryControllerValues = {
    queryProgress: 0,
};

/**
 * Creates a slice for handling queries & clearing queries.
 *
 * @param set
 * @param get
 * @return
 */
const createQueryControllerSlice: StateCreator<
    QueryState, [], [], QueryControllerSlice
> = (set, get) => ({
    ...QUERY_CONTROLLER_DEFAULT,
    clearQuery: () => {
        set({
            ...QUERY_CONFIG_DEFAULT,
            ...QUERY_CONTROLLER_DEFAULT,
            ...QUERY_RESULTS_DEFAULT,
        });
    },
    setQueryProgress: (newProgress) => {
        set({queryProgress: newProgress});
    },
    startQuery: () => {
        const {clearQueryResults} = get();
        clearQueryResults();

        (async () => {
            const {logFileManagerProxy} = useLogFileManagerStore.getState();
            const {
                queryString,
                queryIsCaseSensitive,
                queryIsRegex,
            } = get();

            await logFileManagerProxy.startQuery(queryString, queryIsRegex, queryIsCaseSensitive);
        })().catch(handleErrorWithNotification);
    },
});

export default createQueryControllerSlice;
