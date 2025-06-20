import {QueryResults} from "../../typings/query";


interface QueryConfigValues {
    queryString: string;
    queryIsCaseSensitive: boolean;
    queryIsRegex: boolean;
    resultButtonClickSignal: boolean;
    resultSelection: number;
}

interface QueryConfigActions {
    notifyResultButtonClick: (clickState: boolean) => void;
    setQueryIsCaseSensitive: (newQueryIsCaseSensitive: boolean) => void;
    setQueryIsRegex: (newQueryIsRegex: boolean) => void;
    setQueryString: (newQueryString: string) => void;
    setResultSelection: (newResultSelection: number) => void;
}

type QueryConfigSlice = QueryConfigValues & QueryConfigActions;

interface QueryResultsValues {
    queryResults: QueryResults;
}

interface QueryResultsActions {
    clearQueryResults: () => void;
    mergeQueryResults: (newQueryResults: QueryResults) => void;
}

type QueryResultsSlice = QueryResultsValues & QueryResultsActions;

interface QueryControllerValues {
    queryProgress: number;
}

interface QueryControllerActions {
    clearQuery: () => void;
    startQuery: () => void;
    setQueryProgress: (newProgress: number) => void;
}

type QueryControllerSlice = QueryControllerValues & QueryControllerActions;

type QueryState = QueryConfigSlice & QueryControllerSlice & QueryResultsSlice;

export type {
    QueryConfigSlice,
    QueryConfigValues,
    QueryControllerSlice,
    QueryControllerValues,
    QueryResultsSlice,
    QueryResultsValues,
    QueryState,
};
