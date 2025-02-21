import {MainModule} from "clp-ffi-js";

import {
    DecoderOptions,
    StructuredIrNamespaceKeys,
} from "../../../typings/decoders";
import {ParsedKey} from "../../../typings/formatters";
import {escapeThenParseFilterKey} from "../../../utils/decoders";


enum CLP_IR_STREAM_TYPE {
    STRUCTURED = "structured",
    UNSTRUCTURED = "unstructured",
}

interface StructuredIrReaderOptions {
    logLevelKey: ParsedKey;
    timestampKey: ParsedKey;
}

/**
 * @param decoderOptions
 * @return The structured IR reader options.
 */
const createStructuredIrReaderOptions = (
    decoderOptions: DecoderOptions,
): StructuredIrReaderOptions => {
    return {
        logLevelKey: escapeThenParseFilterKey(decoderOptions.logLevelKey),
        timestampKey: escapeThenParseFilterKey(decoderOptions.timestampKey),
    };
};

/**
 * @param ffi_module
 * @return The Structured IR namespace keys from "clp-ffi-js".
 */
const getStructuredIrNamespaceKeys = (ffi_module: MainModule): StructuredIrNamespaceKeys => {
    const { MERGED_KV_PAIRS_AUTO_GENERATED_KEY, MERGED_KV_PAIRS_USER_GENERATED_KEY } = ffi_module;

    if (typeof MERGED_KV_PAIRS_AUTO_GENERATED_KEY !== "string") {
        throw new Error("Invalid type for MERGED_KV_PAIRS_AUTO_GENERATED_KEY.");
    }

    if (typeof MERGED_KV_PAIRS_USER_GENERATED_KEY !== "string") {
        throw new Error("Invalid type for MERGED_KV_PAIRS_USER_GENERATED_KEY.");
    }

    return {
        auto: MERGED_KV_PAIRS_AUTO_GENERATED_KEY,
        user: MERGED_KV_PAIRS_USER_GENERATED_KEY,
    };
};

export {
    CLP_IR_STREAM_TYPE,
    getStructuredIrNamespaceKeys,
    createStructuredIrReaderOptions,
};
