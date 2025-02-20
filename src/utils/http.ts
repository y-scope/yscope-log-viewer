import axios, {AxiosError} from "axios";

import {JsonValue} from "../typings/js";


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
 * Downloads and parses JSON from the specified remote URL.
 *
 * @param remoteUrl
 * @return The parsed response. If the HTTP response body is not JSON, the body is gracefully
 * returned as a string.
 * @throws {Error} if the download fails.
 */
const getJsonObjectFrom = async (remoteUrl: string)
: Promise<JsonValue> => {
    try {
        const {data} = await axios.get<JsonValue>(remoteUrl, {
            responseType: "json",
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
 * @return The file's content.
 * @throws {Error} if the download fails.
 */
const getUint8ArrayFrom = async (fileUrl: string)
: Promise<Uint8Array> => {
    try {
        const {data} = await axios.get<ArrayBuffer>(fileUrl, {
            responseType: "arraybuffer",
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
    getJsonObjectFrom,
    getUint8ArrayFrom,
};
