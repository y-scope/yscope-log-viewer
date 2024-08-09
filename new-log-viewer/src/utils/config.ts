import * as assert from "node:assert";

import {
    CONFIG_NAME,
    ConfigMap,
    ConfigUpdate,
    LOCAL_STORAGE_KEY,
} from "../typings/config";


const DECODER_DEFAULT = {
    formatString: "%d{yyyy-MM-dd HH:mm:ss.SSS} [%process.thread.name] %log.level" + " %message%n",
    logLevelKey: "log.level",
    timestampKey: "@timestamp",
};


const THEME_DEFAULT = "light";

/**
 *
 * @param code
 */
const getConfig = <T extends CONFIG_NAME>(code: T) => {
    const result: Partial<ConfigMap> = {};
    switch (code) {
        case CONFIG_NAME.DECODER_OPTIONS:
            result[CONFIG_NAME.DECODER_OPTIONS] = {
                formatString: window.localStorage.getItem(
                    LOCAL_STORAGE_KEY.DECODER_OPTIONS_FORMAT_STRING
                ) || DECODER_DEFAULT.formatString,
                logLevelKey: window.localStorage.getItem(
                    LOCAL_STORAGE_KEY.DECODER_OPTIONS_LOG_LEVEL_KEY
                ) || DECODER_DEFAULT.logLevelKey,
                timestampKey: window.localStorage.getItem(
                    LOCAL_STORAGE_KEY.DECODER_OPTIONS_TIMESTAMP_KEY
                ) || DECODER_DEFAULT.timestampKey,
            };
            break;
        case CONFIG_NAME.THEME:
            result[CONFIG_NAME.THEME] = window.localStorage.getItem(LOCAL_STORAGE_KEY.THEME) || THEME_DEFAULT;
            break;
        case CONFIG_NAME.PAGE_SIZE:
            result[CONFIG_NAME.PAGE_SIZE] = Number(window.localStorage.getItem(LOCAL_STORAGE_KEY.PAGE_SIZE));
            break;
        default:
            console.error(`Unexpected code: ${code}`);
            break;
    }

    return result[code] as ConfigMap[T];
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

export {getConfig};
