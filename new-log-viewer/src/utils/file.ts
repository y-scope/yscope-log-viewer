import type {OnFileOpenCallback} from "../typings/file";


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
    openFile,
};
