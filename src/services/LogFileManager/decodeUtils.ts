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
import {getFileMatchingExtension} from "../../utils/file";
import {formatSizeInBytes} from "../../utils/units";


/**
 * Attempts to create a decoder for the given file type.
 *
 * @param fileTypeDef
 * @param fileData
 * @param decoderOptions
 * @return The decoder if successful, null otherwise.
 */
const tryCreateDecoder = async (
    fileTypeDef: FileTypeDef,
    fileData: Uint8Array,
    decoderOptions: DecoderOptions
): Promise<Nullable<Decoder>> => {
    try {
        return await fileTypeDef.decoderFactory.create(fileData, decoderOptions);
    } catch (e) {
        console.warn(`Failed to create ${fileTypeDef.name} decoder.`, e);
    }

    return null;
};

/**
 * Attempts to create a decoder based on the file's magic number (signature).
 *
 * @param fileData
 * @param decoderOptions
 * @return The decoder and matched file type definition, or null if no signature matches. The
 * decoder is null if its creation fails, but the matched signature is still returned.
 */
const tryCreateDecoderBySignature = async (
    fileData: Uint8Array,
    decoderOptions: DecoderOptions
): Promise<Nullable<{decoder: Nullable<Decoder>; fileTypeDef: FileTypeDef}>> => {
    for (const entry of FILE_TYPE_DEFINITIONS) {
        // Skip decoders that don't define a signature
        if (0 === entry.signature.length) {
            continue;
        }

        if (fileData.length < entry.signature.length) {
            continue;
        }

        // Check if the file starts with the magic number.
        const isSignatureMatching = fileData
            .slice(0, entry.signature.length)
            .every((byte, idx) => byte === entry.signature[idx]);

        if (isSignatureMatching) {
            return {
                decoder: await tryCreateDecoder(entry, fileData, decoderOptions),
                fileTypeDef: entry,
            };
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

    const {
        extension: fileExtension,
        fileTypeDef: extensionFileTypeDef,
    } = getFileMatchingExtension(fileName);

    let fileTypeDef = extensionFileTypeDef;
    let decoder = null;

    // Try to create a decoder based on the file extension.
    if (null !== extensionFileTypeDef) {
        decoder = await tryCreateDecoder(
            extensionFileTypeDef,
            fileData,
            decoderOptions
        );
    }

    // If no decoder was created from the extension, try matching the file signature.
    if (null === decoder) {
        console.warn(`No decoder was created from file extension "${fileExtension}". ` +
            "Trying to match by signature.");
        const signatureResult = await tryCreateDecoderBySignature(fileData, decoderOptions);

        if (null !== signatureResult) {
            ({decoder, fileTypeDef} = signatureResult);
            if (null === decoder) {
                console.warn(`File signature matches ${fileTypeDef.name}, ` +
                    "but decoder creation failed.");
            }
        }
    }

    // eslint-disable-next-line no-warning-comments
    // TODO: support `UNKNOWN` file type definition.
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
