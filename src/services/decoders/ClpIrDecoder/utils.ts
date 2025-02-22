import {MainModule} from "clp-ffi-js";

import {
    DecoderOptions,
    StructuredIrNamespaceKeys,
} from "../../../typings/decoders";
import {ParsedKey} from "../../../typings/formatters";
import {processThenParseFilterKey} from "../../../utils/decoders";


enum CLP_IR_STREAM_TYPE {
    STRUCTURED = "structured",
    UNSTRUCTURED = "unstructured",
}

interface StructuredIrReaderOptions {
    logLevelKey: ParsedKey;
    timestampKey: ParsedKey;
}

/**
 * Creates structured IR reader options using decoder options.
 *
 * @param decoderOptions
 * @return
 */
const createStructuredIrReaderOptions = (
    decoderOptions: DecoderOptions,
): StructuredIrReaderOptions => {
    return {
        logLevelKey: processThenParseFilterKey(decoderOptions.logLevelKey),
        timestampKey: processThenParseFilterKey(decoderOptions.timestampKey),
    };
};

/**
 * Retrieves the structured IR namespace keys from the "clp-ffi-js" module.
 *
 * @param ffiModule The main module from "clp-ffi-js".
 * @return
 * @throws {Error} If the keys are of invalid type.
 */
const getStructuredIrNamespaceKeys = (ffiModule: MainModule): StructuredIrNamespaceKeys => {
    const {MERGED_KV_PAIRS_AUTO_GENERATED_KEY, MERGED_KV_PAIRS_USER_GENERATED_KEY} = ffiModule;

    if ("string" !== typeof MERGED_KV_PAIRS_AUTO_GENERATED_KEY) {
        throw new Error("Invalid type for MERGED_KV_PAIRS_AUTO_GENERATED_KEY.");
    }

    if ("string" !== typeof MERGED_KV_PAIRS_USER_GENERATED_KEY) {
        throw new Error("Invalid type for MERGED_KV_PAIRS_USER_GENERATED_KEY.");
    }

    return {
        auto: MERGED_KV_PAIRS_AUTO_GENERATED_KEY,
        user: MERGED_KV_PAIRS_USER_GENERATED_KEY,
    };
};

export {
    CLP_IR_STREAM_TYPE,
    createStructuredIrReaderOptions,
    getStructuredIrNamespaceKeys,
};
