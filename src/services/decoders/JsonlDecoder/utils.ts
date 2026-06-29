import dayjs, {Dayjs} from "dayjs";

import {
    JsonObject,
    JsonValue,
} from "../../../typings/js";
import {
    INVALID_TIMESTAMP_VALUE,
    LOG_LEVEL,
} from "../../../typings/logs";


// Timestamp resolution detection thresholds
const TIMESTAMP_THRESHOLD_SECONDS = 1e11;
const TIMESTAMP_THRESHOLD_MILLISECONDS = 1e14;
const TIMESTAMP_THRESHOLD_MICROSECONDS = 1e17;

// Conversion factors to milliseconds
const MILLISECONDS_PER_SECOND = 1000;
const MILLISECONDS_PER_MICROSECOND = 1000;
const MILLISECONDS_PER_NANOSECOND = 1e6;
const NANOSECONDS_PER_MILLISECOND = 1000000n;


/**
 * Determines whether the given value is a `JsonObject` and applies a TypeScript narrowing
 * conversion if so.
 *
 * @param value
 * @return A TypeScript type predicate indicating whether `value` is a `JsonObject`.
 */
const isJsonObject = (value: JsonValue): value is JsonObject => {
    return "object" === typeof value && null !== value && false === Array.isArray(value);
};

/**
 * Converts a field into a log level if possible.
 *
 * @param field
 * @return The log level or `LOG_LEVEL.UNKNOWN` if the field couldn't be converted.
 */
const convertToLogLevelValue = (field: JsonValue | undefined): LOG_LEVEL => {
    let logLevelValue = LOG_LEVEL.UNKNOWN;

    if ("undefined" === typeof field || isJsonObject(field)) {
        return logLevelValue;
    }

    const logLevelName = "string" === typeof field ?
        field :
        "";

    const uppercaseLogLevelName = logLevelName.toUpperCase();
    if (uppercaseLogLevelName in LOG_LEVEL) {
        logLevelValue = LOG_LEVEL[uppercaseLogLevelName as keyof typeof LOG_LEVEL];
    }

    return logLevelValue;
};

/**
 * Converts a field into a dayjs timestamp if possible.
 *
 * @param field
 * @return The field as a dayjs timestamp or `dayjs.utc(INVALID_TIMESTAMP_VALUE)` if:
 * - the timestamp key doesn't exist in the log.
 * - the timestamp's value is an unsupported type.
 * - the timestamp's value is not a valid dayjs timestamp.
 */
const convertToDayjsTimestamp = (field: JsonValue | bigint | undefined): dayjs.Dayjs => {
    // If the field is an invalid type, then set the timestamp to `INVALID_TIMESTAMP_VALUE`.
    // NOTE: dayjs surprisingly thinks `undefined` is a valid date. See
    // https://day.js.org/docs/en/parse/now#docsNav
    if (("string" !== typeof field &&
        "number" !== typeof field &&
        "bigint" !== typeof field) ||
        "undefined" === typeof field
    ) {
        // `INVALID_TIMESTAMP_VALUE` is a valid dayjs date. Another potential option is
        // `dayjs(null)` to show "Invalid Date" in the UI.
        field = INVALID_TIMESTAMP_VALUE;
    }

    let timestampInMs: number | string = field;

    // Auto-detect timestamp resolution and convert to milliseconds
    if ("number" === typeof field || "bigint" === typeof field) {
        const numValue = "bigint" === typeof field
            ? Number(field)
            : field;

        // Detection based on timestamp magnitude:
        // - Seconds: < 10^11 (covers dates up to year 5138)
        // - Milliseconds: 10^11 <= t < 10^14
        // - Microseconds: 10^14 <= t < 10^17
        // - Nanoseconds: >= 10^17
        if (numValue < TIMESTAMP_THRESHOLD_SECONDS && numValue >= 0) {
            // Seconds -> convert to milliseconds
            timestampInMs = numValue * MILLISECONDS_PER_SECOND;
        } else if (numValue < TIMESTAMP_THRESHOLD_MILLISECONDS) {
            // Milliseconds -> use as-is
            timestampInMs = numValue;
        } else if (numValue < TIMESTAMP_THRESHOLD_MICROSECONDS) {
            // Microseconds -> convert to milliseconds
            timestampInMs = numValue / MILLISECONDS_PER_MICROSECOND;
        } else {
            // Nanoseconds -> convert to milliseconds
            // For bigint, perform division before converting to avoid precision loss
            timestampInMs = "bigint" === typeof field
                ? Number(field / NANOSECONDS_PER_MILLISECOND)
                : numValue / MILLISECONDS_PER_NANOSECOND;
        }
    }

    // dayjs.utc() expects millisecond input
    let dayjsTimestamp: Dayjs = dayjs.utc(timestampInMs);

    // Sanitize invalid (e.g., "deadbeef") timestamps to `INVALID_TIMESTAMP_VALUE`; otherwise
    // they'll show up in UI as "Invalid Date".
    if (false === dayjsTimestamp.isValid()) {
        dayjsTimestamp = dayjs.utc(INVALID_TIMESTAMP_VALUE);
    }

    return dayjsTimestamp;
};
export {
    convertToDayjsTimestamp,
    convertToLogLevelValue,
    isJsonObject,
};
