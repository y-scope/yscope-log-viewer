import {Nullable} from "./common";


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

interface JsonlBuildOptions {
    formatString: string,
    logLevelKey: string,
    timestampKey: string,
}

type DecoderOptions = JsonlDecoderOptions;

type BuildOptions = JsonlBuildOptions;

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

interface Decoder {

    /**
     * Retrieves an estimated number of log events based on the initial deserialization results.
     *
     * @return The estimated number of events.
     */
    getEstimatedNumEvents(): number;

    /**
     * Deserializes all log events in the file.
     * @return Count of the successfully deserialized ("valid") log events and count of any
     * un-deserializable ("invalid") log events within the range;
     */
    build(): LogEventCount;

    /**
     * Sets formatting options. Changes are efficient and do not require rebuilding existing
     * log events.
     *
     * @param options
     * @return Whether the options were successfully set.
     */
    setFormatterOptions(options: DecoderOptions): boolean;

    /**
     * Decode log events. The range boundaries `[BeginIdx, EndIdx)` can refer to unfiltered log event
     * indices or filtered log event indices based on the flag `useFilteredIndices`.
     *
     * @param beginIdx
     * @param endIdx
     * @param useFilteredIndices Whether to decode from the filtered or unfiltered log events array.
     * @return The decoded log events on success or null if any log event in the range doesn't exist
     * (e.g., the range exceeds the number of log events in the file).
     */
    decodeRange(BeginIdx: number, EndIdx: number, useFilteredIndices: boolean): Nullable<DecodeResultType[]>;
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
    BuildOptions,
    DecoderOptions,
    JsonlDecoderOptions,
    JsonlBuildOptions,
    LogEventCount,
};
