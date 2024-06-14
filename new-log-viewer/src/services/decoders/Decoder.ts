/**
 * Type of the decoded log event.
 *
 * @property message
 * @property timestamp
 * @property verbosity
 * @property logEventNum
 */
type DecodeResultType = [string, number, number, number];

interface Decoder {
    buildIdx(): number;
    setDecodeOptions(options: {[key: string]: string}): boolean;
    decode(results: DecodeResultType[], startIdx: number, endIdx: number): boolean;
}

interface DecoderConstructor {
    new(dataArray: Uint8Array): Decoder;
    new(dataPtr: number, length: number): Decoder;
}

export type {
    Decoder,
    DecoderConstructor,
    DecodeResultType,
};
