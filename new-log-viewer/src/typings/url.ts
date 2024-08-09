import {Nullable} from "./common";


enum SEARCH_PARAM_NAMES {
    FILE_PATH = "filePath",
}

enum HASH_PARAM_NAMES {
    LOG_EVENT_NUM = "logEventNum",
}

interface UrlSearchParams {
    [SEARCH_PARAM_NAMES.FILE_PATH]: string,
}

interface UrlHashParams {
    logEventNum: number,
}

type UrlSearchParamUpdatesType = {
    [T in keyof UrlSearchParams]?: Nullable<UrlSearchParams[T]>;
}
type UrlHashParamUpdatesType = {
    [T in keyof UrlHashParams]?: Nullable<UrlHashParams[T]>;
}

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
