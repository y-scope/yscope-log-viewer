import {StateCreator} from "zustand";

import {LOG_LEVEL} from "../../typings/logs";
import {DO_NOT_TIMEOUT_VALUE} from "../../typings/notifications";
import useContextStore from "../contextStore";
import useLogFileManagerStore from "../logFileManagerProxyStore";
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
        })().catch((e: unknown) => {
            console.error(e);

            const {postPopUp} = useContextStore.getState();
            postPopUp({
                level: LOG_LEVEL.ERROR,
                message: String(e),
                timeoutMillis: DO_NOT_TIMEOUT_VALUE,
                title: "Action failed",
            });
        });
    },
});

export default createQueryControllerSlice;
