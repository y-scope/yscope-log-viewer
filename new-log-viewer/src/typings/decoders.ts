import {Dayjs} from "dayjs";

import {Nullable} from "./common";
import {JsonObject} from "./js";
import {
    LOG_LEVEL,
    LogLevelFilter,
} from "./logs";


interface LogEventCount {
    numValidEvents: number,
    numInvalidEvents: number,
}

/**
 * Options for the JSONL decoder.
 *
 * @property formatString The format string to use to serialize records as plain text.
 * @property logLevelKey The key of the kv-pair that contains the log level in every record.
 * @property timestampKey The key of the kv-pair that contains the timestamp in every record.
 */
interface JsonlDecoderOptions {
    formatString: string,
    logLevelKey: string,
    timestampKey: string,
}

type DecoderOptions = JsonlDecoderOptions;

/**
 * A log event parsed from a JSON log.
 */
interface JsonLogEvent {
    timestamp: Dayjs,
    level: LOG_LEVEL,
    fields: JsonObject
}

/**
 * Type of the decoded log event. We use an array rather than object so that it's easier to return
 * results from WASM-based decoders.
 *
 * @property message
 * @property timestamp
 * @property level
 * @property number
 */
type DecodeResultType = [string, number, number, number];

interface Decoder {

    /**
     * Retrieves an estimated number of log events based on the initial deserialization results.
     *
     * @return The estimated number of events.
     */
    getEstimatedNumEvents(): number;

    /**
     * Retrieves the filtered log events indices, which is usually based on log level.
     *
     * @return Indices of the filtered events.
     */
    getFilteredLogEvents(): number[];

    /**
     * Sets the log level filter for the decoder.
     *
     * @param logLevelFilter
     * @return Whether the filter was successfully set.
     */
    changeLogLevelFilter(logLevelFilter: LogLevelFilter): boolean

    /**
     * When applicable, deserializes log events in the range `[beginIdx, endIdx)`.
     *
     * @param beginIdx
     * @param endIdx End index. To deserialize to the end of the file, use `LOG_EVENT_FILE_END_IDX`.
     * @return Count of the successfully deserialized ("valid") log events and count of any
     * un-deserializable ("invalid") log events within the range; or null if any log event in the
     * range doesn't exist (e.g., the range exceeds the number of log events in the file).
     */
    buildIdx(beginIdx: number, endIdx: number): Nullable<LogEventCount>;

    /**
     * Decodes the log events in the range `[beginIdx, endIdx)`.
     *
     * @param beginIdx
     * @param endIdx
     * @return The decoded log events on success or null if any log event in the range doesn't exist
     * (e.g., the range exceeds the number of log events in the file).
     */
    decode(beginIdx: number, endIdx: number): Nullable<DecodeResultType[]>;
}

/**
 * Index for specifying the end of the file when the exact number of log events it contains is
 *  unknown.
 */
const LOG_EVENT_FILE_END_IDX: number = 0;

export {LOG_EVENT_FILE_END_IDX};
export type {
    Decoder,
    DecodeResultType,
    DecoderOptions,
    JsonlDecoderOptions,
    JsonLogEvent,
    LogEventCount,
};
