import {Nullable} from "../typings/common";
import {
    CONFIG_KEY,
    ConfigMap,
    ConfigUpdate,
    LOCAL_STORAGE_KEY,
    THEME_NAME,
} from "../typings/config";
import {DecoderOptions} from "../typings/decoders";
import {TAB_NAME} from "../typings/tab";


const EXPORT_LOGS_CHUNK_SIZE = 10_000;
const MAX_PAGE_SIZE = 1_000_000;
const QUERY_CHUNK_SIZE = 10_000;

/**
 * The default configuration values.
 */
const CONFIG_DEFAULT: ConfigMap = Object.freeze({
    [CONFIG_KEY.DECODER_OPTIONS]: {
        formatString: "",
        logLevelKey: "log.level",
        timestampKey: "@timestamp",
    },
    [CONFIG_KEY.INITIAL_TAB_NAME]: TAB_NAME.FILE_INFO,
    [CONFIG_KEY.THEME]: THEME_NAME.SYSTEM,
    [CONFIG_KEY.PAGE_SIZE]: 10_000,
});

/**
 * Validates the config denoted by the given key and value.
 *
 * @param props
 * @param props.key
 * @param props.value
 * @return `null` if the value is valid, or an error message otherwise.
 * @throws {Error} If the config item cannot be managed by these config utilities.
 */
const testConfig = ({key, value}: ConfigUpdate): Nullable<string> => {
    let result = null;
    switch (key) {
        case CONFIG_KEY.DECODER_OPTIONS:
            if (0 === value.timestampKey.length) {
                result = "Timestamp key cannot be empty.";
            } else if (0 === value.logLevelKey.length) {
                result = "Log level key cannot be empty.";
            }
            break;
        case CONFIG_KEY.INITIAL_TAB_NAME:
            // This config option is not intended for direct user input.
            break;
        case CONFIG_KEY.THEME:
            throw new Error(`"${key}" cannot be managed using these utilities.`);
        case CONFIG_KEY.PAGE_SIZE:
            if (0 >= value || MAX_PAGE_SIZE < value) {
                result = `Page size must be greater than 0 and less than ${MAX_PAGE_SIZE + 1}.`;
            }
            break;
        default: break;
    }

    return result;
};


/**
 * Updates the config denoted by the given key and value.
 *
 * @param props
 * @param props.key
 * @param props.value
 * @return `null` if the update succeeds, or an error message otherwise.
 * @throws {Error} If the config item cannot be managed by these config utilities.
 */
const setConfig = ({key, value}: ConfigUpdate): Nullable<string> => {
    const error = testConfig({key, value} as ConfigUpdate);
    if (null !== error) {
        console.error(`Unable to set ${key}=${JSON.stringify(value)}: ${error}`);

        return error;
    }

    switch (key) {
        case CONFIG_KEY.DECODER_OPTIONS:
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
        case CONFIG_KEY.INITIAL_TAB_NAME:
            window.localStorage.setItem(CONFIG_KEY.INITIAL_TAB_NAME, value.toString());
            break;
        case CONFIG_KEY.THEME:
            throw new Error(`"${key}" cannot be managed using these utilities.`);
        case CONFIG_KEY.PAGE_SIZE:
            window.localStorage.setItem(LOCAL_STORAGE_KEY.PAGE_SIZE, value.toString());
            break;
        default: break;
    }

    return null;
};

/**
 * Retrieves the config value for the specified key.
 *
 * @param key
 * @return The value.
 * @throws {Error} If the config item cannot be managed by these config utilities.
 */
const getConfig = <T extends CONFIG_KEY>(key: T): ConfigMap[T] => {
    let value = null;

    // Read values from `localStorage`.
    switch (key) {
        case CONFIG_KEY.DECODER_OPTIONS:
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
            } as DecoderOptions;
            break;
        case CONFIG_KEY.INITIAL_TAB_NAME:
            value = window.localStorage.getItem(LOCAL_STORAGE_KEY.INITIAL_TAB_NAME);
            break;
        case CONFIG_KEY.THEME:
            throw new Error(`"${key}" cannot be managed using these utilities.`);
        case CONFIG_KEY.PAGE_SIZE:
            value = window.localStorage.getItem(LOCAL_STORAGE_KEY.PAGE_SIZE);
            break;
        default: break;
    }

    // Fallback to default values if the config is absent from `localStorage`.
    if (null === value ||
        ("object" === typeof value && Object.values(value).includes(null))) {
        value = CONFIG_DEFAULT[key];
        setConfig({key, value} as ConfigUpdate);
    }

    // Process values read from `localStorage`.
    switch (key) {
        case CONFIG_KEY.PAGE_SIZE:
            value = Number(value);
            break;
        default: break;
    }

    return value as ConfigMap[T];
};

export {
    CONFIG_DEFAULT,
    EXPORT_LOGS_CHUNK_SIZE,
    getConfig,
    QUERY_CHUNK_SIZE,
    setConfig,
    testConfig,
};
