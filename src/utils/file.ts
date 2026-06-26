import {
    FILE_TYPE_DEFINITIONS,
    type FileTypeDef,
    type OnFileOpenCallback,
} from "../typings/file";


/**
 * Triggers a download of the provided Blob object with the specified file name.
 *
 * @param blob The Blob object to download.
 * @param fileName The name of the file to be downloaded.
 */
const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
};

/**
 * Finds the longest matching extension registered in `FILE_TYPE_DEFINITIONS`.
 *
 * TODO: return UNKNOWN file type for unmatched file names.
 *
 * @param filename
 * @return The matching extension and file type definition. If no registered extension matches,
 * returns the shortest suffix (empty string if the suffix does not exist) and a null file type
 * definition.
 */
const getFileMatchingExtension = (filename: string): {
    fileExtension: string;
    fileTypeDef: FileTypeDef | null;
} => {
    const lowercaseFilename = filename.toLowerCase();
    let fileExtension = "";
    let fileTypeDef = null;

    for (const entry of FILE_TYPE_DEFINITIONS) {
        for (const candidateExtension of entry.extensions) {
            if (lowercaseFilename.endsWith(candidateExtension.toLowerCase()) &&
                fileExtension.length < candidateExtension.length
            ) {
                fileExtension = filename.slice(filename.length - candidateExtension.length);
                fileTypeDef = entry;
            }
        }
    }

    if (null === fileTypeDef) {
        const finalDotIdx = filename.lastIndexOf(".");
        fileExtension = -1 === finalDotIdx ?
            "" :
            filename.slice(finalDotIdx);
    }

    return {
        fileExtension: fileExtension,
        fileTypeDef: fileTypeDef,
    };
};

/**
 * Opens a file and invokes the provided callback on the file.
 *
 * @param onOpen
 */
const openFile = (onOpen: OnFileOpenCallback) => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = (ev: Event) => {
        const target = ev.target as HTMLInputElement;
        const [file] = target.files as FileList;
        if ("undefined" === typeof file) {
            console.error("No file selected");

            return;
        }
        onOpen(file);
    };
    input.click();
};

export {
    downloadBlob,
    getFileMatchingExtension,
    openFile,
};
