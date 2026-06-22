import {CLP_SFA_MAGIC_BYTES} from "clp-ffi-js/sfa";

import ClpIrDecoder from "../services/decoders/ClpIrDecoder";
import {CLP_IR_STREAM_TYPE} from "../services/decoders/ClpIrDecoder/utils";
import ClpSfaDecoder from "../services/decoders/ClpSfaDecoder";
import JsonlDecoder from "../services/decoders/JsonlDecoder";
import PlainTextDecoder from "../services/decoders/PlainTextDecoder";
import {
    Decoder,
    DecoderFactory,
} from "./decoders";


type OnFileOpenCallback = (file: File) => void;

enum FILE_TYPE_NAME {
    CLP_IR = "CLP IR",
    CLP_SFA = "CLP Single File Archive",
    JSON_LINES = "JSON Lines",
    PLAIN_TEXT = "Plain Text",
}

/**
 * Describes a file type for display in the UI.
 */
interface FileTypeInfo {
    extension: string;
    isStructured: boolean;
    name: FILE_TYPE_NAME;
    signature: number[];
}

/**
 * Represents a file type with its identifying properties and decoder.
 */
interface FileTypeDef {
    checkIsStructured: (decoder: Decoder) => FileTypeInfo["isStructured"];
    decoderFactory: DecoderFactory;
    extensions: FileTypeInfo["extension"][];
    name: FileTypeInfo["name"];
    signature: FileTypeInfo["signature"];
}

/* eslint-disable @stylistic/array-element-newline, no-magic-numbers */
const FILE_TYPE_DEFINITIONS: FileTypeDef[] = [
    {
        checkIsStructured: (decoder) => decoder instanceof ClpIrDecoder &&
            decoder.irStreamType === CLP_IR_STREAM_TYPE.STRUCTURED,
        decoderFactory: ClpIrDecoder,
        extensions: [".clp.zst"],
        name: FILE_TYPE_NAME.CLP_IR,
        signature: [0x28, 0xb5, 0x2f, 0xfd],
    },
    {
        checkIsStructured: () => true,
        decoderFactory: ClpSfaDecoder,
        extensions: [".clp"],
        name: FILE_TYPE_NAME.CLP_SFA,
        signature: [...CLP_SFA_MAGIC_BYTES],
    },
    {
        checkIsStructured: () => true,
        decoderFactory: JsonlDecoder,
        extensions: [".jsonl", ".ndjson"],
        name: FILE_TYPE_NAME.JSON_LINES,
        signature: ["{".charCodeAt(0)],
    },
    {
        checkIsStructured: () => false,
        decoderFactory: PlainTextDecoder,
        extensions: [".err", ".log", ".out", ".txt"],
        name: FILE_TYPE_NAME.PLAIN_TEXT,
        signature: [],
    },
];
/* eslint-enable @stylistic/array-element-newline, no-magic-numbers */


export type {
    FileTypeDef,
    FileTypeInfo,
    OnFileOpenCallback,
};
export {
    FILE_TYPE_DEFINITIONS,
    FILE_TYPE_NAME,
};
