enum SEARCH_PARAM_NAME {
    FILE_PATH = "filePath"
}

enum HASH_PARAM_NAME {
    LOG_EVENT_NUM = "logEventNum"
}

interface UrlSearchParams {
    [SEARCH_PARAM_NAME.FILE_PATH]?: string,
}

interface UrlHashParams {
    logEventNum?: number,
}

type UrlSearchParamUpdatesType = {
    [key in keyof UrlSearchParams]?: UrlSearchParams[key] | null
}
type UrlHashParamUpdatesType = {
    [key in keyof UrlHashParams]?: UrlHashParams[key] | null
}

type UrlParamsType = {
    [key in keyof UrlSearchParams]?: UrlSearchParams[key];
} & {
    [key in keyof UrlHashParams]?: UrlHashParams[key];
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
