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

export {isNumeric, modifyFileMetadata, modifyPage};
