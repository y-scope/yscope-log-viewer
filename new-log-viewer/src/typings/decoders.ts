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
     * Scans the file to compute a total number of events.
     *
     * @return the total number of log event.
     */
    buildIdx(): number;

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
    decode(beginIdx: number, endIdx: number): DecodeResultType[] | null;
}


export type {
    Decoder,
    DecodeResultType,
    DecoderOptionsType,
    JsonlDecoderOptionsType,
};
