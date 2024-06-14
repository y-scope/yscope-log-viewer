/**
 * Extracts the basename (filename) from a given URL string.
 *
 * @param urlString
 * @return The extracted basename or "Unknown Filename" if extraction fails.
 */
const getBasenameFromUrl = (urlString: string): string => {
    let basename = "Unknown Filename";
    try {
        const url = new URL(urlString);
        const parts = url.pathname.split("/");
        const popped = parts.pop();
        if ("string" === typeof popped) {
            basename = popped;
        }
    } catch (e) {
        console.error("Error happened in parsing file name");
    }

    return basename;
};

export {getBasenameFromUrl};
