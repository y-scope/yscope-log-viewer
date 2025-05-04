import {QueryResults} from "../../../typings/query";


interface QueryConfigSlice {
    // States
    queryString: string;
    queryIsCaseSensitive: boolean;
    queryIsRegex: boolean;

    // Setters
    setQueryString: (newQueryString: string) => void;
    setQueryIsCaseSensitive: (newQueryIsCaseSensitive: boolean) => void;
    setQueryIsRegex: (newQueryIsRegex: boolean) => void;
}

interface QueryResultsSlice {
    queryResults: QueryResults;
    clearQueryResults: () => void;
    mergeQueryResults: (newQueryResults: QueryResults) => void;
}

interface QueryControllerSlice {
    queryProgress: number;

    clearQuery: () => void;
    startQuery: () => void;
    setQueryProgress: (newProgress: number) => void;
}

type QueryState = QueryConfigSlice & QueryControllerSlice & QueryResultsSlice;

export type {
    QueryConfigSlice,
    QueryControllerSlice,
    QueryResultsSlice,
    QueryState,
};
