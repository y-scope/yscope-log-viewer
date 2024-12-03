import {Dayjs} from "dayjs";

import {Nullable} from "../../../typings/common";
import {
    Decoder,
    DecodeResult,
    DecoderOptions,
    FilteredLogEventMap,
    LogEventCount,
} from "../../../typings/decoders";
import {Formatter} from "../../../typings/formatters";
import {JsonValue} from "../../../typings/js";
import {
    INVALID_TIMESTAMP_VALUE,
    LOG_LEVEL,
    LogEvent,
    LogLevelFilter,
} from "../../../typings/logs";
import YscopeFormatter from "../../formatters/YscopeFormatter";
import {postFormatPopup} from "../../MainWorker";
import {
    convertToDayjsTimestamp,
    convertToLogLevelValue,
    isJsonObject,
} from "./utils";


/**
 * A decoder for JSONL (JSON lines) files that contain log events. See `DecoderOptions` for
 * properties that are specific to log events (compared to generic JSON records).
 */
class JsonlDecoder implements Decoder {
    static #textDecoder = new TextDecoder();

    #dataArray: Nullable<Uint8Array>;

    #logLevelKey: string;

    #timestampKey: string;

    #logEvents: LogEvent[] = [];

    #filteredLogEventMap: FilteredLogEventMap = null;

    #invalidLogEventIdxToRawLine: Map<number, string> = new Map();

    #formatter: Formatter;

    /**
     * @param dataArray
     * @param decoderOptions
     */
    constructor (dataArray: Uint8Array, decoderOptions: DecoderOptions) {
        this.#dataArray = dataArray;
        this.#logLevelKey = decoderOptions.logLevelKey;
        this.#timestampKey = decoderOptions.timestampKey;
        this.#formatter = new YscopeFormatter({formatString: decoderOptions.formatString});
        if (0 === decoderOptions.formatString.length) {
            postFormatPopup();
        }
    }

    getEstimatedNumEvents (): number {
        return this.#logEvents.length;
    }

    getFilteredLogEventMap (): FilteredLogEventMap {
        return this.#filteredLogEventMap;
    }

    setLogLevelFilter (logLevelFilter: LogLevelFilter): boolean {
        this.#filterLogEvents(logLevelFilter);

        return true;
    }

    build (): LogEventCount {
        this.#deserialize();

        const numInvalidEvents = this.#invalidLogEventIdxToRawLine.size;

        return {
            numValidEvents: this.#logEvents.length - numInvalidEvents,
            numInvalidEvents: numInvalidEvents,
        };
    }

    setFormatterOptions (options: DecoderOptions): boolean {
        this.#formatter = new YscopeFormatter({formatString: options.formatString});

        return true;
    }

    decodeRange (
        beginIdx: number,
        endIdx: number,
        useFilter: boolean,
    ): Nullable<DecodeResult[]> {
        if (useFilter && null === this.#filteredLogEventMap) {
            return null;
        }

        const length: number = (useFilter && null !== this.#filteredLogEventMap) ?
            this.#filteredLogEventMap.length :
            this.#logEvents.length;

        if (0 > beginIdx || length < endIdx) {
            return null;
        }

        const results: DecodeResult[] = [];
        for (let i = beginIdx; i < endIdx; i++) {
            // Explicit cast since typescript thinks `#filteredLogEventMap[i]` can be undefined, but
            // it shouldn't be since we performed a bounds check at the beginning of the method.
            const logEventIdx: number = (useFilter && null !== this.#filteredLogEventMap) ?
                (this.#filteredLogEventMap[i] as number) :
                i;

            results.push(this.#decodeLogEvent(logEventIdx));
        }

        return results;
    }

    /**
     * Parses each line from the data array and buffers it internally.
     *
     * NOTE: `#dataArray` is freed after the very first run of this method.
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

            this.#parseJson(line);
        }

        this.#dataArray = null;
    }

    /**
     * Parses a JSON line into a log event and buffers it internally. If the line isn't valid JSON,
     * a default log event is buffered and the line is added to `#invalidLogEventIdxToRawLine`.
     *
     * @param line
     */
    #parseJson (line: string) {
        let fields: JsonValue;
        let level: LOG_LEVEL;
        let timestamp: Dayjs;
        try {
            fields = JSON.parse(line) as JsonValue;
            if (false === isJsonObject(fields)) {
                throw new Error("Unexpected non-object.");
            }
            level = convertToLogLevelValue(fields[this.#logLevelKey]);
            timestamp = convertToDayjsTimestamp(fields[this.#timestampKey]);
        } catch (e) {
            if (0 === line.length) {
                return;
            }
            console.error(e, line);
            const currentLogEventIdx = this.#logEvents.length;
            this.#invalidLogEventIdxToRawLine.set(currentLogEventIdx, line);
            fields = {};
            level = LOG_LEVEL.UNKNOWN;
            timestamp = convertToDayjsTimestamp(INVALID_TIMESTAMP_VALUE);
        }
        this.#logEvents.push({
            fields,
            level,
            timestamp,
        });
    }

    /**
     * Filters log events and generates `#filteredLogEventMap`. If `logLevelFilter` is `null`,
     * `#filteredLogEventMap` will be set to `null`.
     *
     * @param logLevelFilter
     */
    #filterLogEvents (logLevelFilter: LogLevelFilter) {
        if (null === logLevelFilter) {
            this.#filteredLogEventMap = null;

            return;
        }

        const filteredLogEventMap: number[] = [];
        this.#logEvents.forEach((logEvent, index) => {
            if (logLevelFilter.includes(logEvent.level)) {
                filteredLogEventMap.push(index);
            }
        });
        this.#filteredLogEventMap = filteredLogEventMap;
    }

    /**
     * Decodes a log event into a `DecodeResult`.
     *
     * @param logEventIdx
     * @return The decoded log event.
     */
    #decodeLogEvent = (logEventIdx: number): DecodeResult => {
        let timestamp: number;
        let message: string;
        let logLevel: LOG_LEVEL;

        // eslint-disable-next-line no-warning-comments
        // TODO We could probably optimize this to avoid checking `#invalidLogEventIdxToRawLine` on
        // every iteration.
        if (this.#invalidLogEventIdxToRawLine.has(logEventIdx)) {
            timestamp = INVALID_TIMESTAMP_VALUE;
            message = `${this.#invalidLogEventIdxToRawLine.get(logEventIdx)}\n`;
            logLevel = LOG_LEVEL.UNKNOWN;
        } else {
            // Explicit cast since typescript thinks `#logEvents[logEventIdx]` can be undefined,
            // but it shouldn't be since the index comes from a class-internal filter.
            const logEvent = this.#logEvents[logEventIdx] as LogEvent;
            logLevel = logEvent.level;
            message = this.#formatter.formatLogEvent(logEvent);
            timestamp = logEvent.timestamp.valueOf();
        }

        return [
            message,
            timestamp,
            logLevel,
            logEventIdx + 1,
        ];
    };
}


export default JsonlDecoder;
