import axios, {
    AxiosError,
    AxiosProgressEvent,
} from "axios";


type ProgressCallback = (numBytesDownloaded:number, numBytesTotal:number) => void;

/**
 * Converts an Axios error into a custom Error object.
 *
 * @param e The Axios error object.
 * @return The converted error.
 */
const convertAxiosError = (e: AxiosError): Error => {
    const {message, name, response} = e;
    const code = e.code ?? "UNKNOWN CODE";
    const method = e.config?.method ?? "UNKNOWN METHOD";
    const url = e.config?.url ?? "UNKNOWN URL";
    const details = "undefined" === typeof response ?
        `${method} ${url} failed with no response: ${code}` :
        `${method} returned ${response.status}(${response.statusText}): ${response.data as string}`;

    return new Error(
        0 === message.length ?
            `${name}: ${code}` :
            message,
        {
            cause: {
                url: url,
                code: code,
                details: details,
            },
        },
    );
};


/**
 * Normalizes the total size of a download event, and calls the provided onProgress callback with
 * loaded and total sizes.
 *
 * @param onProgress
 * @return The handler that wraps `onProgress`.
 */
const normalizeTotalSize = (onProgress: ProgressCallback) => ({
    loaded,
    total,
}: AxiosProgressEvent) => {
    if ("undefined" === typeof total || isNaN(total)) {
        total = loaded;
    }
    onProgress(loaded, total);
};

/**
 * Retrieves an object that is stored as JSON in a remote location.
 * If the response is not an object, the response is returned as a string.
 *
 * @param remoteUrl
 * @param [onProgress]
 * @return The parsed JSON object.
 * @throws {Error} if the download fails.
 */
const getJsonObjectFrom = async <T>(
    remoteUrl: string,
    onProgress: ProgressCallback = () => null
)
: Promise<T> => {
    try {
        const {data} = await axios.get<T>(remoteUrl, {
            responseType: "json",
            onDownloadProgress: normalizeTotalSize(onProgress),
        });

        return data;
    } catch (e) {
        throw (e instanceof AxiosError) ?
            convertAxiosError(e) :
            e;
    }
};

/**
 * Downloads (bypassing any caching) a file as a Uint8Array.
 *
 * @param fileUrl
 * @param [onProgress]
 * @return The file's content.
 * @throws {Error} if the download fails.
 */
const getUint8ArrayFrom = async (
    fileUrl: string,
    onProgress: ProgressCallback = () => null
)
: Promise<Uint8Array> => {
    try {
        const {data} = await axios.get<ArrayBuffer>(fileUrl, {
            responseType: "arraybuffer",
            onDownloadProgress: normalizeTotalSize(onProgress),
            headers: {
                "Cache-Control": "no-cache",
                "Pragma": "no-cache",
                "Expires": "0",
            },
        });

        return new Uint8Array(data);
    } catch (e) {
        throw (e instanceof AxiosError) ?
            convertAxiosError(e) :
            e;
    }
};

export {
    convertAxiosError,
    getJsonObjectFrom,
    getUint8ArrayFrom,
};
