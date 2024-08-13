import {PAGE_SIZE} from "../contexts/StateContextProvider";
import {
    CONFIG_NAME,
    ConfigMap,
    ConfigUpdate,
    LOCAL_STORAGE_KEY,
} from "../typings/config";


const DECODER_OPTIONS_DEFAULT = {
    formatString: "%d{yyyy-MM-dd HH:mm:ss.SSS} [%process.thread.name] %log.level" + " %message%n",
    logLevelKey: "log.level",
    timestampKey: "@timestamp",
};
const THEMES = ["light",
    "dark"];
const THEME_DEFAULT = "light";

/**
 * Retrieves the configuration value from local storage based on the provided configuration name.
 *
 * @template T - The type of the configuration name.
 * @param code The configuration name to retrieve the value for.
 * @return - The configuration value or null if not found.
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
 * Validates the configuration updates based on the provided configuration updates.
 *
 * @param configUpdates
 * The configuration updates containing the code and value to be validated.
 * @return
 * A result message indicating any validation errors, or an empty string if no errors.
 */
const testConfig = (configUpdates: ConfigUpdate) => {
    const {code, value} = configUpdates;
    let result = "";
    switch (code) {
        case CONFIG_NAME.THEME:
            if (false === THEMES.includes(code)) {
                result = "Invalid theme name.";
            }
            break;
        case CONFIG_NAME.PAGE_SIZE:
            if (PAGE_SIZE < value) {
                result = "Page size must be less or equal to 10_000.";
            }
            break;
        default: break;
    }

    return result;
};

/**
 * Updates the configuration value in local storage based on the provided configuration updates.
 *
 * @param configUpdates The configuration updates containing the code and value to be set.
 */
const setConfig = (configUpdates: ConfigUpdate) => {
    const {code, value} = configUpdates;
    let error = "";
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
            error = testConfig(configUpdates);
            if (error) {
                console.error(error, "Setting theme to default");
                window.localStorage.setItem(LOCAL_STORAGE_KEY.THEME, THEME_DEFAULT);
                break;
            }
            window.localStorage.setItem(LOCAL_STORAGE_KEY.THEME, value);
            break;
        case CONFIG_NAME.PAGE_SIZE:
            error = testConfig(configUpdates);
            if (error) {
                console.error(error, "Setting page size to default");
                window.localStorage.setItem(LOCAL_STORAGE_KEY.PAGE_SIZE, PAGE_SIZE.toString());
                break;
            }
            window.localStorage.setItem(LOCAL_STORAGE_KEY.PAGE_SIZE, value.toString());
            break;
        default: break;
    }
};

export {
    DECODER_OPTIONS_DEFAULT,
    getConfig,
    setConfig,
    testConfig,
    THEME_DEFAULT,
    THEMES,
};
