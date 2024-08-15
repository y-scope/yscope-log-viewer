import {
    CONFIG_NAME,
    ConfigMap,
    ConfigUpdate,
    ConfigValueType,
    LOCAL_STORAGE_KEY,
} from "../typings/config";


const MAX_PAGE_SIZE = 100_000;

enum THEME {
    LIGHT = "light",
    DARK = "dark",
}

/**
 *
 */
const CONFIG_DEFAULT: ConfigMap = Object.freeze({
    [CONFIG_NAME.DECODER_OPTIONS]: {
        formatString: "%d{yyyy-MM-dd HH:mm:ss.SSS} [%process.thread.name] %log.level %message%n",
        logLevelKey: "log.level",
        timestampKey: "@timestamp",
    },
    [CONFIG_NAME.THEME]: THEME.DARK,
    [CONFIG_NAME.PAGE_SIZE]: MAX_PAGE_SIZE,
});

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
            if (MAX_PAGE_SIZE < value || 0 >= value) {
                result = "Invalid page size.";
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

/**
 * Retrieves the configuration value from local storage based on the provided configuration name.
 *
 * @template T - The type of the configuration name.
 * @param code The configuration name to retrieve the value for.
 * @return - The configuration value or null if not found.
 */
const getConfig = <T extends CONFIG_NAME>(code: T) => {
    // const result = null;
    let value = null;
    const result: ConfigValueType<T> = {code: code, value: null};

    // const result: Partial<ConfigMap> = {};
    switch (result.code) {
        case CONFIG_NAME.DECODER_OPTIONS:
            value = {
                formatString:
                    window.localStorage.getItem(LOCAL_STORAGE_KEY.DECODER_OPTIONS_FORMAT_STRING),
                logLevelKey:
                    window.localStorage.getItem(LOCAL_STORAGE_KEY.DECODER_OPTIONS_LOG_LEVEL_KEY),
                timestampKey:
                    window.localStorage.getItem(LOCAL_STORAGE_KEY.DECODER_OPTIONS_TIMESTAMP_KEY),
            };
            break;
        case CONFIG_NAME.THEME: {
            value = window.localStorage.getItem(LOCAL_STORAGE_KEY.THEME);
            break;
        }
        case CONFIG_NAME.PAGE_SIZE:
            value = window.localStorage.getItem(LOCAL_STORAGE_KEY.PAGE_SIZE);
            break;
        default: break;
    }

    //
    // // Note only if value is a non-object type, we need to check if it is null
    // if (null === value) {
    //     result.value = CONFIG_DEFAULT[code];
    //     setConfig(result);
    // }

    switch (result.code) {
        case CONFIG_NAME.DECODER_OPTIONS:
            break;
        case CONFIG_NAME.THEME:
            result.value = String(value);
            break;
        case CONFIG_NAME.PAGE_SIZE:
            result.value = Number(value);
            break;
        default: break;
    }


    return result.value as ConfigMap[T];
};

export {
    CONFIG_DEFAULT,
    DECODER_OPTIONS_DEFAULT,
    getConfig,
    setConfig,
    testConfig,
};
