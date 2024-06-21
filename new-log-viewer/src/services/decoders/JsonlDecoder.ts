import {
    Decoder,
    DecodeResultType,
    JsonlDecodeOptionsType,
} from "../../typings/decoders";
import {Formatter} from "../../typings/formatters";
import {JsonObject} from "../../typings/js";
import {LOG_LEVEL} from "../../typings/logs";
import LogbackFormatter from "../formatters/LogbackFormatter";


class JsonlDecoder implements Decoder {
    static #textDecoder = new TextDecoder();

    readonly #dataArray: Uint8Array;

    #logLevelKey: string = "level";

    #logEvents: JsonObject[] = [];

    #formatter: Formatter | null = null;

    constructor (dataArray: Uint8Array | number, length?: number) {
        if ("number" === typeof dataArray || "undefined" !== typeof length) {
            throw new Error("Loading via array pointer is not supported in non-Emscripten " +
                "compiled decoders");
        }
        this.#dataArray = dataArray;
    }

    /**
     * Sets the decode options for the decoder to understand the JSON structure.
     *
     * @param options The options for decoding the JSONL log data.
     * @return Whether the options were successfully set.
     */
    setDecodeOptions (options: JsonlDecodeOptionsType): boolean {
        this.#formatter = new LogbackFormatter(options);
        this.#logLevelKey = options.logLevelKey;

        return true;
    }

    /**
     * Builds an index by decoding the data array and splitting it into lines.
     * Each line is parsed as a JSON object and added to the log events array.
     * If a line cannot be parsed as a JSON object, an error is logged and the line is skipped.
     *
     * @return The number of log events in the file.
     */
    buildIdx (): number {
        const text = JsonlDecoder.#textDecoder.decode(this.#dataArray);
        const split = text.split("\n");
        for (const line of split) {
            if (0 === line.length) {
                continue;
            }

            try {
                const logEvent = JSON.parse(line) as JsonObject;
                this.#logEvents.push(logEvent);
            } catch (e) {
                console.error(e, line);
            }
        }

        return this.#logEvents.length;
    }

    /**
     * Decodes log events from the #logEvents array and adds them to the results array.
     *
     * @param startIdx The index in the #logEvents array at which to start decoding.
     * @param endIdx The index in the #logEvents array at which to stop decoding.
     * @return True if the decoding was successful, false otherwise.
     * @throws {Error} if setDecodeOptions() was not invoked before calling this.
     */
    decode (startIdx: number, endIdx: number): DecodeResultType[] | null {
        if (null === this.#formatter) {
            throw new Error("Please setDecodeOptions() to init the formatter.");
        }

        const results: DecodeResultType[] = [];
        for (let logEventIdx = startIdx; logEventIdx < endIdx; logEventIdx++) {
            const logEvent = this.#logEvents[logEventIdx];
            if ("undefined" === typeof logEvent) {
                return null;
            }
            const [timestamp, formatted] = this.#formatter.formatLogEvent(logEvent);
            const logLevel = this.#extractLogLevel(logEvent);
            results.push([
                formatted,
                timestamp,
                logLevel,
                logEventIdx + 1,
            ]);
        }

        return results;
    }

    /**
     * Extracts the log level from the given log event.
     *
     * @param logEvent The log event containing the log level.
     * @return The extracted log level.
     */
    #extractLogLevel (logEvent: JsonObject): number {
        let logLevel = LOG_LEVEL.NONE;
        const logLevelStr: string = logEvent[this.#logLevelKey] as string;
        if (false === (logLevelStr in LOG_LEVEL)) {
            console.error(`Unable to find log level from key ${this.#logLevelKey}` +
                ` of type ${typeof logLevelStr}`);
        } else {
            logLevel = LOG_LEVEL[logLevelStr as (keyof typeof LOG_LEVEL)];
        }

        return logLevel;
    }
}

export default JsonlDecoder;
