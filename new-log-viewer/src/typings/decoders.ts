interface JsonlDecodeOptionsType {
    textPattern: string,
    timestampPropName: string,
    verbosityPropName: string,
}

/**
 * Type of decode options passed to the decoder before calling their decode() method.
 */
type DecodeOptionsType = JsonlDecodeOptionsType;

export type {
    DecodeOptionsType,
    JsonlDecodeOptionsType,
};
