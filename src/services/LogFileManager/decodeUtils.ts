import {Nullable} from "../../typings/common";
import {
    Decoder,
    DecoderOptions,
} from "../../typings/decoders";
import {
    FILE_TYPE_DEFINITIONS,
    FileTypeDef,
    FileTypeInfo,
} from "../../typings/file";
import {MAX_V8_STRING_LENGTH} from "../../typings/js";
import {getFileFullExtension} from "../../utils/file";
import {formatSizeInBytes} from "../../utils/units";


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
    decoder: Decoder; matchingExtension: string; fileTypeDef: FileTypeDef;
}>> => {
    for (const entry of FILE_TYPE_DEFINITIONS) {
        const matchingExtension = entry.extensions.find((ext) => fileName.endsWith(ext));
        if ("undefined" === typeof matchingExtension) {
            continue;
        }

        try {
            return {
                decoder: await entry.DecoderFactory.create(fileData, decoderOptions),
                matchingExtension: matchingExtension,
                fileTypeDef: entry,
            };
        } catch (e) {
            console.warn(`File extension matches ${entry.name}, but decoder creation failed.`, e);
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
        if (0 === entry.signature.length || fileData.length < entry.signature.length) {
            continue;
        }

        // Check if the file starts with the magic number.
        const isSignatureMatching = fileData
            .slice(0, entry.signature.length)
            .every((byte, idx) => byte === entry.signature[idx]);

        if (isSignatureMatching) {
            try {
                return {
                    decoder: await entry.DecoderFactory.create(fileData, decoderOptions),
                    fileTypeDef: entry,
                };
            } catch (e) {
                console.warn(`Magic number matches ${entry.name}, but decoder creation failed:`, e);
            }
        }
    }

    return null;
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
    if (fileData.length > MAX_V8_STRING_LENGTH) {
        throw new Error(`Cannot handle files larger than ${
            formatSizeInBytes(MAX_V8_STRING_LENGTH)
        } due to a limitation in Chromium-based browsers.`);
    }

    let fileExtension = getFileFullExtension(fileName);
    let fileTypeDef = null;
    let decoder = null;

    // Try to create a decoder based on the file extension.
    if (0 < fileExtension.length) {
        const extensionResult = await tryCreateDecoderByExtension(
            fileName,
            fileData,
            decoderOptions,
        );

        if (null !== extensionResult) {
            ({decoder, matchingExtension: fileExtension, fileTypeDef} = extensionResult);
        }
    }

    // If no decoder was found by extension, try to create one based on the file's magic number.
    if (null === decoder) {
        console.warn(`No valid decoder was found for file extension "${fileExtension}". ` +
            "Trying to match by signature.");
        const signatureResult = await tryCreateDecoderBySignature(fileData, decoderOptions);
        if (null !== signatureResult) {
            ({decoder, fileTypeDef} = signatureResult);
        }
    }

    if (null === decoder || null === fileTypeDef) {
        throw new Error(`No decoder supports the file "${fileName}".`);
    }

    return {
        decoder: decoder,
        fileTypeInfo: {
            extension: fileExtension,
            isStructured: fileTypeDef.checkIsStructured(decoder),
            name: fileTypeDef.name,
            signature: fileTypeDef.signature,
        },
    };
};

export {resolveDecoderAndFileType};
