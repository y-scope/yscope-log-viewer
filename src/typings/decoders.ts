import {Nullable} from "./common";
import {LogLevelFilter} from "./logs";


type Metadata = Record<string, unknown>;


interface LogEventCount {
    numValidEvents: number;
    numInvalidEvents: number;
}

/**
 * @property formatString The format string to use to serialize records as plain text.
 * @property logLevelKey The key of the kv-pair that contains the log level in every record.
 * @property timestampFormatString The dayjs timestamp format string for unstructured logs.
 * @property timestampKey The key of the kv-pair that contains the timestamp in every record.
 */
interface DecoderOptions {
    formatString: string;
    logLevelKey: string;
    timestampFormatString: string;
    timestampKey: string;
}

/**
 * @property logEventNum The log event's 1-based index in the log file.
 * @property logLevel The log event's log level as a number (maps to enum LOG_LEVEL).
 * @property message The log event's message.
 * @property timestamp The log event's timestamp in milliseconds since the Unix epoch.
 * @property utcOffset The log event's local time zone offset from UTC, in minutes.
 */
interface DecodeResult {
    logEventNum: number;
    logLevel: number;
    message: string;
    timestamp: bigint;
    utcOffset: bigint;
}

/**
 * Mapping between an index in the filtered log events collection to an index in the unfiltered log
 * events collection.
 */
type FilteredLogEventMap = Nullable<number[]>;

/**
 * Index into the active log events collection. The active log events collection is either:
 * - the filtered log events collection, if the log level filter is set; or
 * - the unfiltered log events collection.
 *
 * NOTE: The filtered log events collection is currently represented using a `FilteredLogEventMap`
 * (so the index goes through a layer of indirection).
 */
type ActiveLogCollectionEventIdx = number;

interface Decoder {

    /**
     * Retrieves an estimated number of log events based on the initial deserialization results.
     *
     * @return The estimated number of events.
     */
    getEstimatedNumEvents(): number;

    /**
     * @return The filtered log events map.
     */
    getFilteredLogEventMap(): FilteredLogEventMap;

    /**
     * @return The metadata of the log file.
     */
    getMetadata(): Metadata;

    /**
     * Sets the log level filter for the decoder.
     *
     * @param logLevelFilter
     * @return Whether the filter was successfully set.
     */
    setLogLevelFilter(logLevelFilter: LogLevelFilter): boolean;

    /**
     * Deserializes all log events in the file.
     *
     * @return Count of the successfully deserialized ("valid") log events and count of any
     * un-deserializable ("invalid") log events.
     */
    build(): LogEventCount;

    /**
     * Sets any formatter options that exist in the decoder's options.
     *
     * @param options
     * @return Whether the options were successfully set.
     */
    setFormatterOptions(options: DecoderOptions): boolean;

    /**
     * Decodes log events in the range `[beginIdx, endIdx)` of the filtered or unfiltered
     * (depending on the value of `useFilter`) log events collection.
     *
     * @param beginIdx
     * @param endIdx
     * @param useFilter Whether to decode from the filtered or unfiltered log events collection.
     * @return The decoded log events on success or null if any log event in the range doesn't exist
     * (e.g., the range exceeds the number of log events in the collection).
     */
    decodeRange(
        beginIdx: number,
        endIdx: number,
        useFilter: boolean
    ): Nullable<DecodeResult[]>;

    /**
     * Finds the log event, L, where if we assume:
     *
     * - the collection of log events is sorted in chronological order;
     * - and we insert a marker log event, M, with timestamp `timestamp` into the collection (if log
     *   events with timestamp `timestamp` already exist in the collection, M should be inserted
     *   after them).
     *
     * L is the event just before M, if M is not the first event in the collection; otherwise L is
     * the event just after M.
     *
     * NOTE: If the collection of log events isn't in chronological order, this method has undefined
     * behaviour.
     *
     * @param timestamp
     * @return The index of the log event L.
     */
    findNearestLogEventByTimestamp(timestamp: number): Nullable<number>;
}

export type {
    ActiveLogCollectionEventIdx,
    Decoder,
    DecodeResult,
    DecoderOptions,
    FilteredLogEventMap,
    LogEventCount,
    Metadata,
};
