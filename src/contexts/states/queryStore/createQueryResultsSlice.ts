import {StateCreator} from "zustand";

import {QueryResultsType} from "../../../typings/query";
import {
    QueryResultsSlice,
    QueryResultsValues,
    QueryState,
} from "./types";


const QUERY_RESULTS_DEFAULT: QueryResultsValues = {
    queryResults: new Map<number, QueryResultsType[]>(),
};

/**
 * Creates a slice for handling query results.
 *
 * @param set
 * @return
 */
const createQueryResultsSlice: StateCreator<
    QueryState,
    [],
    [],
    QueryResultsSlice> = (set) => ({
    ...QUERY_RESULTS_DEFAULT,
    clearQueryResults: () => {
        set({queryResults: new Map()});
    },
    mergeQueryResults: (newQueryResults) => {
        if (0 === newQueryResults.size) {
            return;
        }

        set((state) => {
            const mergedResults = new Map(state.queryResults);

            newQueryResults.forEach((resultsPerPage, queryPageNum) => {
                if (!mergedResults.has(queryPageNum)) {
                    mergedResults.set(queryPageNum, []);
                }
                mergedResults.get(queryPageNum)?.push(...resultsPerPage);
            });

            return {queryResults: mergedResults};
        });
    },
});

export {
    createQueryResultsSlice,
    QUERY_RESULTS_DEFAULT,
};
