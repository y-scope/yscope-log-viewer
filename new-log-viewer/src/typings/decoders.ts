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
     * When applicable, deserializes log events in the range `[beginIdx, endIdx)`.
     *
     * @param beginIdx
     * @param endIdx
     * @return Count of the successfully deserialized ("valid") log events and count of any
     * un-deserializable ("invalid") log events within the range; or null if any log event in the
     * range doesn't exist (e.g., the range exceeds the number of log events in the file).
     */
    buildIdx(beginIdx: number, endIdx: number): Nullable<LogEventCount>;

    /**
     * Sets options for the decoder.
     *
     * @param options
     * @return Whether the options were successfully set.
     */
    setDecoderOptions(options: DecoderOptionsType): boolean;

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
    DecoderOptionsType,
    JsonlDecoderOptionsType,
    LogEventCount,
};
