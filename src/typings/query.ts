interface QueryArgs {
    queryString: string;
    queryIsCaseSensitive: boolean;
    queryIsRegex: boolean;
}

type TextRange = [number, number];

interface QueryResultsType {
    logEventNum: number;
    message: string;
    matchRange: TextRange;
}

type QueryResults = Map<number, QueryResultsType[]>;

const QUERY_PROGRESS_VALUE_MIN = 0;
const QUERY_PROGRESS_VALUE_MAX = 1;


export type {
    QueryArgs,
    QueryResults,
    QueryResultsType,
};
export {
    QUERY_PROGRESS_VALUE_MAX,
    QUERY_PROGRESS_VALUE_MIN,
};
