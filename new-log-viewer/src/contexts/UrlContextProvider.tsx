import React, {
    createContext,
    useEffect,
    useState,
} from "react";
import {
    SEARCH_PARAM_NAME,
    HASH_PARAM_NAME,
    UrlSearchParams,
    UrlHashParams,
    UrlSearchParamUpdatesType,
    UrlHashParamUpdatesType,
    UrlParamsType
} from "../typings/url";


const UrlContext = createContext <UrlParamsType>({} as UrlParamsType);

interface UrlContextProviderProps {
    children: React.ReactNode
}

/**
 * Computes updated URL search parameters based on the provided key-value pairs.
 *
 * @param updates An object containing key-value pairs to update the search parameters.
 * If a key's value is `null`, the key will be removed from the search parameters.
 * @return - The updated search string as a URLSearchParams object.
 */
const getUpdatedSearchParams = (updates: UrlSearchParamUpdatesType) => {
    const newSearchParams = new URLSearchParams(window.location.search.substring(1));
    const {filePath} = updates;

    for (const [key, value] of Object.entries(updates)) {
        if ("filePath" === key) {
            continue;
        }
        if (null === value) {
            newSearchParams.delete(key);
        } else {
            newSearchParams.set(key, String(value));
        }
    }
    if ("string" === typeof filePath) {
        newSearchParams.set("filePath", filePath);
    }

    return newSearchParams;
};

/**
 * Computes updated URL search parameters based on the provided key-value pairs.
 *
 * @param updates An object containing key-value pairs to update the hash parameters.
 * If a key's value is `null`, the key will be removed from the hash parameters.
 * @return - The updated search string as a URLSearchParams object.
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

    return newHashParams;
};

/**
 * Updates search parameters in the current window's URL based on the provided key-value pairs.
 *
 * @param updates An object containing key-value pairs to update the search parameters.
 * If a key's value is `null`, the key will be removed from the search parameters.
 */
const updateWindowSearchParams = (updates: UrlSearchParamUpdatesType) => {
    const newUrl = new URL(window.location.href);
    newUrl.search = getUpdatedSearchParams(updates).toString();
    if (!(/%23|%26/).test(newUrl.search)) {
        newUrl.search = decodeURIComponent(newUrl.search);
    }
    window.history.pushState({}, "", newUrl);
};


/**
 * Updates hash parameters in the current window's URL based on the provided key-value pairs.
 *
 * @param updates An object containing key-value pairs to update the hash parameters.
 * If a key's value is `null`, the key will be removed from the hash parameters.
 */
const updateWindowHashParams = (updates: UrlHashParamUpdatesType) => {
    const newUrl = new URL(window.location.href);
    newUrl.hash = getUpdatedHashParams(updates).toString();
    window.history.pushState({}, "", newUrl);
};

/**
 * Retrieves all search parameters from the current window's URL.
 *
 * @return {UrlSearchParams} An object containing the search parameters.
 */
const getAllWindowSearchParams = () => {
    const urlSearchParams: UrlSearchParams = {};
    const searchParams = new URLSearchParams(window.location.search.substring(1));

    // TODO: use Ajv to read and validate
    const filePath = searchParams.get(SEARCH_PARAM_NAME.FILE_PATH);
    if (null !== filePath) {
        urlSearchParams[SEARCH_PARAM_NAME.FILE_PATH] = filePath;
    }

    return urlSearchParams;
};

/**
 * Retrieves all hash parameters from the current window's URL.
 *
 * @return {UrlHashParams} An object containing the hash parameters.
 */
const getAllWindowHashParams = () => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const urlHashParams: UrlHashParams = {};

    // TODO: use Ajv to read and validate
    const logEventNum = hashParams.get(HASH_PARAM_NAME.LOG_EVENT_NUM);
    if (null !== logEventNum) {
        urlHashParams[HASH_PARAM_NAME.LOG_EVENT_NUM] = Number(logEventNum);
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
    newUrl.search = getUpdatedSearchParams(searchParamUpdates).toString();
    newUrl.hash = getUpdatedHashParams(hashParamsUpdates).toString();
    navigator.clipboard.writeText(newUrl.toString())
        .then(() => {
            console.log("URL copied to clipboard.");
        })
        .catch((error: unknown) => {
            console.error("Failed to copy URL to clipboard:", error);
        });
};

const searchParams = getAllWindowSearchParams();

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
    const [urlParams, setUrlParams] = useState<UrlParamsType>({});

    useEffect(() => {
        setUrlParams({
            ...searchParams,
            ...getAllWindowHashParams(),
        });

        const handleHashChange = () => {
            setUrlParams({
                ...searchParams,
                ...getAllWindowHashParams(),
            });
            console.log({
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
