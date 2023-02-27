import CLP_WORKER_PROTOCOL from "./CLP_WORKER_PROTOCOL";
import FileManager from "./decoder/FileManager";

/**
 * Sends loading status update and displays message in console.
 *
 * @param {string} msg
 * @param {boolean} error
 */
const updateLoadingMessage = (msg, error) => {
    postMessage({
        code: CLP_WORKER_PROTOCOL.LOADING_MESSAGES,
        status: msg,
        error: error,
    });
    console.debug(msg);
};

/**
 * Send the updated state to the component which created the worker.
 *
 * @param {number} code
 * @param {object} state
 */
const updateState = (code, state) => {
    postMessage({
        code: code,
        state: state,
    });
};

/**
 * Send the newly decoded logs to the component which
 * created the worker.
 *
 * @param {string} logs
 */
const updateLogs = (logs) => {
    postMessage({
        code: CLP_WORKER_PROTOCOL.LOAD_LOGS,
        logs: logs,
    });
};

/**
 * Send the file information.
 *
 * @param {string} fileState
 */
const updateFileInfo = (fileState) => {
    postMessage({
        code: CLP_WORKER_PROTOCOL.UPDATE_FILE_INFO,
        fileState: fileState,
    });
};

/**
 * Send error to component which created worker.
 *
 * @param {string} error
 */
const sendError = (error) => {
    postMessage({
        code: CLP_WORKER_PROTOCOL.ERROR,
        error: error,
    });
    console.debug(error);
};

let fileInstance = null;
onmessage = function (e) {
    switch (e.data.code) {
        case CLP_WORKER_PROTOCOL.LOAD_FILE:
            try {
                fileInstance = new FileManager(e.data.fileInfo, e.data.prettify,
                    updateLoadingMessage, e.data.logEventIdx, e.data.pageSize,
                    updateState, updateLogs, updateFileInfo);
                fileInstance.decompressAndLoadFile();
            } catch (e) {
                sendError(e.toString());
            }
            break;

        case CLP_WORKER_PROTOCOL.UPDATE_VERBOSITY:
            try {
                fileInstance.changeVerbosity(e.data.verbosity);
            } catch (e) {
                sendError(e.toString());
            }
            break;

        case CLP_WORKER_PROTOCOL.CHANGE_PAGE:
            try {
                fileInstance.changePage(e.data.page, e.data.linePos);
            } catch (e) {
                sendError(e.toString());
            }
            break;

        case CLP_WORKER_PROTOCOL.PRETTY_PRINT:
            try {
                fileInstance.changePrettify(e.data.prettify);
            } catch (e) {
                sendError(e.toString());
            }
            break;

        case CLP_WORKER_PROTOCOL.GET_LINE_FROM_EVENT:
            try {
                fileInstance.changeEvent(e.data.desiredLogEventIdx);
            } catch (e) {
                sendError(e.toString());
            }
            break;

        case CLP_WORKER_PROTOCOL.GET_EVENT_FROM_LINE:
            try {
                fileInstance.changeLine(e.data.lineNumber, e.data.columnNumber);
            } catch (e) {
                sendError(e.toString());
            }
            break;

        case CLP_WORKER_PROTOCOL.REDRAW_PAGE:
            try {
                fileInstance.redraw(e.data.pageSize);
            } catch (e) {
                sendError(e.toString());
            }
            break;

        default:
            break;
    }
};

onerror = (e) => {
    console.debug(e);
};
