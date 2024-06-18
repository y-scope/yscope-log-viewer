interface JsonlDecodeOptionsType {
    logLevelKey: string,
    textPattern: string,
    timestampKey: string,
}

/**
 * Type of decode options passed to the decoder before calling their decode() method.
 */
type DecodeOptionsType = JsonlDecodeOptionsType;

export type {
    DecodeOptionsType,
    JsonlDecodeOptionsType,
};
