import dayjs from "dayjs";

import {Nullable} from "../../typings/common";
import {
    Formatter,
    FormatterOptionsType,
    TimestampAndMessageType,
} from "../../typings/formatters";
import {JsonObject} from "../../typings/js";
import {INVALID_TIMESTAMP_VALUE} from "../../typings/logs";


/**
 * Converts a *simple* java.time.format.DateTimeFormatter pattern to a Day.js date format string.
 *
 * NOTE: This method doesn't handle all possible patterns. Check the implementation to determine
 * what's supported.
 *
 * @param pattern
 * @return The corresponding Day.js date format string.
 */
const convertDateTimeFormatterPatternToDayJs = (pattern: string): string => {
    pattern = pattern.replace("yyyy", "YYYY");
    pattern = pattern.replace("yy", "YY");
    pattern = pattern.replace("dd", "D");
    pattern = pattern.replace("d", "D");

    return pattern;
};

/**
 * A formatter that uses a Logback-like format string to format log events into a string. See
 * `LogbackFormatterOptionsType` for details about the format string.
 */
class LogbackFormatter implements Formatter {
    #formatString: string;

    #datePattern: Nullable<string> = null;

    #dateFormat: string = "";

    #timestampKey: string;

    #keys: string[] = [];

    constructor (options: FormatterOptionsType) {
        // NOTE: It's safe for these values to be empty strings.
        this.#formatString = options.formatString;
        this.#timestampKey = options.timestampKey;

        // Remove new line
        this.#formatString = this.#formatString.replace("%n", "");

        this.#parseDateFormat();
        this.#parseKeys();
    }

    /**
     * Formats the given log event.
     *
     * @param logEvent
     * @return The log event's timestamp and the formatted string.
     */
    formatLogEvent (logEvent: JsonObject): TimestampAndMessageType {
        const timestamp = this.#parseTimestamp(logEvent);
        let formatted = this.#formatTimestamp(timestamp, this.#formatString);
        formatted = this.#formatVariables(formatted, logEvent);

        return {
            timestamp: timestamp.valueOf(),
            message: formatted,
        };
    }

    /**
     * Parses the timestamp specifier from the format string and converts the date pattern into a
     * Day.js-compatible one.
     */
    #parseDateFormat () {
        const dateFormatMatch = this.#formatString.match(/%d\{(.+?)}/);
        if (null === dateFormatMatch) {
            console.warn("Unable to find date format string in #formatString:", this.#formatString);

            return;
        }

        // E.g. "%d{yyyy-MM-dd HH:mm:ss.SSS}", "yyyy-MM-dd HH:mm:ss.SSS"
        // Explicit cast since typescript thinks `dateFormat` can be undefined, but it can't be
        // since the pattern contains a capture group.
        const [pattern, dateFormat] =
            <[pattern: RegExpMatchArray[0], dateFormat: string]>dateFormatMatch;

        this.#datePattern = pattern;

        this.#dateFormat = convertDateTimeFormatterPatternToDayJs(dateFormat);
    }

    /**
     * Parses all non-Logback specifiers (expected log event keys) from the format string.
     */
    #parseKeys () {
        const specifierRegex = /%([\w.]+)/g;
        for (const match of this.#formatString.matchAll(specifierRegex)) {
            // E.g., "%thread", "thread"
            const [, key] = match;

            // Explicit cast since typescript thinks `key` can be undefined, but it can't be
            // since the pattern contains a capture group.
            this.#keys.push(key as string);
        }
    }

    /**
     * Gets the timestamp from the log event.
     *
     * @param logEvent
     * @return The timestamp or `INVALID_TIMESTAMP_VALUE` if:
     * - the timestamp key doesn't exist in the log, or
     * - the timestamp's value is not a number.
     */
    #parseTimestamp (logEvent: JsonObject): dayjs.Dayjs {
        let timestamp = logEvent[this.#timestampKey];
        if ("number" !== typeof timestamp && "string" !== typeof timestamp) {
            timestamp = INVALID_TIMESTAMP_VALUE;
        }

        return dayjs.utc(timestamp);
    }

    /**
     * Replaces the timestamp specifier in `formatString` with `timestamp`, formatted with
     * `#dateFormat`.
     *
     * @param timestamp
     * @param formatString
     * @return The formatted string.
     */
    #formatTimestamp (timestamp: dayjs.Dayjs, formatString: string): string {
        if (null === this.#datePattern) {
            return formatString;
        }

        const formattedDate = timestamp.format(this.#dateFormat);
        formatString = formatString.replace(this.#datePattern, formattedDate);

        return formatString;
    }

    /**
     * Replaces format specifiers in `formatString` with the corresponding kv-pairs from `logEvent`.
     *
     * @param formatString
     * @param logEvent
     * @return The formatted string.
     */
    #formatVariables (formatString: string, logEvent: JsonObject): string {
        // TODO These don't handle the case where a variable value may contain a '%' itself
        for (const key of this.#keys) {
            if (false === (key in logEvent)) {
                continue;
            }
            const specifier = `%${key}`;
            const value = logEvent[key];
            const valueStr = "object" === typeof value ?
                JSON.stringify(value) :
                String(value);

            formatString = formatString.replace(specifier, valueStr);
        }

        return `${formatString}\n`;
    }
}

export default LogbackFormatter;
