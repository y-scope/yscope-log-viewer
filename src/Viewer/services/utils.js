import MODIFY_PAGE_ACTION from "./MODIFY_PAGE_ACTION";

/**
 * Modifies the page by performing the specified action.
 *
 * @param {string} action
 * @param {number} currentPage
 * @param {number} requestedPage
 * @param {number} pages
 * @return {*}
 */
const modifyPage = (action, currentPage, requestedPage, pages) => {
    let newPage;
    let linePos;
    switch (action) {
        case MODIFY_PAGE_ACTION.firstPage:
            newPage = 1;
            linePos = "top";
            break;
        case MODIFY_PAGE_ACTION.lastPage:
            newPage = pages;
            linePos = "bottom";
            break;
        case MODIFY_PAGE_ACTION.newPage:
            const isValidPage = (requestedPage > 0 && requestedPage <= pages);
            newPage = (isValidPage)?requestedPage:null;
            linePos = "top";
            break;
        case MODIFY_PAGE_ACTION.prevPage:
            newPage = (currentPage - 1 > 0)?currentPage - 1:null;
            linePos = "bottom";
            break;
        case MODIFY_PAGE_ACTION.nextPage:
            newPage = (currentPage + 1 <= pages)?currentPage + 1:null;
            linePos = "top";
            break;
        default:
            newPage = null;
            linePos = null;
            break;
    }

    return [linePos, newPage];
};

/**
 * Updates the URL based on the provided file metadata. If file
 * was downloaded using filePath, indicate the location in URL.
 *
 * @param {object} fileMetadata
 * @param {number} logEventIdx
 */
const modifyFileMetadata = (fileMetadata, logEventIdx) => {
    if (fileMetadata && fileMetadata.filePath) {
        let url = `${window.location.origin}${window.location.pathname}`;
        url += `?filePath=${fileMetadata.filePath}`;
        if (0 !== logEventIdx) {
            url += `#logEventIdx=${logEventIdx}`;
        }
        window.history.pushState({path: url}, "", url);
    } else if (fileMetadata && !fileMetadata.filePath) {
        let url = `${window.location.origin}${window.location.pathname}`;
        if (0 !== logEventIdx) {
            url += `#logEventIdx=${logEventIdx}`;
        }
        window.history.pushState({path: url}, "", url);
    }
};

/**
 * Tests if the provided value is numeric
 *
 * @param {string|number|boolean} value
 * @return {boolean}
 */
function isNumeric (value) {
    if (typeof value === "string") {
        return /^-?\d+$/.test(value);
    } else {
        return (typeof value === "number");
    }
}

/**
 * Given a list of log events, finds the first log event whose timestamp is
 * greater than or equal to the given timestamp, using binary search. The given
 * list must be sorted in increasing timestamp order.
 * @param {number} timestamp The timestamp to search for as milliseconds since
 * the UNIX epoch.
 * @param {Object[]} logEventMetadata An array containing log event metadata
 * objects, where the "timestamp" key in each object is the event's timestamp as
 * milliseconds since the UNIX epoch.
 * @return {number|null} Index of the log event if found, or null otherwise
*/
function binarySearchWithTimestamp (timestamp, logEventMetadata) {
    const length = logEventMetadata.length;

    let low = 0;
    let high = length - 1;
    let mid;

    // Early exit
    if (length === 0) {
        return null;
    }
    if (timestamp <= logEventMetadata[low].timestamp) {
        return low;
    }
    if (logEventMetadata[high].timestamp < timestamp) {
        return null;
    }

    // Notice that the given timestamp might not show up in the events
    // Suppose we have a list of timestamp: [2, 4, 4, 5, 6, 7],
    // if timestamp = 3 is given, we should return the index of the first "4"
    while (low <= high) {
        mid = Math.floor((low + high) / 2);
        if (logEventMetadata[mid].timestamp >= timestamp) {
            if (logEventMetadata[mid - 1].timestamp < timestamp) {
                return mid;
            } else {
                high = mid - 1;
            }
        } else {
            low = mid + 1;
        }
    }

    // Not found
    return null;
}

export {binarySearchWithTimestamp, isNumeric, modifyFileMetadata, modifyPage};
