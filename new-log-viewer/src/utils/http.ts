import axios, {AxiosError} from "axios";


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
 * Downloads (bypassing any caching) a file as a Uint8Array.
 *
 * @param fileUrl
 * @param progressCallback
 * @return The file's content.
 * @throws {Error} if the download fails.
 */
const getUint8ArrayFrom = async (fileUrl: string, progressCallback: ProgressCallback)
    : Promise<Uint8Array> => {
    try {
        const {data} = await axios.get<ArrayBuffer>(fileUrl, {
            responseType: "arraybuffer",
            onDownloadProgress: ({loaded, total}) => {
                if ("undefined" === typeof total) {
                    total = loaded;
                }
                progressCallback(loaded, total);
            },
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


export {getUint8ArrayFrom};
