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

export {getBasenameFromUrlOrDefault};
