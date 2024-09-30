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

interface JsonLogEvent {
    timestamp: Dayjs,
    level: LOG_LEVEL,
    fields: JsonObject
}

/**
 * Determines whether the given value is a `JsonObject` and applies a TypeScript narrowing
 * conversion if so.
 *
 * Reference: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
 *
 * @param fields
 * @return A TypeScript type predicate indicating whether `fields` is a `JsonObject`.
 */
const isJsonObject = (fields: JsonValue): fields is JsonObject => {
    return "object" === typeof fields && null !== fields;
};

/**
 * Converts a field into a log level if possible.
 *
 * @param logLevelField
 * @return The log level or `LOG_LEVEL.NONE` if the field couldn't be converted.
 */
const convertToLogLevelValue = (logLevelField: JsonValue | undefined): LOG_LEVEL => {
    let logLevelValue = LOG_LEVEL.NONE;

    if ("undefined" === typeof logLevelField) {
        return logLevelValue;
    }

    const logLevelName = "object" === typeof logLevelField ?
        JSON.stringify(logLevelField) :
        String(logLevelField);

    const uppercaseLogLevelName = logLevelName.toUpperCase();
    if (uppercaseLogLevelName in LOG_LEVEL) {
        logLevelValue = LOG_LEVEL[uppercaseLogLevelName as keyof typeof LOG_LEVEL];
    }

    return logLevelValue;
};

/**
 * Converts a field into a dayjs timestamp if possible.
 *
 * @param timestampField
 * @return The field as a dayjs timestamp or `dayjs.utc(INVALID_TIMESTAMP_VALUE)` if:
 * - the timestamp key doesn't exist in the log.
 * - the timestamp's value is an unsupported type.
 * - the timestamp's value is not a valid dayjs timestamp.
 */
const convertToDayjsTimestamp = (timestampField: JsonValue | undefined): dayjs.Dayjs => {
    // If the field is an invalid type, then set the timestamp to `INVALID_TIMESTAMP_VALUE`.
    if (("string" !== typeof timestampField &&
        "number" !== typeof timestampField) ||

        // dayjs surprisingly thinks `undefined` is a valid date:
        // https://day.js.org/docs/en/parse/now#docsNav
        "undefined" === typeof timestampField
    ) {
        // `INVALID_TIMESTAMP_VALUE` is a valid dayjs date. Another potential option is
        // `dayjs(null)` to show "Invalid Date" in the UI.
        timestampField = INVALID_TIMESTAMP_VALUE;
    }

    let dayjsTimestamp: Dayjs = dayjs.utc(timestampField);

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
export type {JsonLogEvent};
