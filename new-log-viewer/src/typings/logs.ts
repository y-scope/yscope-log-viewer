enum LOG_LEVEL {
    UNKNOWN = 0,
    TRACE,
    DEBUG,
    INFO,
    WARN,
    ERROR,
    FATAL
}

/**
 * Out-of-range value for `LOG_LEVEL`.
 */
const INVALID_LOG_LEVEL_VALUE = LOG_LEVEL.UNKNOWN - 1;

/**
 * Key names in enum `LOG_LEVEL`.
 */
const LOG_LEVEL_NAMES = Object.freeze(
    Object.values(LOG_LEVEL).filter((value) => "string" === typeof value)
) as ReadonlyArray<keyof typeof LOG_LEVEL>;

/**
 * Values in enum `LOG_LEVEL`.
 */
const LOG_LEVEL_VALUES = Object.freeze(
    Object.values(LOG_LEVEL).filter((value) => "number" === typeof value)
);

const MAX_LOG_LEVEL = Math.max(...LOG_LEVEL_VALUES);

const INVALID_TIMESTAMP_VALUE = 0;

export {
    INVALID_LOG_LEVEL_VALUE,
    INVALID_TIMESTAMP_VALUE,
    LOG_LEVEL,
    LOG_LEVEL_NAMES,
    MAX_LOG_LEVEL,
};
