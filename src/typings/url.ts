import {Nullable} from "./common";


enum SEARCH_PARAM_NAMES {
    FILE_PATH = "filePath",
}

enum HASH_PARAM_NAMES {
    FILTER = "filter",
    IS_PRETTIFIED = "isPrettified",
    LOG_EVENT_NUM = "logEventNum",
    SEARCH_IS_CASE_SENSITIVE = "searchIsCaseSensitive",
    SEARCH_IS_REGEX = "searchIsRegex",
    SEARCH_STRING = "search",
    TIMESTAMP = "timestamp",
}

interface UrlSearchParams {
    [SEARCH_PARAM_NAMES.FILE_PATH]: string;
}

interface UrlHashParams {
    [HASH_PARAM_NAMES.FILTER]: string;
    [HASH_PARAM_NAMES.IS_PRETTIFIED]: boolean;
    [HASH_PARAM_NAMES.LOG_EVENT_NUM]: number;
    [HASH_PARAM_NAMES.SEARCH_IS_CASE_SENSITIVE]: boolean;
    [HASH_PARAM_NAMES.SEARCH_IS_REGEX]: boolean;
    [HASH_PARAM_NAMES.SEARCH_STRING]: string;
    [HASH_PARAM_NAMES.TIMESTAMP]: number;
}

type UrlSearchParamUpdatesType = {
    [T in keyof UrlSearchParams]?: Nullable<UrlSearchParams[T]>;
};

type UrlHashParamUpdatesType = {
    [T in keyof UrlHashParams]?: Nullable<UrlHashParams[T]>;
};

export {
    HASH_PARAM_NAMES,
    SEARCH_PARAM_NAMES,
};
export type {
    UrlHashParams,
    UrlHashParamUpdatesType,
    UrlSearchParams,
    UrlSearchParamUpdatesType,
};
