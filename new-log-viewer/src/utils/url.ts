/**
 * Extracts the basename (filename) from a given string containing a URL.
 *
 * @param urlString a URL string that does not contain escaped `/` (%2F).
 * @param defaultFileName
 * @return The extracted basename or "Unknown Filename" if extraction fails.
 */
const getBasenameFromUrlOrDefault = (
    urlString: string,
    defaultFileName: string = "Unknown Filename"
): string => {
    let basename = defaultFileName;
    try {
        const url = new URL(urlString);
        const parts = url.pathname.split("/");
        const popped = parts.pop();
        if ("string" === typeof popped) {
            basename = popped;
        }
    } catch (e) {
        console.error("Error happened in parsing file name", e);
    }

    return basename;
};

export {getBasenameFromUrlOrDefault};
