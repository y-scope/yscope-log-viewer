import React, {
    createContext,
    useEffect,
    useState,
} from "react";

import {NullableProperties} from "../typings/common";
import {
    HASH_PARAM_NAMES,
    SEARCH_PARAM_NAMES,
    UrlHashParams,
    UrlHashParamUpdatesType,
    UrlParamsType,
    UrlSearchParams,
    UrlSearchParamUpdatesType,
} from "../typings/url";
import {getAbsoluteUrl} from "../utils/url";


const UrlContext = createContext <UrlParamsType>({} as UrlParamsType);

/**
 * Default values of the search parameters.
 */
const URL_SEARCH_PARAMS_DEFAULT = Object.freeze({
    [SEARCH_PARAM_NAMES.FILE_PATH]: null,
});

/**
 * Default values of the hash parameters.
 */
const URL_HASH_PARAMS_DEFAULT = Object.freeze({
    [HASH_PARAM_NAMES.LOG_EVENT_NUM]: null,
});

/**
 * Regular expression pattern for identifying ambiguous characters in a URL.
 */
const AMBIGUOUS_URL_CHARS_REGEX =
    new RegExp(`${encodeURIComponent("#")}|${encodeURIComponent("&")}`);

/**
 * Computes updated URL search parameters based on the provided key-value pairs.
 *
 * @param updates An object containing key-value pairs to update the search parameters. If a value
 * is `null`, the corresponding kv-pair will be removed from the updated search parameters.
 * @return The updated search parameters string.
 */
const getUpdatedSearchParams = (updates: UrlSearchParamUpdatesType) => {
    const newSearchParams = new URLSearchParams(window.location.search.substring(1));
    const {filePath: newFilePath} = updates;

    for (const [key, value] of Object.entries(updates)) {
        if (SEARCH_PARAM_NAMES.FILE_PATH as string === key) {
            // Updates to `filePath` should be handled last.
            continue;
        }
        if (null === value) {
            newSearchParams.delete(key);
        } else {
            newSearchParams.set(key, String(value));
        }
    }

    // `filePath` should always be the last search parameter so that:
    // 1. Users can specify a remote filePath (a URL) that itself contains URL parameters without
    //    encoding them. E.g. "<log-viewer-url>/?filePath=https://example.com/log/?p1=v1&p2=v2"
    // 2. Users can easily modify it in the URL
    //
    // NOTE: We're relying on URLSearchParams.set() and URLSearchParams.toString() to store and
    // serialize the parameters in the order that they were set.
    const originalFilePath = newSearchParams.get(SEARCH_PARAM_NAMES.FILE_PATH);
    newSearchParams.delete(SEARCH_PARAM_NAMES.FILE_PATH);
    if ("undefined" === typeof newFilePath && null !== originalFilePath) {
        // If no change in `filePath` is specified, put the original `filePath` back.
        newSearchParams.set(SEARCH_PARAM_NAMES.FILE_PATH, originalFilePath);
    } else if ("undefined" !== typeof newFilePath && null !== newFilePath) {
        // If the new `filePath` has a non-null value, set the value.
        newSearchParams.set(SEARCH_PARAM_NAMES.FILE_PATH, newFilePath);
    }

    // If the stringified search params doesn't contain characters that would make the URL ambiguous
    // to parse, URL-decode it so that the `filePath` remains human-readable. E.g.
    // "filePath=https://example.com/log/?s1=1&s2=2#h1=0" would make the final URL ambiguous to
    // parse since `filePath` itself contains URL parameters.
    let searchString = newSearchParams.toString();
    if (false === AMBIGUOUS_URL_CHARS_REGEX.test(searchString)) {
        searchString = decodeURIComponent(searchString);
    }

    return searchString;
};

/**
 * Computes updated URL hash parameters based on the provided key-value pairs.
 *
 * @param updates An object containing key-value pairs to update the hash parameters. If a key's
 * value is `null`, the key will be removed from the updated hash parameters.
 * @return The updated hash parameters string.
 */
const getUpdatedHashParams = (updates: UrlHashParamUpdatesType) => {
    const newHashParams = new URLSearchParams(window.location.hash.substring(1));
    for (const [key, value] of Object.entries(updates)) {
        if (null === value) {
            newHashParams.delete(key);
        } else {
            newHashParams.set(key, String(value));
        }
    }

    return newHashParams.toString();
};

/**
 * Updates search parameters in the current window's URL with the given key-value pairs.
 *
 * @param updates An object containing key-value pairs to update the search parameters. If a value
 * is `null`, the corresponding kv-pair will be removed from the URL's search parameters.
 */
const updateWindowUrlSearchParams = (updates: UrlSearchParamUpdatesType) => {
    const newUrl = new URL(window.location.href);
    newUrl.search = getUpdatedSearchParams(updates);
    window.history.pushState({}, "", newUrl);
};

/**
 * Updates hash parameters in the current window's URL with the given key-value pairs.
 *
 * @param updates An object containing key-value pairs to update the hash parameters. If a value is
 * `null`, the corresponding kv-pair will be removed from the URL's hash parameters.
 */
const updateWindowUrlHashParams = (updates: UrlHashParamUpdatesType) => {
    const newHash = getUpdatedHashParams(updates);
    const currHash = window.location.hash.substring(1);
    if (newHash === currHash) {
        return;
    }

    const newUrl = new URL(window.location.href);
    newUrl.hash = newHash;
    window.history.pushState({}, "", newUrl);

    // `history.pushState` doesn't trigger a `hashchange`, so we need to dispatch one manually.
    window.dispatchEvent(new HashChangeEvent("hashchange"));
};

/**
 * Copies the current window's URL to the clipboard. If any `updates` parameters are specified,
 * the copied URL will include these modifications, but the original window's URL will not be
 * changed.
 *
 * @param searchParamUpdates An object containing key-value pairs to update the search parameters.
 * If a value is `null`, the corresponding kv-pair will be removed from the URL's search parameters.
 * @param hashParamsUpdates An object containing key-value pairs to update the hash parameters.
 * If a value is `null`, the corresponding kv-pair will be removed from the URL's hash parameters.
 */
const copyPermalinkToClipboard = (
    searchParamUpdates: UrlSearchParamUpdatesType,
    hashParamsUpdates: UrlHashParamUpdatesType,
) => {
    const newUrl = new URL(window.location.href);
    newUrl.search = getUpdatedSearchParams(searchParamUpdates);
    newUrl.hash = getUpdatedHashParams(hashParamsUpdates);
    navigator.clipboard.writeText(newUrl.toString())
        .then(() => {
            console.log("URL copied to clipboard.");
        })
        .catch((error: unknown) => {
            console.error("Failed to copy URL to clipboard:", error);
        });
};

/**
 * Retrieves all search parameters from the current window's URL.
 *
 * @return An object containing the search parameters.
 */
const getWindowUrlSearchParams = () => {
    const searchParams : NullableProperties<UrlSearchParams> = structuredClone(
        URL_SEARCH_PARAMS_DEFAULT
    );
    const urlSearchParams = new URLSearchParams(window.location.search.substring(1));

    if (urlSearchParams.has(SEARCH_PARAM_NAMES.FILE_PATH)) {
        // Split the search string and take everything after as `filePath` value.
        // This ensures any parameters following `filePath=` are incorporated into the `filePath`.
        const [, filePath] = window.location.search.split("filePath=");
        if ("undefined" !== typeof filePath && 0 !== filePath.length) {
            searchParams[SEARCH_PARAM_NAMES.FILE_PATH] = getAbsoluteUrl(filePath);
        }
    }

    return searchParams;
};

/**
 * Retrieves all hash parameters from the current window's URL.
 *
 * @return An object containing the hash parameters.
 */
const getWindowUrlHashParams = () => {
    const urlHashParams: NullableProperties<UrlHashParams> = structuredClone(
        URL_HASH_PARAMS_DEFAULT
    );
    const hashParams = new URLSearchParams(window.location.hash.substring(1));

    const logEventNum = hashParams.get(HASH_PARAM_NAMES.LOG_EVENT_NUM);
    if (null !== logEventNum) {
        const parsed = Number(logEventNum);
        urlHashParams[HASH_PARAM_NAMES.LOG_EVENT_NUM] = Number.isNaN(parsed) ?
            null :
            parsed;
    }

    return urlHashParams;
};

const searchParams = getWindowUrlSearchParams();

interface UrlContextProviderProps {
    children: React.ReactNode
}

/**
 * Provides a context for managing URL search and hash parameters including utilities for setting
 * each, and copying the current URL with these parameters to the clipboard.
 *
 * @param props
 * @param props.children The child components that will have access to the context.
 * @return
 */
const UrlContextProvider = ({children}: UrlContextProviderProps) => {
    const [urlParams, setUrlParams] = useState<UrlParamsType>({
        ...URL_SEARCH_PARAMS_DEFAULT,
        ...URL_HASH_PARAMS_DEFAULT,
        ...searchParams,
        ...getWindowUrlHashParams(),
    });

    useEffect(() => {
        const handleHashChange = () => {
            setUrlParams({
                ...URL_SEARCH_PARAMS_DEFAULT,
                ...URL_HASH_PARAMS_DEFAULT,
                ...searchParams,
                ...getWindowUrlHashParams(),
            });
        };

        window.addEventListener("hashchange", handleHashChange);

        return () => {
            window.removeEventListener("hashchange", handleHashChange);
        };
    }, []);

    return (
        <UrlContext.Provider value={{...urlParams}}>
            {children}
        </UrlContext.Provider>
    );
};

export default UrlContextProvider;
export {
    copyPermalinkToClipboard,
    updateWindowUrlHashParams,
    updateWindowUrlSearchParams,
    URL_HASH_PARAMS_DEFAULT,
    URL_SEARCH_PARAMS_DEFAULT,
    UrlContext,
};
