import React, {
    createContext,
    useEffect,
    useState,
} from "react";

import {NullableProperties} from "../typings/common";
import {
    HASH_PARAM_NAME,
    SEARCH_PARAM_NAME,
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
    [SEARCH_PARAM_NAME.FILE_PATH]: null,
});

/**
 * Default values of the hash parameters.
 */
const URL_HASH_PARAMS_DEFAULT = Object.freeze({
    [HASH_PARAM_NAME.LOG_EVENT_NUM]: null,
});

/**
 * Computes updated URL search parameters based on the provided key-value pairs.
 *
 * @param updates An object containing key-value pairs to update the search parameters.
 * If a key's value is `null`, the key will be removed from the search parameters.
 * @return The updated search parameters string.
 */
const getUpdatedSearchParams = (updates: UrlSearchParamUpdatesType) => {
    const newSearchParams = new URLSearchParams(window.location.search.substring(1));
    const {filePath} = updates;

    for (const [key, value] of Object.entries(updates)) {
        if (SEARCH_PARAM_NAME.FILE_PATH as string === key) {
            continue;
        }
        if (null === value) {
            newSearchParams.delete(key);
        } else {
            newSearchParams.set(key, String(value));
        }
    }
    if (null === filePath) {
        newSearchParams.delete(SEARCH_PARAM_NAME.FILE_PATH);
    } else if ("undefined" !== typeof filePath) {
        newSearchParams.set(SEARCH_PARAM_NAME.FILE_PATH, filePath);
    }

    let searchString = newSearchParams.toString();
    if (!(/%23|%26/).test(searchString)) {
        searchString = decodeURIComponent(searchString);
    }

    return searchString;
};

/**
 * Computes updated URL hash parameters based on the provided key-value pairs.
 *
 * @param updates An object containing key-value pairs to update the hash parameters.
 * If a key's value is `null`, the key will be removed from the hash parameters.
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
 * Updates search parameters in the current window's URL based on the provided key-value pairs.
 *
 * @param updates An object containing key-value pairs to update the search parameters.
 * If a key's value is `null`, the key will be removed from the search parameters.
 */
const updateWindowSearchParams = (updates: UrlSearchParamUpdatesType) => {
    const newUrl = new URL(window.location.href);
    newUrl.search = getUpdatedSearchParams(updates);
    window.history.pushState({}, "", newUrl);
};

/**
 * Updates hash parameters in the current window's URL based on the provided key-value pairs.
 *
 * @param updates An object containing key-value pairs to update the hash parameters.
 * If a key's value is `null`, the key will be removed from the hash parameters.
 */
const updateWindowHashParams = (updates: UrlHashParamUpdatesType) => {
    const newHash = getUpdatedHashParams(updates);
    const currHash = window.location.hash.substring(1);
    if (newHash !== currHash) {
        const newUrl = new URL(window.location.href);
        newUrl.hash = newHash;
        window.history.pushState({}, "", newUrl);
        window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
};

/**
 * Retrieves all search parameters from the current window's URL.
 *
 * @return An object containing the search parameters.
 */
const getAllWindowSearchParams = () => {
    const urlSearchParams: NullableProperties<UrlSearchParams> = structuredClone(
        URL_SEARCH_PARAMS_DEFAULT
    );
    const searchParams = new URLSearchParams(window.location.search.substring(1));

    const filePath = searchParams.get(SEARCH_PARAM_NAME.FILE_PATH);
    if (null !== filePath) {
        urlSearchParams[SEARCH_PARAM_NAME.FILE_PATH] = getAbsoluteUrl(filePath);
    }

    return urlSearchParams;
};

/**
 * Retrieves all hash parameters from the current window's URL.
 *
 * @return An object containing the hash parameters.
 */
const getAllWindowHashParams = () => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const urlHashParams: NullableProperties<UrlHashParams> = structuredClone(
        URL_HASH_PARAMS_DEFAULT
    );

    const logEventNum = hashParams.get(HASH_PARAM_NAME.LOG_EVENT_NUM);
    if (null !== logEventNum) {
        const parsed = Number(logEventNum);
        urlHashParams[HASH_PARAM_NAME.LOG_EVENT_NUM] = isNaN(parsed) ?
            null :
            parsed;
    }

    return urlHashParams;
};


/**
 * Copies the current window's URL to the clipboard. If any `updates` parameters are specified,
 * the copied URL will include these modifications, while the original window's URL remains
 * unchanged.
 *
 * @param searchParamUpdates An object containing key-value pairs to update the search parameters.
 * If a key's value is `null`, the key will be removed from the search parameters.
 * @param hashParamsUpdates An object containing key-value pairs to update the hash parameters.
 * If a key's value is `null`, the key will be removed from the hash parameters.
 */
const copyToClipboard = (
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

const searchParams = getAllWindowSearchParams();

interface UrlContextProviderProps {
    children: React.ReactNode
}

/**
 * Provides a context for managing URL parameters and hash values,
 * including utilities for setting search and hash parameters,
 * and copying the current URL with these parameters to the clipboard.
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
        ...getAllWindowHashParams(),
    });

    useEffect(() => {
        const handleHashChange = () => {
            setUrlParams({
                ...URL_SEARCH_PARAMS_DEFAULT,
                ...URL_HASH_PARAMS_DEFAULT,
                ...searchParams,
                ...getAllWindowHashParams(),
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
    copyToClipboard,
    updateWindowHashParams,
    updateWindowSearchParams,
    UrlContext,
};
