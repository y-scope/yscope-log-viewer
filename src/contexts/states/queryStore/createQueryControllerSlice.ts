import {StateCreator} from "zustand";

import {LOG_LEVEL} from "../../../typings/logs";
import {DO_NOT_TIMEOUT_VALUE} from "../../../typings/notifications";
import useContextStore from "../contextStore";
import useLogFileManagerStore from "../LogFileManagerProxyStore";
import {QUERY_RESULTS_DEFAULT} from "./createQueryResultsSlice";
import {QUERY_CONFIG_DEFAULT} from "./queryConfigSlice";
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
            queryIsCaseSensitive: QUERY_CONFIG_DEFAULT.queryIsCaseSensitive,
            queryIsRegex: QUERY_CONFIG_DEFAULT.queryIsRegex,
            queryProgress: QUERY_CONTROLLER_DEFAULT.queryProgress,
            queryResults: QUERY_RESULTS_DEFAULT.queryResults,
            queryString: QUERY_CONFIG_DEFAULT.queryString,
        });
    },
    setQueryProgress: (newProgress) => {
        set({queryProgress: newProgress});
    },
    startQuery: () => {
        const {
            clearQueryResults,
            queryString,
            queryIsCaseSensitive,
            queryIsRegex,
        } = get();

        if (QUERY_CONFIG_DEFAULT.queryString === queryString) {
            return;
        }

        clearQueryResults();

        useLogFileManagerStore
            .getState()
            .logFileManagerProxy
            .startQuery(
                queryString,
                queryIsRegex,
                queryIsCaseSensitive,
            ).catch((reason: unknown) => {
                useContextStore.getState().postPopUp({
                    level: LOG_LEVEL.ERROR,
                    message: String(reason),
                    timeoutMillis: DO_NOT_TIMEOUT_VALUE,
                    title: "Action failed",
                });
            });
    },
});

export default createQueryControllerSlice;
