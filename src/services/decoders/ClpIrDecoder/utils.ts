import {MainModule} from "clp-ffi-js";


enum CLP_IR_STREAM_TYPE {
    STRUCTURED = "structured",
    UNSTRUCTURED = "unstructured",
}

/**
 * Keys that delineate the auto-generated and user-generated namespaces in structured IR log events.
 */
interface StructuredIrNamespaceKeys {
    auto: string;
    user: string;
}

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


export type {StructuredIrNamespaceKeys};


export {
    CLP_IR_STREAM_TYPE,
    getStructuredIrNamespaceKeys,
};
