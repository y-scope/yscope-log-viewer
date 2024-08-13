import {
    CONFIG_NAME,
    ConfigMap,
    ConfigUpdate,
    LOCAL_STORAGE_KEY,
} from "../typings/config";
import {
    WORKER_RESP_CODE,
    WorkerResp,
} from "../typings/worker";


/**
 *
 * @param code
 * @param args
 */
const postResp = <T extends WORKER_RESP_CODE>(
    code: T,
    args: WorkerResp<T>
) => {
    postMessage({code, args});
};

/**
 *
 * @param code
 */
const getConfig = <T extends CONFIG_NAME>(code: T): ConfigMap[T] | null => {
    switch (code) {
        case CONFIG_NAME.DECODER_OPTIONS:
            return {
                formatString: window.localStorage.getItem(
                    LOCAL_STORAGE_KEY.DECODER_OPTIONS_FORMAT_STRING
                ),
                logLevelKey: window.localStorage.getItem(
                    LOCAL_STORAGE_KEY.DECODER_OPTIONS_LOG_LEVEL_KEY
                ),
                timestampKey: window.localStorage.getItem(
                    LOCAL_STORAGE_KEY.DECODER_OPTIONS_TIMESTAMP_KEY
                ),
            } as ConfigMap[T];
        case CONFIG_NAME.THEME:
            return window.localStorage.getItem(LOCAL_STORAGE_KEY.THEME) as ConfigMap[T];
        case CONFIG_NAME.PAGE_SIZE:
            return window.localStorage.getItem(LOCAL_STORAGE_KEY.PAGE_SIZE) as ConfigMap[T];
        default: return null;
    }
};

/**
 *
 * @param configUpdates
 */
const setConfig = (configUpdates: ConfigUpdate) => {
    const {code, value} = configUpdates;
    switch (code) {
        case CONFIG_NAME.DECODER_OPTIONS:
            window.localStorage.setItem(
                LOCAL_STORAGE_KEY.DECODER_OPTIONS_FORMAT_STRING,
                value.formatString
            );
            window.localStorage.setItem(
                LOCAL_STORAGE_KEY.DECODER_OPTIONS_LOG_LEVEL_KEY,
                value.logLevelKey
            );
            window.localStorage.setItem(
                LOCAL_STORAGE_KEY.DECODER_OPTIONS_TIMESTAMP_KEY,
                value.timestampKey
            );
            break;
        case CONFIG_NAME.THEME:
            window.localStorage.setItem(LOCAL_STORAGE_KEY.THEME, value);
            break;
        case CONFIG_NAME.PAGE_SIZE:
            window.localStorage.setItem(LOCAL_STORAGE_KEY.PAGE_SIZE, value.toString());
            break;
        default: break;
    }
};
