interface JsonlDecodeOptionsType {
    logLevelKey: string,
    textPattern: string,
    timestampKey: string,
}

/**
 * Type of decode options passed to the decoder before calling their decode() method.
 */
type DecodeOptionsType = JsonlDecodeOptionsType;


/**
 * Type of the decoded log event.
 *
 * @property message
 * @property timestamp
 * @property level
 * @property logEventNum
 */
type DecodeResultType = [string, number, number, number];

interface Decoders {

    /**
     * Decodes preamble when available and scans the file to compute a total
     * number of events.
     *
     * @return the total number of log event.
     */
    buildIdx(): number;

    /**
     * Sets options before the decoder decodes log events into formatted text.
     *
     * @param options
     * @return True if the options are successfully set, false otherwises.
     */
    setDecodeOptions(options: DecodeOptionsType): boolean;

    /**
     * Decodes a given range of results.
     *
     * @param startIdx Starting point of the range.
     * @param endIdx Ending point of the range.
     * @return An array of the results, or null if any error occurs.
     */
    decode(startIdx: number, endIdx: number): DecodeResultType[] | null;
}


export type {
    DecodeOptionsType,
    DecodeResultType,
    Decoders,
    JsonlDecodeOptionsType,
};
