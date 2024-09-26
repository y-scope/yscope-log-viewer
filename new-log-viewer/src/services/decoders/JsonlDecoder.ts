import {Nullable} from "../../typings/common";
import {
    Decoder,
    DecodeResultType,
    JsonlDecoderOptionsType,
    LogEventCount,
} from "../../typings/decoders";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc"
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

dayjs.extend(utc);

/**
 * A log event parsed from a JSON log.
 */
interface JsonLogEvent {
    timestamp: Dayjs,
    level: LOG_LEVEL,
    fields: JsonObject
}

/**
 * A decoder for JSONL (JSON lines) files that contain log events. See `JsonlDecoderOptionsType` for
 * properties that are specific to log events (compared to generic JSON records).
 */
class JsonlDecoder implements Decoder {
    static #textDecoder = new TextDecoder();

    #dataArray: Nullable<Uint8Array>;

    #logLevelKey: string;

    #timestampKey: string;

    #logEvents: JsonLogEvent[] = [];

    #filteredLogEventIndices: Nullable<number[]> = null;

    #invalidLogEventIdxToRawLine: Map<number, string> = new Map();

    #formatter: Formatter;

    /**
     * @param dataArray
     * @param decoderOptions
     * @throws {Error} if the initial decoder options are erroneous.
     */
    constructor (dataArray: Uint8Array, decoderOptions: JsonlDecoderOptionsType) {
        this.#dataArray = dataArray;
        this.#logLevelKey = decoderOptions.logLevelKey;
        this.#timestampKey = decoderOptions.timestampKey;
        this.#formatter = new LogbackFormatter({formatString: decoderOptions.formatString});
    }

    getEstimatedNumEvents (): number {
        return this.#logEvents.length;
    }

    getFilteredLogEventIndices (): Nullable<number[]> {
        return this.#filteredLogEventIndices;
    }

    setLogLevelFilter (logLevelFilter: LogLevelFilter): boolean {
        this.#filterLogs(logLevelFilter);
        return true;
    }

    build (): LogEventCount {
        this.#deserialize();

        const numInvalidEvents = Array.from(this.#invalidLogEventIdxToRawLine.keys()).length;

        return {
            numValidEvents: this.#logEvents.length - numInvalidEvents,
            numInvalidEvents: numInvalidEvents,
        };
    }

    setFormatterOptions (options: JsonlDecoderOptionsType): boolean {
        this.#formatter = new LogbackFormatter({formatString: options.formatString});
        return true;
    }

    decodeRange (
        beginIdx: number,
        endIdx: number,
        useFilteredIndices: boolean,
    ): Nullable<DecodeResultType[]> {

        if (useFilteredIndices && this.#filteredLogEventIndices === null) {
            return null;
        }

        // Prevents typescript potential null warning.
        const filteredLogEventIndices: number[] = this.#filteredLogEventIndices as number[];

        const length: number = useFilteredIndices ?
            filteredLogEventIndices.length :
            this.#logEvents.length;

        if (0 > beginIdx || length < endIdx) {
            return null;
        }

        // eslint-disable-next-line no-warning-comments
        // TODO We could probably optimize this to avoid checking `#invalidLogEventIdxToRawLine` on
        // every iteration.
        const results: DecodeResultType[] = [];
        for (let i = beginIdx; i < endIdx; i++) {
            let timestamp: number;
            let message: string;
            let logLevel: LOG_LEVEL;

            // Explicit cast since typescript thinks `#filteredLogEventIndices[filteredLogEventIdx]`
            // can be undefined, but it shouldn't be since we performed a bounds check at the
            // beginning of the method.
            const logEventIdx: number = useFilteredIndices ?
                (filteredLogEventIndices[i] as number) :
                i;

            if (this.#invalidLogEventIdxToRawLine.has(logEventIdx)) {
                timestamp = INVALID_TIMESTAMP_VALUE;
                message = `${this.#invalidLogEventIdxToRawLine.get(logEventIdx)}\n`;
                logLevel = LOG_LEVEL.NONE;
            } else {
                // Explicit cast since typescript thinks `#logEvents[filteredIdx]` can be undefined,
                // but it shouldn't be since the index comes from a class-internal filter.
                const logEvent: JsonLogEvent = this.#logEvents[logEventIdx] as JsonLogEvent;

                logLevel = logEvent.level;
                message = this.#formatter.formatLogEvent(logEvent);
                timestamp = logEvent.timestamp.valueOf();
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
     * Parses each line from the data array as a JSON object and buffers it internally. If a
     * line cannot be parsed as a JSON object, an error is logged and the line is skipped.
     *
     * NOTE: The data array is freed after the very first run of this method.
     */
    #deserialize () {
        if (null === this.#dataArray) {
            return;
        }

        const text = JsonlDecoder.#textDecoder.decode(this.#dataArray);
        let beginIdx: number = 0;
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
     * Parse line into a json log event and add to log events array. If the line contains invalid
     * json, an entry is added to invalid log event map.
     *
     * @param line
     */
    #parseJson (line: string) {
        try {
            const fields = JSON.parse(line) as JsonValue;
            if (!this.#isJsonObject(fields)) {
                throw new Error("Unexpected non-object.");
            }
            this.#logEvents.push({
                fields: fields,
                level: this.#parseLogLevel(fields[this.#logLevelKey]),
                timestamp: this.#parseTimestamp(fields[this.#timestampKey]),
            });
        } catch (e) {
            if (0 === line.length) {
                return;
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

    /**
     * Narrows input to JsonObject if valid type.
     * Reference: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
     *
     * @param fields
     * @return Whether type is JsonObject.
     */
    #isJsonObject(fields: JsonValue): fields is JsonObject {
        return "object" === typeof fields;
    }

    /**
     * Maps the log level field to a log level value.
     *
     * @param logLevelField Field in log event indexed by log level key.
     * @return Log level value.
     */
    #parseLogLevel (logLevelField: JsonValue | undefined): number {
        let logLevelValue = LOG_LEVEL.NONE;

        if ("undefined" === typeof logLevelField) {
            return logLevelValue;
        }

        const logLevelName = "object" === typeof logLevelField ?
            JSON.stringify(logLevelField) :
            String(logLevelField);

        if (logLevelName.toUpperCase() in LOG_LEVEL) {
            logLevelValue = LOG_LEVEL[logLevelName.toUpperCase() as keyof typeof LOG_LEVEL];
        }

        return logLevelValue;
    }

    /**
     * Parses timestamp into dayjs timestamp.
     *
     * @param timestampField
     * @return The timestamp or `INVALID_TIMESTAMP_VALUE` if:
     * - the timestamp key doesn't exist in the log, or
     * - the timestamp's value is not a number.
     */
    #parseTimestamp (timestampField: JsonValue | undefined): dayjs.Dayjs {

        // If the field is an invalid type, then set the timestamp to INVALID_TIMESTAMP_VALUE.
        if (typeof timestampField !== "string" &&
            typeof timestampField !== "number" ||
            // Dayjs library surprisingly thinks undefined is valid date...
            // Reference: https://day.js.org/docs/en/parse/now#docsNav
            typeof timestampField === undefined
        ) {
            // INVALID_TIMESTAMP_VALUE is a valid dayjs date. Another potential option is daysjs(null)
            // to show `Invalid Date` in UI.
            timestampField = INVALID_TIMESTAMP_VALUE;
        }

        const dayjsTimestamp: Dayjs = dayjs.utc(timestampField);

        // Note if input is not valid (timestampField = "deadbeef"), this can produce a non-valid
        // timestamp and will show up in UI as `Invalid Date`. Here we modify invalid dates to
        // INVALID_TIMESTAMP_VALUE.
        if (false === dayjsTimestamp.isValid()) {
            dayjsTimestamp == dayjs.utc(INVALID_TIMESTAMP_VALUE)
        }

        return dayjsTimestamp;
    }

    /**
     * Computes and saves the indices of the log events that match the log level filter.
     *
     * @param logLevelFilter
     */
    #filterLogs (logLevelFilter: LogLevelFilter) {
        this.#filteredLogEventIndices = null;

        if (null === logLevelFilter) {
            return;
        }

        this.#filteredLogEventIndices = [];
        this.#logEvents.forEach((logEvent, index) => {
            if (logLevelFilter.includes(logEvent.level)) {
                (this.#filteredLogEventIndices as number[]).push(index);
            }
        });
    }
}

export default JsonlDecoder;
export type {
    JsonLogEvent,
}
