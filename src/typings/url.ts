import {Nullable} from "./common";


enum SEARCH_PARAM_NAMES {
    FILE_PATH = "filePath",
}

enum HASH_PARAM_NAMES {
    LOG_EVENT_NUM = "logEventNum",
    IS_PRETTIFIED = "isPrettified",
    QUERY_IS_CASE_SENSITIVE = "queryIsCaseSensitive",
    QUERY_IS_REGEX = "queryIsRegex",
    QUERY_STRING = "queryString",
}

interface UrlSearchParams {
    [SEARCH_PARAM_NAMES.FILE_PATH]: string;
}

interface UrlHashParams {
    [HASH_PARAM_NAMES.IS_PRETTIFIED]: boolean;
    [HASH_PARAM_NAMES.LOG_EVENT_NUM]: number;
    [HASH_PARAM_NAMES.QUERY_IS_CASE_SENSITIVE]: boolean;
    [HASH_PARAM_NAMES.QUERY_IS_REGEX]: boolean;
    [HASH_PARAM_NAMES.QUERY_STRING]: string;
}

type UrlSearchParamUpdatesType = {
    [T in keyof UrlSearchParams]?: Nullable<UrlSearchParams[T]>;
};

type UrlHashParamUpdatesType = {
    [T in keyof UrlHashParams]?: Nullable<UrlHashParams[T]>;
};

type UrlParamsType = {
    [T in keyof UrlSearchParams]: Nullable<UrlSearchParams[T]>;
} & {
    [T in keyof UrlHashParams]: Nullable<UrlHashParams[T]>;
};

export {
    HASH_PARAM_NAMES,
    SEARCH_PARAM_NAMES,
};
export type {
    UrlHashParams,
    UrlHashParamUpdatesType,
    UrlParamsType,
    UrlSearchParams,
    UrlSearchParamUpdatesType,
};
