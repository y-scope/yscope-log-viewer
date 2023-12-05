const PROTOCOL = {
    FOUR_BYTE_ENCODING_MAGIC_NUMBER: [0xFD, 0x2F, 0xB5, 0x29],
    METADATA: {
        VERSION_KEY: "VERSION",
        VERSION_VALUE: "0.0.1",
        // The following regex can be used to validate a Semantic Versioning
        // string. The source of the regex can be found here: https://semver.org
        VERSION_REGEX: new RegExp("^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)"
            + "(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)"
            + "(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?"
            + "(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$"),
        REFERENCE_TIMESTAMP_KEY: "REFERENCE_TIMESTAMP",
        TIMESTAMP_PATTERN_KEY: "TIMESTAMP_PATTERN",
        TZ_ID_KEY: "TZ_ID",
        JSON_ENCODING: 0x1,
        METADATA_LEN_UBYTE: 0x11,
        METADATA_LEN_USHORT: 0x12,
        METADATA_LEN_INT: 0x13,
    },

    PAYLOAD: {
        EOF: 0x0,

        VAR_STR_LEN_UNSIGNED_BYTE: 0x11,
        VAR_STR_LEN_UNSIGNED_SHORT: 0x12,
        VAR_STR_LEN_SIGNED_INT: 0x13,
        VAR_FOUR_BYTE_ENCODING: 0x18,

        LOGTYPE_STR_LEN_UNSIGNED_BYTE: 0x21,
        LOGTYPE_STR_LEN_UNSIGNED_SHORT: 0x22,
        LOGTYPE_STR_LEN_SIGNED_INT: 0x23,

        TIMESTAMP_DELTA_SIGNED_BYTE: 0x31,
        TIMESTAMP_DELTA_SIGNED_SHORT: 0x32,
        TIMESTAMP_DELTA_SIGNED_INT: 0x33,
        TIMESTAMP_DELTA_SIGNED_LONG: 0x34,
        TIMESTAMP_NULL: 0x3F,
        // NOTE: JavaScript only supports 53-bit numbers safely, so we have to
        //       use BigInt for 64-bit numbers.
        TIMESTAMP_NULL_VAL: BigInt("-9223372036854776000"),

        isNotVar: (tag) => {
            return (tag >> 4) !== 0x1;
        },
    },
};

export default PROTOCOL;
