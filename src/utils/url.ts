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
    } catch (e) {
        path = new URL(path, window.location.origin).href;
    }

    return path;
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

export {
    getAbsoluteUrl,
    getBasenameFromUrlOrDefault,
    openInNewTab,
};
