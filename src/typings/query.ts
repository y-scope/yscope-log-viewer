const QUERY_PROGRESS_VALUE_MIN = 0;
const QUERY_PROGRESS_VALUE_MAX = 1;

interface QueryArgs {
    queryString: string;
    isCaseSensitive: boolean;
    isRegex: boolean;
}

type TextRange = [number, number];

interface QueryResultsType {
    logEventNum: number;
    message: string;
    matchRange: TextRange;
}

type QueryResults = Map<number, QueryResultsType[]>;

export {
    QUERY_PROGRESS_VALUE_MAX,
    QUERY_PROGRESS_VALUE_MIN,
};
export type {
    QueryArgs,
    QueryResults,
    QueryResultsType,
};
