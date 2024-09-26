import dayjs, {Dayjs} from "dayjs";
import utc from "dayjs/plugin/utc";

import {
    JsonObject,
    JsonValue,
} from "../../../typings/js";
import {
    INVALID_TIMESTAMP_VALUE,
    LOG_LEVEL,
} from "../../../typings/logs";


// eslint-disable-next-line import/no-named-as-default-member
dayjs.extend(utc);

/**
 * A log event parsed from a JSON log.
 */
interface JsonLogEvent {
    timestamp: Dayjs,
    level: LOG_LEVEL,
    fields: JsonObject
}

/**
 * Narrows input to JsonObject if valid type.
 * Reference: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
 *
 * @param fields
 * @return Whether type is JsonObject.
 */
const isJsonObject = (fields: JsonValue): fields is JsonObject => {
    return "object" === typeof fields;
};

/**
 * Maps the log level field to a log level value.
 *
 * @param logLevelField Field in log event indexed by log level key.
 * @return Log level value.
 */
const parseLogLevel = (logLevelField: JsonValue | undefined): number => {
    let logLevelValue = LOG_LEVEL.NONE;

    if ("undefined" === typeof logLevelField) {
        return logLevelValue;
    }

    const logLevelName = "object" === typeof logLevelField ?
        JSON.stringify(logLevelField) :
        String(logLevelField);

    if (logLevelName.toUpperCase() in LOG_LEVEL) {
        logLevelValue = LOG_LEVEL[logLevelName.toUpperCase() as keyof typeof LOG_LEVEL];
    }

    return logLevelValue;
};

/**
 * Parses timestamp field in log event into dayjs timestamp.
 *
 * @param timestampField
 * @return The timestamp or `INVALID_TIMESTAMP_VALUE` if:
 * 1. the timestamp key doesn't exist in the log
 * 2. the timestamp's value is an unsupported type
 * 3. the timestamp's value is not a valid dayjs timestamp
 */
const parseTimestamp = (timestampField: JsonValue | undefined): dayjs.Dayjs => {
    // If the field is an invalid type, then set the timestamp to `INVALID_TIMESTAMP_VALUE`.
    if (("string" !== typeof timestampField &&
        "number" !== typeof timestampField) ||

        // Dayjs library surprisingly thinks undefined is valid date...
        // Reference: https://day.js.org/docs/en/parse/now#docsNav
        "undefined" === typeof timestampField
    ) {
        // `INVALID_TIMESTAMP_VALUE` is a valid dayjs date. Another potential option is
        // `daysjs(null)` to show `Invalid Date` in UI.
        timestampField = INVALID_TIMESTAMP_VALUE;
    }

    const dayjsTimestamp: Dayjs = dayjs.utc(timestampField);

    // Note if input is not valid (ex. timestampField = "deadbeef"), this can produce a
    // non-valid timestamp and will show up in UI as `Invalid Date`. Current behaviour is to
    // modify invalid dates to `INVALID_TIMESTAMP_VALUE`.
    if (false === dayjsTimestamp.isValid()) {
        dayjsTimestamp = dayjs.utc(INVALID_TIMESTAMP_VALUE);
    }

    return dayjsTimestamp;
};
export {
    isJsonObject,
    parseLogLevel,
    parseTimestamp,
};
export type {JsonLogEvent};
