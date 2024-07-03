import {
    Decoder,
    DecodeResultType,
    JsonlDecoderOptionsType,
    LogEventCount,
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

    #logLevelKey: string = "level";

    #logEvents: JsonObject[] = [];

    // @ts-expect-error #fomatter is set in the constructor by `setDecoderOptions()`
    #formatter: Formatter;

    /**
     * Parses each line from the given data array as a JSON object and buffers it internally. If a
     * line cannot be parsed as a JSON object, an error is logged and the line is skipped.
     *
     * @param dataArray
     * @param decoderOptions
     */
    constructor (dataArray: Uint8Array, decoderOptions: JsonlDecoderOptionsType) {
        const isOptionSet = this.setDecoderOptions(decoderOptions);
        if (false === isOptionSet) {
            throw new Error(
                `Initial decoder options are erroneous: ${JSON.stringify(decoderOptions)}`
            );
        }

        const text = JsonlDecoder.#textDecoder.decode(dataArray);
        let beginIdx = 0;
        while (beginIdx < text.length) {
            const endIdx = text.indexOf("\n", beginIdx);
            let line;
            if (-1 === endIdx) {
                line = text.substring(beginIdx);
                beginIdx = text.length;
            } else {
                line = text.substring(beginIdx, endIdx);
                beginIdx = endIdx + 1;
            }

            try {
                const logEvent = JSON.parse(line) as JsonObject;
                this.#logEvents.push(logEvent);
            } catch (e) {
                if (0 !== line.length) {
                    console.error(e, line);
                }
            }
        }
    }

    getEstimatedNumEvents (): number {
        return this.#logEvents.length;
    }

    buildIdx (beginIdx: number, endIdx: number): LogEventCount | null {
        // This method is a dummy implementation since the actual deserialization is done in the
        // constructor.

        if (0 > beginIdx || endIdx >= this.#logEvents.length) {
            return null;
        }

        return {
            numValidEvents: endIdx - beginIdx,
            numInvalidEvents: 0,
        };
    }

    setDecoderOptions (options: JsonlDecoderOptionsType): boolean {
        this.#formatter = new LogbackFormatter(options);
        this.#logLevelKey = options.logLevelKey;

        return true;
    }

    decode (beginIdx: number, endIdx: number): DecodeResultType[] | null {
        if (0 > beginIdx || this.#logEvents.length < endIdx) {
            return null;
        }

        const results: DecodeResultType[] = [];
        for (let logEventIdx = beginIdx; logEventIdx < endIdx; logEventIdx++) {
            const logEvent = this.#logEvents[logEventIdx] as JsonObject;
            const {timestamp, message} = this.#formatter.formatLogEvent(logEvent);
            const logLevel = this.#parseLogLevel(logEvent);
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
