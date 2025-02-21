import {DecoderOptions} from "../../../typings/decoders";
import {ParsedFieldName} from "../../../typings/formatters";
import {parseFilterKey} from "../../../utils/formatters";


enum CLP_IR_STREAM_TYPE {
    STRUCTURED = "structured",
    UNSTRUCTURED = "unstructured",
}

/**
 * Parsed field placeholder from a YScope format string.
 */
interface StructuredIrNamespaceKeys {
    auto: string;
    user: string;
}

interface StructuredIrReaderOptions {
    logLevelKey: ParsedFieldName;
    timestampKey: ParsedFieldName;
};

/**
 *
 * @param decoderOptions
 */
const parseDecoderOptions = (
    decoderOptions: DecoderOptions,
): StructuredIrReaderOptions => {
    return {
        logLevelKey: parseFilterKey(decoderOptions.logLevelKey),
        timestampKey: parseFilterKey(decoderOptions.timestampKey),
    };
};

export type {
    StructuredIrNamespaceKeys
};

export {
    CLP_IR_STREAM_TYPE,
    parseDecoderOptions,
};

