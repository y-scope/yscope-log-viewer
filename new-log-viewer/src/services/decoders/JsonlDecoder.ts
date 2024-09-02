import {Nullable} from "../../typings/common";
import {
    Decoder,
    DecodeResultType,
    JsonlDecoderOptionsType,
    LogEventCount,
} from "../../typings/decoders";
import {Formatter} from "../../typings/formatters";
import {
    JsonObject,
    JsonValue,
} from "../../typings/js";
import {
    INVALID_TIMESTAMP_VALUE,
    LOG_LEVEL,
} from "../../typings/logs";
import LogbackFormatter from "../formatters/LogbackFormatter";


/**
 * A decoder for JSONL (JSON lines) files that contain log events. See `JsonlDecodeOptionsType` for
 * properties that are specific to log events (compared to generic JSON records).
 */
class JsonlDecoder implements Decoder {
    static #textDecoder = new TextDecoder();

    #logLevelKey: string = "level";

    #logEvents: JsonObject[] = [];

    #invalidLogEventIdxToRawLine: Map<number, string> = new Map();

    // @ts-expect-error #fomatter is set in the constructor by `setDecoderOptions()`
    #formatter: Formatter;

    /**
     * @param dataArray
     * @param decoderOptions
     * @throws {Error} if the initial decoder options are erroneous.
     */
    constructor (dataArray: Uint8Array, decoderOptions: JsonlDecoderOptionsType) {
        const isOptionSet = this.setDecoderOptions(decoderOptions);
        if (false === isOptionSet) {
            throw new Error(
                `Initial decoder options are erroneous: ${JSON.stringify(decoderOptions)}`
            );
        }
        this.#deserialize(dataArray);
    }

    getEstimatedNumEvents (): number {
        return this.#logEvents.length;
    }

    buildIdx (beginIdx: number, endIdx: number): Nullable<LogEventCount> {
        // This method is a dummy implementation since the actual deserialization is done in the
        // constructor.

        if (0 > beginIdx || this.#logEvents.length < endIdx) {
            return null;
        }

        const numInvalidEvents = Array.from(this.#invalidLogEventIdxToRawLine.keys())
            .filter((eventIdx) => (beginIdx <= eventIdx && eventIdx < endIdx))
            .length;

        return {
            numValidEvents: endIdx - beginIdx - numInvalidEvents,
            numInvalidEvents: numInvalidEvents,
        };
    }

    setDecoderOptions (options: JsonlDecoderOptionsType): boolean {
        this.#formatter = new LogbackFormatter(options);
        this.#logLevelKey = options.logLevelKey;

        return true;
    }

    decode (beginIdx: number, endIdx: number): Nullable<DecodeResultType[]> {
        if (0 > beginIdx || this.#logEvents.length < endIdx) {
            return null;
        }

        // eslint-disable-next-line no-warning-comments
        // TODO We could probably optimize this to avoid checking `#invalidLogEventIdxToRawLine` on
        // every iteration.
        const results: DecodeResultType[] = [];
        for (let logEventIdx = beginIdx; logEventIdx < endIdx; logEventIdx++) {
            let timestamp: number;
            let message: string;
            let logLevel: LOG_LEVEL;
            if (this.#invalidLogEventIdxToRawLine.has(logEventIdx)) {
                timestamp = INVALID_TIMESTAMP_VALUE;
                message = `${this.#invalidLogEventIdxToRawLine.get(logEventIdx)}\n`;
                logLevel = LOG_LEVEL.NONE;
            } else {
                // Explicit cast since typescript thinks `#logEvents[logEventIdx]` can be undefined,
                // but it shouldn't be since we performed a bounds check at the beginning of the
                // method.
                const logEvent = this.#logEvents[logEventIdx] as JsonObject;
                (
                    {timestamp, message} = this.#formatter.formatLogEvent(logEvent)
                );
                logLevel = this.#parseLogLevel(logEvent);
            }

            results.push([
                message,
                timestamp,
                logLevel,
                logEventIdx + 1,
            ]);
        }

        return results;
    }

    /**
     * Parses each line from the given data array as a JSON object and buffers it internally. If a
     * line cannot be parsed as a JSON object, an error is logged and the line is skipped.
     *
     * @param dataArray
     */
    #deserialize (dataArray: Uint8Array) {
        const text = JsonlDecoder.#textDecoder.decode(dataArray);
        let beginIdx = 0;
        while (beginIdx < text.length) {
            const endIdx = text.indexOf("\n", beginIdx);
            const line = (-1 === endIdx) ?
                text.substring(beginIdx) :
                text.substring(beginIdx, endIdx);

            beginIdx = (-1 === endIdx) ?
                text.length :
                endIdx + 1;

            try {
                const logEvent = JSON.parse(line) as JsonValue;
                if ("object" !== typeof logEvent) {
                    throw new Error("Unexpected non-object.");
                }
                this.#logEvents.push(logEvent as JsonObject);
            } catch (e) {
                if (0 === line.length) {
                    continue;
                }
                console.error(e, line);
                const currentLogEventIdx = this.#logEvents.length;
                this.#invalidLogEventIdxToRawLine.set(currentLogEventIdx, line);
                this.#logEvents.push({});
            }
        }
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
