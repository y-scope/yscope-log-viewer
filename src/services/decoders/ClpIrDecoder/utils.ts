import {DecoderOptions} from "../../../typings/decoders";
import {ParsedKey} from "../../../typings/formatters";
import {parseFilterKey} from "../../../utils/formatters";


enum CLP_IR_STREAM_TYPE {
    STRUCTURED = "structured",
    UNSTRUCTURED = "unstructured",
}

interface StructuredIrReaderOptions {
    logLevelKey: ParsedKey;
    timestampKey: ParsedKey;
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

export {
    CLP_IR_STREAM_TYPE,
    parseDecoderOptions,
};

