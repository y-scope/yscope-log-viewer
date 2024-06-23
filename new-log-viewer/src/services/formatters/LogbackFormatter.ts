import dayjs from "dayjs";

import {
    FormatOptionsType,
    Formatter,
    TimestampAndMessageType,
} from "../../typings/formatters";
import {JsonObject} from "../../typings/js";
import {INVALID_TIMESTAMP_VALUE} from "../../typings/logs";


/**
 * Converts a Logback date format string to a Day.js date format string.
 *
 * @param dateFormat The Logback date format string to convert.
 * @return The corresponding Day.js date format string.
 */
const convertLogbackDateFormatToDayjs = (dateFormat: string): string => {
    dateFormat = dateFormat.replace("yyyy", "YYYY");
    dateFormat = dateFormat.replace("yy", "YY");
    dateFormat = dateFormat.replace("dd", "D");
    dateFormat = dateFormat.replace("d", "D");

    return dateFormat;
};

class LogbackFormatter implements Formatter {
    #formatString: string =
        "%d{yyyy-MM-dd HH:mm:ss.SSS} [%process.thread.name] %log.level %message%n";

    #datePattern: string = "%d{yyyy-MM-dd HH:mm:ss.SSS}";

    #dateFormat: string = "YYYY-MM-DD HH:mm:ss.SSS ZZ";

    #timestampKey: string = "ts";

    #keys: string[] = [];

    constructor (options: FormatOptionsType) {
        this.#formatString = options.formatString;
        this.#timestampKey = options.timestampKey;

        // Remove new line
        this.#formatString = this.#formatString.replace("%n", "");

        this.#extractDateFormat();
        this.#extractKeys();
    }

    /**
     * Formats the log event based on the provided log event object.
     *
     * @param logEvent The log event object to be formatted.
     * @return An array containing the formatted log event timestamp and message.
     */
    formatLogEvent (logEvent: JsonObject): TimestampAndMessageType {
        const input = this.#formatString;
        let [timestamp, formatted] = this.#extractAndFormatTimestamp(input, logEvent);
        formatted = this.#formatVariables(formatted, logEvent);

        return [
            timestamp,
            formatted,
        ];
    }

    /**
     * Extracts date format from the format string and converts that into a Day.js compatible one.
     */
    #extractDateFormat () {
        const dateFormatMatch = this.#formatString.match(/%d\{(.+?)}/);
        if (null === dateFormatMatch) {
            console.warn("Unable to find date format string in #formatString:", this.#formatString);

            return;
        }

        // e.g. "%d{yyyy-MM-dd HH:mm:ss.SSS}", "yyyy-MM-dd HH:mm:ss.SSS"
        const [pattern, dateFormat] = dateFormatMatch;
        this.#datePattern = pattern;
        if ("undefined" === typeof dateFormat) {
            console.error("Unexpected undefined dateFormat");

            return;
        }

        this.#dateFormat = convertLogbackDateFormatToDayjs(dateFormat);
    }

    /**
     * Extracts all placeholders (expected LogEvent keys) in the format string with a regular
     * expression.
     */
    #extractKeys () {
        const placeholderRegex = /%([\w.]+)/g;
        let match;
        while (null !== (match = placeholderRegex.exec(this.#formatString))) {
            // e.g., "%thread", "thread"
            const [, propName] = match;
            if ("undefined" !== typeof propName) {
                this.#keys.push(propName);
            }
        }
    }

    /**
     * Extracts the timestamp from the log event and formats the input string with it.
     *
     * @param input The input string to format.
     * @param logEvent The log event containing the timestamp.
     * @return An array containing the extracted timestamp and the formatted input string.
     */
    #extractAndFormatTimestamp (input: string, logEvent: JsonObject): [number, string] {
        let timestamp = logEvent[this.#timestampKey];
        if ("number" !== typeof timestamp && "string" !== typeof timestamp) {
            timestamp = INVALID_TIMESTAMP_VALUE;
        }
        const dayjsObj = dayjs.utc(timestamp);
        const formattedDate = dayjsObj.format(this.#dateFormat);
        input = input.replace(this.#datePattern, formattedDate);

        return [
            dayjsObj.valueOf(),
            input,
        ];
    }

    /**
     * Replaces placeholders in the input string with corresponding properties from the logEvent
     * object.
     *
     * @param input The input string with placeholders to be replaced.
     * @param logEvent The log event object containing properties to replace the placeholders.
     * @return - The input string with placeholders replaced by corresponding property values.
     */
    #formatVariables (input: string, logEvent: JsonObject): string {
        for (const propName of this.#keys) {
            if (false === (propName in logEvent)) {
                continue;
            }
            const placeholder = `%${propName}`;
            const propValue = logEvent[propName];
            const propValueString = "object" === typeof propValue ?
                JSON.stringify(propValue) :
                String(propValue);

            input = input.replace(placeholder, propValueString);
        }

        return `${input}\n`;
    }
}

export default LogbackFormatter;