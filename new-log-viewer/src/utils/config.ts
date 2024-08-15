import {Nullable} from "../typings/common";
import {
    CONFIG_CODE,
    ConfigMap,
    ConfigUpdate,
    LOCAL_STORAGE_KEY,
    THEME_NAME,
} from "../typings/config";


const MAX_PAGE_SIZE = 1_000_000;

/**
 * The default configuration values.
 */
const CONFIG_DEFAULT: ConfigMap = Object.freeze({
    [CONFIG_CODE.DECODER_OPTIONS]: {
        formatString: "%d{yyyy-MM-dd HH:mm:ss.SSS} [%process.thread.name] %log.level %message%n",
        logLevelKey: "log.level",
        timestampKey: "@timestamp",
    },
    [CONFIG_CODE.THEME]: THEME_NAME.SYSTEM,
    [CONFIG_CODE.PAGE_SIZE]: 10_000,
});

/**
 * Validates the configuration value based on the provided code and value.
 *
 * @param props The code and value to be validated.
 * @param props.code
 * @param props.value
 * @return Null if the value is valid, otherwise returns an error message.
 */
const testConfig = ({code, value}: ConfigUpdate): Nullable<string> => {
    let result = null;
    switch (code) {
        case CONFIG_CODE.THEME:
            if (false === (Object.values(THEME_NAME)).includes(value)) {
                result = "Invalid theme name.";
            }
            break;
        case CONFIG_CODE.PAGE_SIZE:
            if (MAX_PAGE_SIZE < value || 0 >= value) {
                result = "Invalid page size.";
            }
            break;
        default: break;
    }

    return result;
};


/**
 * Updates the configuration value based on the provided code and value.
 *
 * @param props The code and value to be updated.
 * @param props.code
 * @param props.value
 * @return Null if the update succeeds, otherwise returns an error message.
 */
const setConfig = ({code, value}: ConfigUpdate): Nullable<string> => {
    const error = testConfig({code, value} as ConfigUpdate);
    if (null !== error) {
        console.error(`Unable to set ${code}=${JSON.stringify(value)}: ${error}`);

        return error;
    }

    switch (code) {
        case CONFIG_CODE.DECODER_OPTIONS:
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
        case CONFIG_CODE.THEME:
            window.localStorage.setItem(LOCAL_STORAGE_KEY.THEME, value);
            break;
        case CONFIG_CODE.PAGE_SIZE:
            window.localStorage.setItem(LOCAL_STORAGE_KEY.PAGE_SIZE, value.toString());
            break;
        default: break;
    }

    return null;
};

/**
 * Retrieves the configuration value for the specified code.
 *
 * @param code The code representing the configuration to retrieve.
 * @return The value.
 */
const getConfig = <T extends CONFIG_CODE>(code: T): ConfigMap[T] => {
    let value = null;

    // Read values from `localStorage`.
    switch (code) {
        case CONFIG_CODE.DECODER_OPTIONS:
            value = {
                formatString: window.localStorage.getItem(
                    LOCAL_STORAGE_KEY.DECODER_OPTIONS_FORMAT_STRING
                ),
                logLevelKey: window.localStorage.getItem(
                    LOCAL_STORAGE_KEY.DECODER_OPTIONS_LOG_LEVEL_KEY
                ),
                timestampKey: window.localStorage.getItem(
                    LOCAL_STORAGE_KEY.DECODER_OPTIONS_TIMESTAMP_KEY
                ),
            };
            break;
        case CONFIG_CODE.THEME: {
            value = window.localStorage.getItem(LOCAL_STORAGE_KEY.THEME);
            break;
        }
        case CONFIG_CODE.PAGE_SIZE:
            value = window.localStorage.getItem(LOCAL_STORAGE_KEY.PAGE_SIZE);
            break;
        default: break;
    }

    // Fallback to default values if the config is absent from `localStorage`.
    if (null === value ||
        ("object" === typeof value && Object.values(value).includes(null))) {
        value = CONFIG_DEFAULT[code];
        setConfig({code, value} as ConfigUpdate);
    }

    // Process values read from `localStorage`.
    switch (code) {
        case CONFIG_CODE.PAGE_SIZE:
            value = Number(value);
            break;
        default: break;
    }

    return value as ConfigMap[T];
};

export {
    CONFIG_DEFAULT,
    getConfig,
    setConfig,
    testConfig,
};
