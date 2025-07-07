import ClpIrDecoder from "../services/decoders/ClpIrDecoder";
import {CLP_IR_STREAM_TYPE} from "../services/decoders/ClpIrDecoder/utils";
import JsonlDecoder from "../services/decoders/JsonlDecoder";
import {Decoder} from "./decoders";


type OnFileOpenCallback = (file: File) => void;

/**
 * Describes a file type for display in the UI.
 */
interface FileTypeInfo {
    extension: string;
    isStructured: boolean;
    name: string;
    signature: number[];
}

/**
 * Represents a file type with its identifying properties and decoder.
 */
interface FileTypeDef {
    DecoderFactory: typeof ClpIrDecoder | typeof JsonlDecoder;

    checkIsStructured: (decoder: Decoder) => FileTypeInfo["isStructured"];
    extensions: FileTypeInfo["extension"][];
    name: FileTypeInfo["name"];
    signature: FileTypeInfo["signature"];
}

/* eslint-disable @stylistic/array-element-newline, no-magic-numbers */
const FILE_TYPE_DEFINITIONS: FileTypeDef[] = [
    {
        DecoderFactory: ClpIrDecoder,
        checkIsStructured: (decoder) => decoder instanceof ClpIrDecoder &&
            decoder.irStreamType === CLP_IR_STREAM_TYPE.STRUCTURED,
        extensions: [".clp.zst"],
        name: "CLP IR",
        signature: [0x28, 0xb5, 0x2f, 0xfd],
    },
    {
        DecoderFactory: JsonlDecoder,
        checkIsStructured: () => false,
        extensions: [".jsonl", ".ndjson"],
        name: "JSON Lines",
        signature: ["{".charCodeAt(0)],
    },
];
/* eslint-enable @stylistic/array-element-newline, no-magic-numbers */


export type {
    FileTypeDef,
    FileTypeInfo,
    OnFileOpenCallback,
};
export {FILE_TYPE_DEFINITIONS};
