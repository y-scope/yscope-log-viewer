import {create} from "zustand";

import {
    QueryResults,
    QueryResultsType,
} from "../../typings/query";
import {WORKER_REQ_CODE} from "../../typings/worker";
import useMainWorkerStore from "./mainWorkerStore";


const QUERY_DEFAULT = {
    queryProgress: 0,
    queryResults: new Map<number, QueryResultsType[]>(),
    queryString: "",
    queryIsCaseSensitive: false,
    queryIsRegex: false,
};

interface QueryState {
    queryProgress: number;
    queryResults: QueryResults;
    queryString: string;
    queryIsCaseSensitive: boolean;
    queryIsRegex: boolean;

    clearQueryResults: () => void;
    mergeQueryResults: (newQueryResults: QueryResults) => void;
    startQuery: () => void;
    setQueryProgress: (newProgress: number) => void;
}

const useQueryStore = create<QueryState>((set) => ({
    ...QUERY_DEFAULT,
    clearQueryResults: () => {
        set({
            queryResults: QUERY_DEFAULT.queryResults,
            queryProgress: QUERY_DEFAULT.queryProgress,
        });
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
    startQuery: () => {
        const {
            clearQueryResults,
            queryString,
            queryIsCaseSensitive,
            queryIsRegex,
        } = useQueryStore.getState();

        clearQueryResults();
        const {mainWorker} = useMainWorkerStore.getState();
        if (null === mainWorker) {
            console.error("startQuery: Main worker is not initialized.");

            return;
        }
        mainWorker.postMessage(WORKER_REQ_CODE.START_QUERY, {
            queryString,
            queryIsCaseSensitive,
            queryIsRegex,
        } as StructuredSerializeOptions);
    },
    setQueryProgress: (newProgress) => {
        set({queryProgress: newProgress});
    },
}));

export {
    QUERY_DEFAULT,
    useQueryStore,
};
