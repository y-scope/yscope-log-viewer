/* eslint max-lines: ["error", 400] */
import {
    HASH_PARAM_NAMES,
    SEARCH_PARAM_NAMES,
    UrlHashParams,
    UrlHashParamUpdatesType,
    UrlSearchParams,
    UrlSearchParamUpdatesType,
} from "../typings/url";
import {
    findNearestLessThanOrEqualElement,
    isWithinBounds,
} from "../utils/data";


/**
 * Default values of the search parameters.
 */
const URL_SEARCH_PARAMS_DEFAULT = Object.freeze({
    [SEARCH_PARAM_NAMES.FILE_PATH]: "",
});

/**
 * Default values of the hash parameters.
 */
const URL_HASH_PARAMS_DEFAULT = Object.freeze({
    [HASH_PARAM_NAMES.IS_PRETTIFIED]: false,
    [HASH_PARAM_NAMES.LOG_EVENT_NUM]: 0,
    [HASH_PARAM_NAMES.QUERY_IS_CASE_SENSITIVE]: false,
    [HASH_PARAM_NAMES.QUERY_IS_REGEX]: false,
    [HASH_PARAM_NAMES.QUERY_STRING]: "",
    [HASH_PARAM_NAMES.TIMESTAMP]: -1,
});

/**
 * Regular expression pattern for identifying ambiguous characters in a URL.
 */
const AMBIGUOUS_URL_CHARS_REGEX =
    new RegExp(`${encodeURIComponent("#")}|${encodeURIComponent("&")}`);

/**
 * Gets an absolute URL composed of a given path relative to the
 * window.location, if the given path is a relative reference; otherwise
 * the given path is returned verbatim.
 *
 * @param path The path to be resolved.
 * @return The absolute URL of the given path.
 * @throws {Error} if the given `path` is a relative reference but invalid.
 */
const getAbsoluteUrl = (path: string) => {
    try {
        // eslint-disable-next-line no-new
        new URL(path);
    } catch {
        path = new URL(path, window.location.origin).href;
    }

    return path;
};

/**
 * Parses the URL search parameters from the current window's URL.
 *
 * @return An object containing the parsed search parameters.
 */
const parseWindowUrlSearchParams = () : Partial<UrlSearchParams> => {
    const parsedSearchParams : Partial<UrlSearchParams> = {};
    const searchParams = new URLSearchParams(window.location.search.substring(1));

    searchParams.forEach((value, key) => {
        parsedSearchParams[key as keyof UrlSearchParams] = value;
    });

    if (searchParams.has(SEARCH_PARAM_NAMES.FILE_PATH)) {
        // Extract filePath value by finding the parameter and taking everything after it
        const filePathIndex = window.location.search.indexOf("filePath=");
        if (-1 !== filePathIndex) {
            const filePath = window.location.search.substring(filePathIndex + "filePath=".length);
            if (0 !== filePath.length) {
                let resolvedFilePath = filePath;
                try {
                    resolvedFilePath = getAbsoluteUrl(filePath);
                } catch (e) {
                    console.error("Unable to get absolute URL from filePath:", e);
                }
                parsedSearchParams[SEARCH_PARAM_NAMES.FILE_PATH] = resolvedFilePath;
            }
        }
    }

    return parsedSearchParams;
};

/**
 * Computes updated URL search parameters based on the provided key-value pairs.
 *
 * @param updates An object containing key-value pairs to update the search parameters. If a value
 * is `null`, the corresponding kv-pair will be removed from the updated search parameters.
 * @return The updated search parameters string.
 * @private
 */
const getUpdatedSearchParams = (updates: UrlSearchParamUpdatesType) => {
    const currentSearchParams = parseWindowUrlSearchParams();
    const newSearchParams = new URLSearchParams(currentSearchParams);
    const {filePath: newFilePath} = updates;

    for (const [key, value] of Object.entries(updates)) {
        if (SEARCH_PARAM_NAMES.FILE_PATH as string === key) {
            // Updates to `filePath` should be handled last.
            continue;
        }
        if (value === URL_SEARCH_PARAMS_DEFAULT[key as SEARCH_PARAM_NAMES]) {
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
 * Retrieves all search parameters from the current window's URL.
 *
 * @return An object containing the search parameters.
 */
const getWindowUrlSearchParams = (): UrlSearchParams => ({
    ...URL_SEARCH_PARAMS_DEFAULT,
    ...parseWindowUrlSearchParams(),
});

/**
 * Parses the URL hash parameters from the current window's URL.
 *
 * @return An object containing the parsed hash parameters.
 */
const parseWindowUrlHashParams = () : Partial<UrlHashParams> => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const parsedHashParams: Partial<UrlHashParams> = {};

    hashParams.forEach((value, _key) => {
        const key = _key as HASH_PARAM_NAMES;
        switch (key) {
            case HASH_PARAM_NAMES.LOG_EVENT_NUM: {
                const parsed = Number(value);
                parsedHashParams[key] = Number.isNaN(parsed) ?
                    URL_HASH_PARAMS_DEFAULT[key] :
                    parsed;
                break;
            }
            case HASH_PARAM_NAMES.TIMESTAMP: {
                const parsed = Number(value);
                parsedHashParams[key] = Number.isNaN(parsed) ?
                    URL_HASH_PARAMS_DEFAULT[key] :
                    parsed;
                break;
            }
            case HASH_PARAM_NAMES.IS_PRETTIFIED:

                // Fall through
            case HASH_PARAM_NAMES.QUERY_IS_CASE_SENSITIVE:

                // Fall through
            case HASH_PARAM_NAMES.QUERY_IS_REGEX:
                parsedHashParams[key] = "true" === value;
                break;

            case HASH_PARAM_NAMES.QUERY_STRING:
                parsedHashParams[key] = value;
                break;
            default:
                break;
        }
    });

    return parsedHashParams;
};

/**
 * Computes updated URL hash parameters based on the provided key-value pairs.
 *
 * @param updates An object containing key-value pairs to update the hash parameters. If a key's
 * value is `null`, the key will be removed from the updated hash parameters.
 * @return The updated hash parameters string.
 * @private
 */
const getUpdatedHashParams = (updates: UrlHashParamUpdatesType) => {
    const currentHashParams = parseWindowUrlHashParams();

    // For non-string values, URLSearchParams::new() will convert them to strings.
    const newHashParams = new URLSearchParams(currentHashParams as Record<string, string>);

    for (const [key, value] of Object.entries(updates)) {
        if (value === URL_HASH_PARAMS_DEFAULT[key as HASH_PARAM_NAMES]) {
            newHashParams.delete(key);
        } else {
            newHashParams.set(key, String(value));
        }
    }

    return newHashParams.toString();
};

/**
 * Retrieves all hash parameters from the current window's URL.
 *
 * @return An object containing the hash parameters, including the default values.
 */
const getWindowUrlHashParams = (): UrlHashParams => ({
    ...URL_HASH_PARAMS_DEFAULT,
    ...parseWindowUrlHashParams(),
});

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
 * Extracts the basename (filename) from a given string containing a URL.
 *
 * @param urlString a URL string that does not contain escaped `/` (%2F).
 * @param defaultFileName
 * @return The extracted basename or `defaultFileName` if extraction fails.
 */
const getBasenameFromUrlOrDefault = (
    urlString: string,
    defaultFileName: string = "Unknown filename"
): string => {
    let basename = defaultFileName;
    try {
        const url = new URL(urlString);
        const parts = url.pathname.split("/");

        // Explicit cast since typescript thinks `parts.pop()` can be undefined, but it can't be
        // since `parts` can't be empty.
        basename = parts.pop() as string;
    } catch (e) {
        console.error(`Failed to parse basename from ${urlString}.`, e);
    }

    return basename;
};

/**
 * Opens a given URL in a new browser tab.
 *
 * @param url
 */
const openInNewTab = (url: string): void => {
    window.open(url, "_blank", "noopener");
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
};

/**
 * Updates search parameters in the current window's URL with the given key-value pairs.
 *
 * @param updates An object containing key-value pairs to update the search parameters. If a value
 * is `null`, the corresponding kv-pair will be removed from the URL's search parameters.
 */
const updateWindowUrlSearchParams = (updates: UrlSearchParamUpdatesType) => {
    const newSearch = getUpdatedSearchParams(updates);
    const currSearch = window.location.search.substring(1);
    if (newSearch === currSearch) {
        return;
    }
    const newUrl = new URL(window.location.href);
    newUrl.search = newSearch;
    window.history.pushState({}, "", newUrl);
};

/**
 * Updates the log event number in the URL to `logEventNum` if it's within the bounds of
 * `logEventNumsOnPage`.
 *
 * @param logEventNum
 * @param logEventNumsOnPage
 * @return Whether `logEventNum` is within the bounds of `logEventNumsOnPage`.
 */
const updateUrlIfEventOnPage = (
    logEventNum: number,
    logEventNumsOnPage: number[]
): boolean => {
    if (false === isWithinBounds(logEventNumsOnPage, logEventNum)) {
        return false;
    }

    const nearestIdx = findNearestLessThanOrEqualElement(
        logEventNumsOnPage,
        logEventNum
    );

    // Since `isWithinBounds` returned `true`, then:
    // - `logEventNumsOnPage` must bound `logEventNum`.
    // - `logEventNumsOnPage` cannot be empty.
    // - `nearestIdx` cannot be `null`.
    //
    // Therefore, we can safely cast:
    // - `nearestIdx` from `Nullable<number>` to `number`.
    // - `logEventNumsOnPage[nearestIdx]` from `number | undefined` to `number`.
    const nearestLogEventNum = logEventNumsOnPage[nearestIdx as number] as number;

    updateWindowUrlHashParams({
        logEventNum: nearestLogEventNum,
    });

    return true;
};

export {
    copyPermalinkToClipboard,
    getAbsoluteUrl,
    getBasenameFromUrlOrDefault,
    getWindowUrlHashParams,
    getWindowUrlSearchParams,
    openInNewTab,
    parseWindowUrlHashParams,
    parseWindowUrlSearchParams,
    updateUrlIfEventOnPage,
    updateWindowUrlHashParams,
    updateWindowUrlSearchParams,
    URL_HASH_PARAMS_DEFAULT,
    URL_SEARCH_PARAMS_DEFAULT,
};
