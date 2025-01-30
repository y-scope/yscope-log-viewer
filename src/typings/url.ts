import {Nullable} from "./common";


enum SEARCH_PARAM_NAMES {
    FILE_PATH = "filePath",
    IS_CASE_SENSITIVE = "isCaseSensitive",
    IS_REGEX = "isRegex",
    QUERY_STRING = "queryString",
}

enum HASH_PARAM_NAMES {
    LOG_EVENT_NUM = "logEventNum",
}

interface UrlSearchParams {
    [SEARCH_PARAM_NAMES.FILE_PATH]: string,
    [SEARCH_PARAM_NAMES.IS_CASE_SENSITIVE]: boolean,
    [SEARCH_PARAM_NAMES.IS_REGEX]: boolean,
    [SEARCH_PARAM_NAMES.QUERY_STRING]: string,
}

interface UrlHashParams {
    logEventNum: number;
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
