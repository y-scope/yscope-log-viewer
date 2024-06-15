import dayjs from "dayjs";

import {JsonlDecodeOptionsType} from "../../typings/decoders";
import {
    INVALID_TIMESTAMP_VALUE,
    LOG_VERBOSITY,
} from "../../typings/logs";
import {
    Decoder,
    DecodeResultType,
} from "./Decoder";


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

class JsonlDecoder implements Decoder {
    static TEXT_DECODER = new TextDecoder();

    readonly #dataArray: Uint8Array;

    #logEvents: JsonObject[] = [];

    #textPattern: string =
        "%d{yyyy-MM-dd HH:mm:ss.SSS} [%process.thread.name] %log.level %message%n";

    #datePattern: string = "%d{yyyy-MM-dd HH:mm:ss.SSS}";

    #dateFormat: string = "YYYY-MM-DD HH:mm:ss.SSS ZZ";

    #timestampPropName: string = "ts";

    #verbosityPropName: string = "level";

    #propertyNames: string[] = [];

    static #convertLogbackDateFormatToDayjs (dateFormat: string) {
        // Fix year
        dateFormat = dateFormat.replace("yyyy", "YYYY");
        dateFormat = dateFormat.replace("yy", "YY");

        // Fix day
        dateFormat = dateFormat.replace("dd", "D");
        dateFormat = dateFormat.replace("d", "D");

        return dateFormat;
    }

    #extractDateFormat () {
        // Extract date format from text string
        const dateFormatMatch = this.#textPattern.match(/%d\{(.+?)}/);
        if (null === dateFormatMatch) {
            console.warn(
                "Unable to find date format string in #textPattern:",
                this.#textPattern
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
                this.#propertyNames.push(propName);
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
        let timestamp = logEvent[this.#timestampPropName];
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
        for (const propName of this.#propertyNames) {
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
     * Extracts the verbosity from the given log event.
     *
     * @param logEvent The log event containing the verbosity.
     * @return The extracted verbosity.
     */
    #extractVerbosity (logEvent: JsonObject) {
        let verbosity = LOG_VERBOSITY.NONE;
        const verbosityString: string = logEvent[this.#verbosityPropName] as string;
        if (false === (verbosityString in LOG_VERBOSITY)) {
            console.error(`Unable to find verbosity from key ${this.#verbosityPropName}` +
                ` of type ${typeof verbosityString}`);
        } else {
            verbosity = LOG_VERBOSITY[verbosityString as (keyof typeof LOG_VERBOSITY)];
        }

        return verbosity;
    }

    constructor (dataArray: Uint8Array) {
        this.#dataArray = dataArray;
    }

    setDecodeOptions (options: JsonlDecodeOptionsType): boolean {
        this.#setTextPattern(
            options.textPattern
        );
        this.#timestampPropName = options.timestampPropName;
        this.#verbosityPropName = options.verbosityPropName;

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
            const verbosity = this.#extractVerbosity(logEvent);

            results.push([
                formatted,
                timestamp,
                verbosity,
                logEventIdx + 1,
            ]);
        }

        return true;
    }
}

export default JsonlDecoder;
