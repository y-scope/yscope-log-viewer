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
 * Type of the decoded log event.
 *
 * @property message
 * @property timestamp
 * @property level
 * @property logEventNum
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
     * Sets options before the decoder decodes log events into formatted text.
     *
     * @param options
     * @return Whether the options were successfully set.
     */
    setDecoderOptions(options: DecoderOptionsType): boolean;

    /**
     * Decodes a given range of results.
     *
     * @param beginIdx Beginning point of the range.
     * @param endIdx Ending point of the range.
     * @return An array of the results, or null if any error occurs.
     */
    decode(beginIdx: number, endIdx: number): DecodeResultType[] | null;
}


export type {
    Decoder,
    DecodeResultType,
    DecoderOptionsType,
    JsonlDecoderOptionsType,
};
