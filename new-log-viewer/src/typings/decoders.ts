import {Nullable} from "./common";
import {LogLevelFilter} from "./logs";


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
interface JsonlDecoderOptionsType {
    formatString: string,
    logLevelKey: string,
    timestampKey: string,
}

type DecoderOptionsType = JsonlDecoderOptionsType;

/**
 * Type of the decoded log event. We use an array rather than object so that it's easier to return
 * results from WASM-based decoders.
 *
 * @property message
 * @property timestamp
 * @property level
 * @property number The log event number is always the unfiltered number.
 */
type DecodeResultType = [string, number, number, number];

/**
 * Mapping between filtered log event indices and log events indices. The array index refers to
 * the `filtered log event index` and the value refers to the `log event index`.
 */
type FilteredLogEventMap = Nullable<number[]>;

interface Decoder {

    /**
     * Retrieves an estimated number of log events based on the initial deserialization results.
     *
     * @return The estimated number of events.
     */
    getEstimatedNumEvents(): number;

    /**
     * @return Filtered log event map.
     */
    getFilteredLogEventMap(): FilteredLogEventMap;

    /**
     * Sets the log level filter for the decoder.
     *
     * @param logLevelFilter
     * @return Whether the filter was successfully set.
     */
    setLogLevelFilter(logLevelFilter: LogLevelFilter): boolean

    /**
     * Deserializes all log events in the file.
     *
     * @return Count of the successfully deserialized ("valid") log events and count of any
     * un-deserializable ("invalid") log events within the range;
     */
    build(): LogEventCount;

    /**
     * Sets formatting options.
     *
     * NOTE: The decoder supports changing formatting without rebuilding existing log
     * events; however, the front-end currently does not support this.
     *
     * @param options
     * @return Whether the options were successfully set.
     */
    setFormatterOptions(options: DecoderOptionsType): boolean;

    /**
     * Decode log events. The flag `useFilter` specifies whether the range boundaries `[BeginIdx, EndIdx)`
     * refer to the log event index directly or a filtered index. The filtered index is based on a subset
     * of log events that are included by the set filter.
     *
     * @param beginIdx
     * @param endIdx
     * @param useFilter Whether index refers to filtered index or log event index.
     * @return The decoded log events on success or null if any log event in the range doesn't exist
     * (e.g., the range exceeds the number of log events in the file).
     */
    decodeRange(beginIdx: number,
        endIdx: number,
        useFilter: boolean
    ): Nullable<DecodeResultType[]>;
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
    DecoderOptionsType,
    FilteredLogEventMap,
    JsonlDecoderOptionsType,
    LogEventCount,
};
