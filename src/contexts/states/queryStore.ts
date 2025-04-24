import {create} from "zustand";

import {
    QueryResults,
    QueryResultsType,
} from "../../typings/query";
import {WORKER_REQ_CODE} from "../../typings/worker";
import useMainWorkerStore from "./mainWorkerStore";


const QUERY_DEFAULT = {
    queryIsCaseSensitive: false,
    queryIsRegex: false,
    queryProgress: 0,
    queryResults: new Map<number, QueryResultsType[]>(),
    queryString: "",
};

interface QueryState {
    queryProgress: number;
    queryResults: QueryResults;
    queryString: string;
    queryIsCaseSensitive: boolean;
    queryIsRegex: boolean;

    clearQuery: () => void;
    clearQueryResults: () => void;
    mergeQueryResults: (newQueryResults: QueryResults) => void;
    startQuery: () => void;
    setQueryProgress: (newProgress: number) => void;
    setQueryString: (newQueryString: string) => void;
    setQueryIsCaseSensitive: (newQueryIsCaseSensitive: boolean) => void;
    setQueryIsRegex: (newQueryIsRegex: boolean) => void;
}

// eslint-disable-next-line max-lines-per-function
const useQueryStore = create<QueryState>((set, get) => ({
    ...QUERY_DEFAULT,
    clearQuery: () => {
        set({
            queryIsCaseSensitive: QUERY_DEFAULT.queryIsCaseSensitive,
            queryIsRegex: QUERY_DEFAULT.queryIsRegex,
            queryProgress: QUERY_DEFAULT.queryProgress,
            queryResults: QUERY_DEFAULT.queryResults,
            queryString: QUERY_DEFAULT.queryString,
        });
    },
    clearQueryResults: () => {
        set({queryResults: new Map()});
    },
    mergeQueryResults: (newQueryResults) => {
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
    setQueryIsCaseSensitive: (newQueryIsCaseSensitive) => {
        set({queryIsCaseSensitive: newQueryIsCaseSensitive});
    },
    setQueryIsRegex: (newQueryIsRegex) => {
        set({queryIsRegex: newQueryIsRegex});
    },
    setQueryProgress: (newProgress) => {
        set({queryProgress: newProgress});
    },
    setQueryString: (newQueryString) => {
        set({queryString: newQueryString});
    },
    startQuery: () => {
        const {
            clearQueryResults,
            queryString,
            queryIsCaseSensitive,
            queryIsRegex,
        } = get();

        if (QUERY_DEFAULT.queryString === queryString) {
            return;
        }

        const {mainWorker} = useMainWorkerStore.getState();
        if (null === mainWorker) {
            console.error("startQuery: Main worker is not initialized.");

            return;
        }

        clearQueryResults();
        mainWorker.postMessage({
            code: WORKER_REQ_CODE.START_QUERY,
            args: {
                queryString,
                queryIsCaseSensitive,
                queryIsRegex,
            },
        });
    },
}));

export default useQueryStore;
