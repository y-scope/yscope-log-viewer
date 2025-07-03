import {Nullable} from "../../typings/common.ts";
import {
    Decoder,
    DecoderOptions,
} from "../../typings/decoders.ts";
import {
    FILE_TYPE_DEFINITIONS,
    FileTypeDef,
    FileTypeInfo,
} from "../../typings/file.ts";
import ClpIrDecoder from "../decoders/ClpIrDecoder";
import JsonlDecoder from "../decoders/JsonlDecoder";


/**
 * Attempts to create a decoder based on the file extension.
 *
 * @param fileName
 * @param fileData
 * @param decoderOptions
 * @return The decoder, matching extension, and file type definition if successful, null
 * otherwise.
 */
const tryCreateDecoderByExtension = async (
    fileName: string,
    fileData: Uint8Array,
    decoderOptions: DecoderOptions
): Promise<Nullable<{
    decoder: ClpIrDecoder | JsonlDecoder; matchingExtension: string; fileTypeDef: FileTypeDef;
}>> => {
    for (const entry of FILE_TYPE_DEFINITIONS) {
        const matchingExtension = entry.extensions.find((ext) => fileName.endsWith(ext));
        if (matchingExtension) {
            try {
                return {
                    decoder: await entry.DecoderFactory.create(fileData, decoderOptions),
                    matchingExtension: matchingExtension,
                    fileTypeDef: entry,
                };
            } catch (e) {
                console.warn(`File extension matches ${entry.name},` +
                        "but decoder creation failed.", e);
                break;
            }
        }
    }

    return null;
};

/**
 * Attempts to create a decoder based on the file's magic number (signature).
 *
 * @param fileData
 * @param decoderOptions
 * @return The decoder and file type definition if successful, null otherwise.
 */
const tryCreateDecoderBySignature = async (
    fileData: Uint8Array,
    decoderOptions: DecoderOptions
): Promise<Nullable<{decoder: Decoder; fileTypeDef: FileTypeDef}>> => {
    for (const entry of FILE_TYPE_DEFINITIONS) {
        if (0 === entry.signature.length) {
            continue;
        }

        // Check if the file starts with the magic number.
        const signature = new Uint8Array(entry.signature);
        if (fileData.length >= entry.signature.length &&
            fileData.slice(0, entry.signature.length).every(
                (byte, idx) => byte === signature[idx]
            )
        ) {
            try {
                return {
                    decoder: await entry.DecoderFactory.create(fileData, decoderOptions),
                    fileTypeDef: entry,
                };
            } catch (e) {
                console.warn("Magic number matches, but decoder creation failed:", e);
                break;
            }
        }
    }

    return null;
};

/**
 * Gets the full file extension from a filename.
 *
 * @param filename
 * @return The full file extension, or an empty string if no extension is found.
 */
const getFileFullExtension = (filename: string) => {
    const parts = filename.split(".");
    return 1 < parts.length ?
        parts.slice(1).join(".") :
        "";
};

/**
 * Resolves the appropriate decoder and file type information based on the file name and data.
 *
 * @param fileName
 * @param fileData
 * @param decoderOptions
 * @return The constructed decoder and file type information.
 * @throws {Error} if the file is too large, or no decoder supports the file.
 */
const resolveDecoderAndFileType = async (
    fileName: string,
    fileData: Uint8Array,
    decoderOptions: DecoderOptions
): Promise<{
    decoder: Decoder;
    fileTypeInfo: FileTypeInfo;
}> => {
    let decoder: Decoder;
    let fileTypeInfo: FileTypeInfo;
    const result = await tryCreateDecoderByExtension(fileName, fileData, decoderOptions);

    if (result) {
        decoder = result.decoder;
        fileTypeInfo = {
            name: result.fileTypeDef.name,
            signature: result.fileTypeDef.signature,
            extension: result.matchingExtension,
            isStructured: result.fileTypeDef.checkIsStructured(decoder),
        };

        return {
            decoder: decoder,
            fileTypeInfo: fileTypeInfo,
        };
    }

    const result2 = await tryCreateDecoderBySignature(fileData, decoderOptions);
    if (result2) {
        decoder = result2.decoder;
        fileTypeInfo = {
            name: result2.fileTypeDef.name,
            signature: result2.fileTypeDef.signature,
            extension: getFileFullExtension(fileName),
            isStructured: result2.fileTypeDef.checkIsStructured(decoder),
        };

        return {
            decoder: decoder,
            fileTypeInfo: fileTypeInfo,
        };
    }
    throw new Error(`No decoder supports the file "${fileName}".`);
};

export {resolveDecoderAndFileType};
