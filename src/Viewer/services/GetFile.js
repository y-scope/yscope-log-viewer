import axios from "axios";

/**
 * Custom error class for representing HTTP request errors.
 *
 * @class HTTPRequestError
 * @extends {Error}
 */
class HTTPRequestError extends Error {
    /**
     * Constructs and initializes instance of HTTPRequestError
     *
     * @param {string} url of the HTTP request that resulted in an error
     * @param {number} status code of the response
     * @param {string} statusText of the response
     */
    constructor (url, status, statusText) {
        super(`${url} returned ${status} ${statusText}`);

        this.name = "HTTPRequestError";
        this.url = url;
        this.status = status;
        this.statusText = statusText;
    }
}

/**
 * This callback is used to update the loading progress.
 *
 * @callback ProgressCallback
 * @param {number} numBytesDownloaded Bytes downloaded
 * @param {number} fileSizeBytes Size of file in Bytes
 */
/**
 * Downloads and reads a file with a given URL.
 *
 * @param {string} fileUrl
 * @param {ProgressCallback} progressCallback Callback to update progress
 * @return {Uint8Array} File content
 */
const downloadAndReadFile = async (fileUrl, progressCallback) => {
    try {
        const {data} = await axios.get(fileUrl, {
            responseType: "arraybuffer",
            onDownloadProgress: (progressEvent) => {
                progressCallback(progressEvent.loaded, progressEvent.total);
            },
            headers: {
                "Cache-Control": "no-cache",
                "Pragma": "no-cache",
                "Expires": "0",
            },
        });

        return new Uint8Array(data);
    } catch (e) {
        throw new HTTPRequestError(fileUrl, e.response.status, e.response.data);
    }
};

/**
 * Reads a File object using FileReader.
 *
 * @param {File} file File object to read data from.
 * @param {ProgressCallback} progressCallback Callback to update progress
 * @return {Uint8Array} File content
 */
const readFileObject = (file, progressCallback) => new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
        progressCallback(file.size, file.size);
        resolve(new Uint8Array(reader.result));
    };
    reader.onerror = () => {
        reject(reader.error);
    };

    reader.readAsArrayBuffer(file);
});

/**
 * Input File Information
 *
 * @typedef {Object} FileInfo
 * @property {string} name File name
 * @property {string|null} [filePath] File URL when the file is downloaded
 * @property {Uint8Array} data File content
 */
/**
 * Gets content from an input file. If given `fileSrc` is a string, treat it as
 * a URL and download before getting data.
 *
 * @param {string|File} fileSrc A File object or a file URL to download
 * @param {ProgressCallback} progressCallback Callback to update progress
 * @return {FileInfo} Input File Information which contains the file content
 */
const readFile = async (fileSrc, progressCallback) => {
    let fileInfo = null;

    if (fileSrc instanceof File) {
        const data = await readFileObject(fileSrc, progressCallback);
        fileInfo = {
            name: fileSrc.name,
            filePath: null,
            data: data,
        };
    } else if ("string" === typeof fileSrc) {
        const name = fileSrc.split("/").pop();
        const data = await downloadAndReadFile(fileSrc, progressCallback);
        fileInfo = {
            name: name,
            filePath: fileSrc,
            data: data,
        };
    }

    return fileInfo;
};

export {readFile};
