import dayjs from "dayjs";

import {
    DecodeResultType,
    Decoders,
    JsonlDecodeOptionsType,
} from "../../typings/decoders";
import {
    INVALID_TIMESTAMP_VALUE,
    LOG_LEVEL,
} from "../../typings/logs";


/**
 * Type of values in JSON structures.
 * Reference: https://www.json.org/json-en.html
 */
type JsonValue = string |
    number |
    boolean |
    { [key: string]: JsonValue | null } |
    Array<JsonValue | null>;

/**
 * Type of JSON object structure, which is a collection of name/value pairs.
 * Reference: https://www.json.org/json-en.html
 */
type JsonObject = { [key: string]: JsonValue | null };

class JsonlDecoder implements Decoders {
    static TEXT_DECODER = new TextDecoder();

    readonly #dataArray: Uint8Array;

    #logEvents: JsonObject[] = [];

    #textPattern: string =
        "%d{yyyy-MM-dd HH:mm:ss.SSS} [%process.thread.name] %log.level %message%n";

    #datePattern: string = "%d{yyyy-MM-dd HH:mm:ss.SSS}";

    #dateFormat: string = "YYYY-MM-DD HH:mm:ss.SSS ZZ";

    #timestampKey: string = "ts";

    #logLevelKey: string = "level";

    #keys: string[] = [];

    /**
     * Converts a logback date format to a Day.js date format.
     *
     * @param {string} dateFormat The date format to convert.
     * @return {string} with year, month and day capitalized
     * @private
     */
    static #convertLogbackDateFormatToDayjs (dateFormat: string) {
        // Fix year
        dateFormat = dateFormat.replace("yyyy", "YYYY");
        dateFormat = dateFormat.replace("yy", "YY");

        // Fix day
        dateFormat = dateFormat.replace("dd", "D");
        dateFormat = dateFormat.replace("d", "D");

        return dateFormat;
    }

    /**
     * Extracts date format from text, eventually in Dayjs form.
     *
     * @return {string} in Dayjs form.
     * @private
     */
    #extractDateFormat () {
        // Extract date format from text string
        const dateFormatMatch = this.#textPattern.match(/%d\{(.+?)}/);
        if (null === dateFormatMatch) {
            console.warn(
                "Unable to find date format string in #textPattern:",
    /**
    * Sets the text pattern for the decoder and extracts the date format and property names from it.
    *
    * @param {string} pattern - The text pattern to set for the decoder.
    * @return {void}
    */
    #setTextPattern (pattern: string) {
            );

            return;
        }

        // e.g. "%d{yyyy-MM-dd HH:mm:ss.SSS}", "yyyy-MM-dd HH:mm:ss.SSS"
        const [pattern, dateFormat] = dateFormatMatch;
        this.#datePattern = pattern;
        if ("undefined" === typeof dateFormat) {
            console.error("Unexpected undefined dateFormat");

            return;
        }

        this.#dateFormat = JsonlDecoder.#convertLogbackDateFormatToDayjs(dateFormat);
    }

    #setTextPattern (pattern: string) {
        this.#textPattern = pattern;
        this.#extractDateFormat();

        // Remove new line
        this.#textPattern = this.#textPattern.replace("%n", "");

        // Use a regular expression to find all placeholders
        const placeholderRegex = /%([\w.]+)/g;
        let match;
        while (null !== (match = placeholderRegex.exec(this.#textPattern))) {
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
     * @return - An array containing the extracted timestamp and the formatted input string .
     */
    #extractAndFormatTimestamp (input: string, logEvent: JsonObject): [number, string] {
        let timestamp = logEvent[this.#timestampKey];
        if ("number" !== typeof timestamp && "string" !== typeof timestamp) {
            timestamp = INVALID_TIMESTAMP_VALUE;
        }
        const dayjsObj: dayjs.Dayjs = dayjs.utc(timestamp);
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
     * @private
     */
    #formatVariables (input: string, logEvent: JsonObject) {
        // Replace each placeholder with the corresponding property from logEvent
        for (const propName of this.#keys) {
            if (propName in logEvent) {
                const placeholder = `%${propName}`;
                const propValue = logEvent[propName];
                let propValueString: string;
                if ("undefined" === typeof propValue || null === propValue) {
                    console.error(`Unexpected undefined logEvent[${propName}]`);
                    propValueString = "undefined";
                } else if ("object" === typeof propValue) {
                    propValueString = JSON.stringify(propValue);
                } else {
                    propValueString = propValue.toString();
                }
                input = input.replace(placeholder, propValueString);
            }
        }

        input += "\n";

        return input;
    }

    /**
     * Extracts the log level from the given log event.
     *
     * @param logEvent The log event containing the log level.
     * @return The extracted log level.
     */
    #extractLogLevel (logEvent: JsonObject) {
        let logLevel = LOG_LEVEL.NONE;
        const logLevelStr: string = logEvent[this.#logLevelKey] as string;
        if (false === (logLevelStr in LOG_LEVEL)) {
            console.error(`Unable to find log level from key ${this.#logLevelKey}` +
                ` of type ${typeof logLevelStr}`);
        } else {
            logLevel = LOG_LEVEL[logLevelStr as (keyof typeof LOG_LEVEL)];
        }
    /**
    * Builds an index by decoding the data array and splitting it into lines.
    * Each line is parsed as a JSON object and added to the log events array.
    * If a line cannot be parsed as a JSON object, an error is logged and the line is skipped.
    *
    * @return {number} The number of log events in the log events array after building the index.
    */
    buildIdx (): number {
        return logLevel;
    }

    constructor (dataArray: Uint8Array | number, length?: number) {
        if ("number" === typeof dataArray || "undefined" !== typeof length) {
            throw new Error(":Loading via array pointer is not supported in non-Emscripten " +
                "compiled decoders");
        }
        this.#dataArray = dataArray;
    }

    setDecodeOptions (options: JsonlDecodeOptionsType): boolean {
        this.#setTextPattern(
            options.textPattern
        );
        this.#timestampKey = options.timestampKey;
        this.#logLevelKey = options.logLevelKey;

        return true;
    }

    buildIdx (): number {
        const text = JsonlDecoder.TEXT_DECODER.decode(this.#dataArray);
        const split = text.split("\n");
        for (const line of split) {
            if (0 === line.length) {
                continue;
            }

            try {
                const logEvent = JSON.parse(line) as JsonObject;
                this.#logEvents.push(logEvent);
            } catch (e) {
                if (e instanceof SyntaxError) {
                    console.error(e, line);
                }
            }
        }

        return this.#logEvents.length;
    }

    decode (results: DecodeResultType[], startIdx: number, endIdx: number): boolean {
        console.assert(0 === results.length, "results array is non-empty");

        for (let logEventIdx = startIdx; logEventIdx < endIdx; logEventIdx++) {
            const logEvent = this.#logEvents[logEventIdx];
            if ("undefined" === typeof logEvent) {
                return false;
            }

            let [timestamp, formatted] =
                this.#extractAndFormatTimestamp(this.#textPattern, logEvent);

            formatted = this.#formatVariables(formatted, logEvent);
            const logLevel = this.#extractLogLevel(logEvent);

            results.push([
                formatted,
                timestamp,
                logLevel,
                logEventIdx + 1,
            ]);
        }

        return true;
    }
}

export default JsonlDecoder;
