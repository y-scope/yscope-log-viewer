import {
    Decoder,
    DecodeResultType,
    JsonlDecoderOptionsType,
} from "../../typings/decoders";
import {Formatter} from "../../typings/formatters";
import {JsonObject} from "../../typings/js";
import {LOG_LEVEL} from "../../typings/logs";
import LogbackFormatter from "../formatters/LogbackFormatter";


/**
 * A decoder for JSONL (JSON lines) files that contain log events. See `JsonlDecodeOptionsType` for
 * properties that are specific to log events (compared to generic JSON records).
 */
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

    setDecoderOptions (options: JsonlDecoderOptionsType): boolean {
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
     * Decodes the log events in the range `[beginIdx, endIdx)`.
     *
     * @param beginIdx
     * @param endIdx
     * @return The decoded log events on success, null otherwise.
     * @throws {Error} if setDecodeOptions() was not invoked before calling this.
     */
    decode (beginIdx: number, endIdx: number): DecodeResultType[] | null {
        if (null === this.#formatter) {
            throw new Error("Please setDecoderOptions() to init the formatter.");
        }

        const results: DecodeResultType[] = [];
        for (let logEventIdx = beginIdx; logEventIdx < endIdx; logEventIdx++) {
            const logEvent = this.#logEvents[logEventIdx];
            if ("undefined" === typeof logEvent) {
                return null;
            }
            const [timestamp, formatted] = this.#formatter.formatLogEvent(logEvent);
            const logLevel = this.#parseLogLevel(logEvent);
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
     * Parses the log level from the given log event.
     *
     * @param logEvent
     * @return The parsed log level.
     */
    #parseLogLevel (logEvent: JsonObject): number {
        let logLevel = LOG_LEVEL.NONE;

        const parsedLogLevel = logEvent[this.#logLevelKey];
        if ("undefined" === typeof parsedLogLevel) {
            console.error(`${this.#logLevelKey} doesn't exist in log event.`);

            return logLevel;
        }

        const logLevelStr = "object" === typeof parsedLogLevel ?
            JSON.stringify(parsedLogLevel) :
            String(parsedLogLevel);
        if (false === (logLevelStr.toUpperCase() in LOG_LEVEL)) {
            console.error(`${logLevelStr} doesn't match any known log level.`);
        } else {
            logLevel = LOG_LEVEL[logLevelStr as (keyof typeof LOG_LEVEL)];
        }

        return logLevel;
    }
}

export default JsonlDecoder;
