import dayjs from "dayjs";

import {Nullable} from "../../typings/common";
import {
    Decoder,
    DecodeResultType,
    JsonlDecoderOptions,
    JsonLogEvent,
    LOG_EVENT_FILE_END_IDX,
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
    LogLevelFilter,
} from "../../typings/logs";
import LogbackFormatter from "../formatters/LogbackFormatter";


/**
 * A decoder for JSONL (JSON lines) files that contain log events. See `JsonlDecodeOptionsType` for
 * properties that are specific to log events (compared to generic JSON records).
 */
class JsonlDecoder implements Decoder {
    static #textDecoder = new TextDecoder();

    #dataArray: Nullable<Uint8Array>;

    readonly #logLevelKey: string;

    readonly #timestampKey: string;

    #logEvents: JsonLogEvent[] = [];

    #isFiltered: boolean;

    #filteredLogIndices: number[];

    #invalidLogEventIdxToRawLine: Map<number, string> = new Map();

    #formatter: Formatter;

    /**
     * @param dataArray
     * @param decoderOptions
     * @throws {Error} if the initial decoder options are erroneous.
     */
    constructor (dataArray: Uint8Array, decoderOptions: JsonlDecoderOptions) {
        this.#filteredLogIndices = [];
        this.#logLevelKey = decoderOptions.logLevelKey;
        this.#timestampKey = decoderOptions.timestampKey;
        this.#formatter = new LogbackFormatter(decoderOptions);
        this.#dataArray = dataArray;
        this.#isFiltered = false;
    }

    getEstimatedNumEvents (): number {
        return this.#logEvents.length;
    }

    getFilteredLogEvents (): number[] {
        return this.#filteredLogIndices;
    }

    buildIdx (beginIdx: number, endIdx: number): Nullable<LogEventCount> {
        if (0 !== beginIdx || endIdx !== LOG_EVENT_FILE_END_IDX) {
            throw new Error("Partial range deserialization is not yet supported.");
        }

        this.#deserialize();

        const numInvalidEvents = Array.from(this.#invalidLogEventIdxToRawLine.keys()).length;

        return {
            numValidEvents: this.#logEvents.length - numInvalidEvents,
            numInvalidEvents: numInvalidEvents,
        };
    }

    changeLogLevelFilter (logLevelFilter: LogLevelFilter): boolean {
        this.#filterLogs(logLevelFilter);
        this.#isFiltered = Boolean(logLevelFilter);

        return true;
    }

    decodeRange (beginIdx: number, endIdx: number): Nullable<DecodeResultType[]> {
        return this.#decodeAnyRange(beginIdx, endIdx, false);
    }

    decodeFilteredRange (
        beginIdx: number,
        endIdx: number,
    ): Nullable<DecodeResultType[]> {
        return this.#decodeAnyRange(beginIdx, endIdx, this.#isFiltered);
    }

    /**
     * Decodes JSON log events from the filtered log events array or unfiltered
     * based on the value of useFilter.
     *
     * @param beginIdx
     * @param endIdx
     * @param useFilter Whether to use filtered or unfiltered log event array
     * @return The decoded log events on success or null if any log event in the range doesn't exist
     * (e.g., the range exceeds the number of log events in the file).
     */
    #decodeAnyRange (
        beginIdx: number,
        endIdx: number,
        useFilter: boolean,
    ): Nullable<DecodeResultType[]> {
        const length: number = useFilter ?
            this.#filteredLogIndices.length :
            this.#logEvents.length;

        if (0 > beginIdx || length < endIdx) {
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

            // Explicit cast since typescript thinks `#filteredLogIndices[filteredLogEventIdx]` can
            // be undefined, but it shouldn't be since we performed a bounds check at the beginning
            // of the method.
            const filteredIdx: number = useFilter ?
                (this.#filteredLogIndices[logEventIdx] as number) :
                logEventIdx;

            if (this.#invalidLogEventIdxToRawLine.has(filteredIdx)) {
                timestamp = INVALID_TIMESTAMP_VALUE;
                message = `${this.#invalidLogEventIdxToRawLine.get(filteredIdx)}\n`;
                logLevel = LOG_LEVEL.NONE;
            } else {
                // Explicit cast since typescript thinks `#logEvents[logEventIdx]` can be undefined,
                // but it shouldn't be since the index comes from a class-internal filter.
                const logEvent: JsonLogEvent = this.#logEvents[filteredIdx] as JsonLogEvent;

                logLevel = logEvent.level;
                message = this.#formatter.formatLogEvent(logEvent);
                timestamp = logEvent.timestamp.valueOf();
            }

            results.push([
                message,
                timestamp,
                logLevel,
                filteredIdx + 1,
            ]);
        }

        return results;
    }

    /**
     * Parses each line from the data array as a JSON object and buffers it internally. If a
     * line cannot be parsed as a JSON object, an error is logged and the line is skipped.
     * Note the data array is freed after the very first run of the method.
     */
    #deserialize () {
        if (null === this.#dataArray) {
            return;
        }
        const text = JsonlDecoder.#textDecoder.decode(this.#dataArray);
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
                const fields = JSON.parse(line) as JsonValue;
                if ("object" !== typeof fields) {
                    throw new Error("Unexpected non-object.");
                }
                this.#logEvents.push({
                    fields: fields as JsonObject,
                    level: this.#parseLogLevel(fields as JsonObject),
                    timestamp: this.#parseTimestamp(fields as JsonObject),
                });
            } catch (e) {
                if (0 === line.length) {
                    continue;
                }
                console.error(e, line);
                const currentLogEventIdx = this.#logEvents.length;
                this.#invalidLogEventIdxToRawLine.set(currentLogEventIdx, line);
                this.#logEvents.push({
                    fields: {},
                    level: LOG_LEVEL.NONE,
                    timestamp: dayjs.utc(INVALID_TIMESTAMP_VALUE),
                });
            }
        }

        this.#dataArray = null;
    }

    /**
     * Creates an array containing indexes of logs which match the user selected levels. The
     * previous array is removed and a new one is created on each call.
     *
     * @param logLevelFilter Array of selected log levels
     */
    #filterLogs (logLevelFilter: LogLevelFilter) {
        this.#filteredLogIndices.length = 0;

        if (!logLevelFilter) {
            return;
        }

        this.#logEvents.forEach((logEvent, index) => {
            if (logLevelFilter.includes(logEvent.level)) {
                this.#filteredLogIndices.push(index);
            }
        });
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
            return logLevel;
        }

        const logLevelStr = "object" === typeof parsedLogLevel ?
            JSON.stringify(parsedLogLevel) :
            String(parsedLogLevel);

        if (false === (logLevelStr.toUpperCase() in LOG_LEVEL)) {
            console.error(`${logLevelStr} doesn't match any known log level.`);
        } else {
            logLevel = LOG_LEVEL[logLevelStr.toUpperCase() as keyof typeof LOG_LEVEL];
        }

        return logLevel;
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
}

export default JsonlDecoder;
