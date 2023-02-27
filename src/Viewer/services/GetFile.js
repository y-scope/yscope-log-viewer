/**
 * Error class for HTTP requests
 */
class HTTPRequestError extends Error {
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
 * Creates a promise that downloads a file with the given URL or gets
 * the data from input file. The given callback is called whenever
 * the download makes progress.
 *
 * @param {string|object} fileInfo A File object or a file path to download
 * @param {ProgressCallback} progressCallback Callback to update progress
 * @return {Promise<Uint8Array>} A promise that resolves with the file's content
 */
function readFile (fileInfo, progressCallback) {
    return new Promise(async (resolve, reject) => {
        if (fileInfo instanceof File) {
            readFileInputPromise(fileInfo, progressCallback).then((data) => {
                resolve({
                    name: fileInfo.name,
                    filePath: null,
                    data: data,
                });
            }).catch((reason) => {
                reject(reason);
            });
        } else if (typeof fileInfo == "string") {
            const name = fileInfo.split("/").pop();
            getFetchFilePromise(fileInfo, progressCallback).then((data) => {
                resolve({
                    name: name,
                    filePath: fileInfo,
                    data: data,
                });
            }).catch((reason) => {
                reject(reason);
            });
        } else {
            reject(new Error("Invalid file"));
        }
    });
}

/**
 * Creates a promise that downloads a file with the given URL. The given
 * callback is called whenever the download makes progress.
 *
 * @param {string} fileUrl
 * @param {ProgressCallback} progressCallback Callback to update progress
 * @return {Promise<Uint8Array>} A promise that resolves with the file's content
 */
function getFetchFilePromise (fileUrl, progressCallback) {
    return new Promise(async (resolve, reject) => {
        fetch(fileUrl, {cache: "no-cache"}).then(async (response) => {
            if (false === response.ok) {
                throw new HTTPRequestError(fileUrl, response.status, response.statusText);
            }
            const reader = response.body.getReader();
            const totalBytes = +response.headers.get("Content-Length");

            let receivedBytes = 0;
            const chunks = [];
            while (true) {
                const {done, value} = await reader.read();
                if (done) {
                    break;
                }
                chunks.push(value);
                receivedBytes += value.length;
                progressCallback(receivedBytes, totalBytes);
                console.debug(`Received ${receivedBytes}B of ${totalBytes}B`);
            }

            const concatenatedChunks = new Uint8Array(receivedBytes);
            let pos = 0;
            for (const chunk of chunks) {
                concatenatedChunks.set(chunk, pos);
                pos += chunk.length;
            }
            resolve(concatenatedChunks);
        }).catch((reason) => {
            reject(reason);
        });
    });
}

/**
 * Get the size of a file.
 *
 * @param {string} url
 * @param {function} updateSizeCallback
 */
function getFileSize (url, updateSizeCallback) {
    fetch(url, {method: "HEAD"})
        .then(function (response) {
            if (response.ok) {
                updateSizeCallback(parseInt(response.headers.get("Content-Length")));
                return parseInt(response.headers.get("Content-Length"));
            } else {
                console.error(`Failed to get file size for ${url} -`,
                    `${response.status} ${response.statusText}`);
            }
        })
        .catch(function (reason) {
            console.error(`Failed to get file size for ${url} - ${reason}`);
        });
}

/**
 * Reads a file object using FileReader, resolves with the data from the file.
 *
 * @param {File} file File object to read data from.
 * @param {ProgressCallback} progressCallback Callback to update progress
 * @return {Promise<Uint8Array>} A promise that resolves with the file's content
 */
function readFileInputPromise (file, progressCallback) {
    return new Promise(async (resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            progressCallback(file.size, file.size);
            resolve(new Uint8Array(event.target.result));
        };
        // TODO Revisit errors when trying to read the file.
        reader.onerror = () => {
            reject(reader.error);
        };
        reader.readAsArrayBuffer(file);
    });
}

export {readFile};
