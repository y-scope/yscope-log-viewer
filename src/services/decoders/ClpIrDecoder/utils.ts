import { MainModule } from "clp-ffi-js";
import {DecoderOptions} from "../../../typings/decoders";
import {ParsedKey} from "../../../typings/formatters";
import {escapeThenParseFilterKey} from "../../../utils/decoders";
import {
    StructuredIrNamespaceKeys,
} from "../../../typings/decoders";


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
const getStructuredIrReaderOptions = (
    decoderOptions: DecoderOptions,
): StructuredIrReaderOptions => {
    return {
        logLevelKey: escapeThenParseFilterKey(decoderOptions.logLevelKey),
        timestampKey: escapeThenParseFilterKey(decoderOptions.timestampKey),
    };
};

/**
 * Extracts structured IR namespace keys from the module.
 * @param module The module containing the keys.
 * @returns The structured IR namespace keys.
 */
const getStructuredIrNamespaceKeys = (module: MainModule): StructuredIrNamespaceKeys => {
    if ("string" !== typeof module.MERGED_KV_PAIRS_AUTO_GENERATED_KEY ||
        "string" !== typeof module.MERGED_KV_PAIRS_USER_GENERATED_KEY) {
        throw new Error("Merged key pair values are not strings.");
    }

    return {
        auto: module.MERGED_KV_PAIRS_AUTO_GENERATED_KEY,
        user: module.MERGED_KV_PAIRS_USER_GENERATED_KEY,
    };
};

export {
    CLP_IR_STREAM_TYPE,
    getStructuredIrReaderOptions,
    getStructuredIrNamespaceKeys,
};

