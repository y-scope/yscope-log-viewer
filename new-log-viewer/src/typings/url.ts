enum SEARCH_PARAM_NAME {
    FILE_PATH = "filePath"
}

enum HASH_PARAM_NAME {
    LOG_EVENT_NUM = "logEventNum"
}

interface UrlSearchParams {
    [SEARCH_PARAM_NAME.FILE_PATH]: string,
}

interface UrlHashParams {
    logEventNum: number,
}

type UrlSearchParamUpdatesType = {
    [T in keyof UrlSearchParams]?: UrlSearchParams[T] | null
}
type UrlHashParamUpdatesType = {
    [T in keyof UrlHashParams]?: UrlHashParams[T] | null
}

type UrlParamsType = {
    [T in keyof UrlSearchParams]: UrlSearchParams[T] | null
} & {
    [T in keyof UrlHashParams]: UrlHashParams[T] | null
};

export {
    HASH_PARAM_NAME,
    SEARCH_PARAM_NAME,
};
export type {
    UrlHashParams,
    UrlHashParamUpdatesType,
    UrlParamsType,
    UrlSearchParams,
    UrlSearchParamUpdatesType,
};
