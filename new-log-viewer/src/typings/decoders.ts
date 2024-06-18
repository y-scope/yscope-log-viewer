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
     * @param results Output array of the results with each element of type
     * DecodeResultType. Initial size shall be zero.
     * @param startIdx Starting point of the range.
     * @param endIdx Ending point of the range.
     * @return True if the decoding is successful, false otherwise.
     */
    decode(results: DecodeResultType[], startIdx: number, endIdx: number): boolean;
}


export type {
    DecodeOptionsType,
    DecodeResultType,
    Decoders,
    JsonlDecodeOptionsType,
};
