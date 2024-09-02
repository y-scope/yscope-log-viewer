import {Nullable} from "./common";


enum LOG_LEVEL {
    NONE = 0,
    TRACE,
    DEBUG,
    INFO,
    WARN,
    ERROR,
    FATAL
}

/**
 * List of potential log level names in log event entries.
 */
const LOG_LEVEL_NAMES_LIST = Object.freeze(
    Object.values(LOG_LEVEL).filter((value) => "string" === typeof value)
);

type LogLevelFilter = Nullable<LOG_LEVEL[]>;

const INVALID_TIMESTAMP_VALUE = 0;

export type {LogLevelFilter};
export {
    INVALID_TIMESTAMP_VALUE,
    LOG_LEVEL,
    LOG_LEVEL_NAMES_LIST,
};
