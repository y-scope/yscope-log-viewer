import ActionHandler from "./ActionHandler";
import CLP_WORKER_PROTOCOL from "./CLP_WORKER_PROTOCOL";

/**
 * Send error to component which created worker.
 * @param {string} error
 */
const sendError = (error) => {
    postMessage({
        code: CLP_WORKER_PROTOCOL.ERROR,
        error: error.toString(),
    });
    console.debug(error);
};

let handler = null;
onmessage = function (e) {
    switch (e.data.code) {
        case CLP_WORKER_PROTOCOL.LOAD_FILE:
            try {
                const fileInfo = e.data.fileInfo;
                const prettify = e.data.prettify;
                const logEventIdx = e.data.logEventIdx;
                const pageSize = e.data.pageSize;
                const initialTimestamp = e.data.initialTimestamp;
                handler = new ActionHandler(fileInfo, prettify, logEventIdx, initialTimestamp,
                    pageSize);
            } catch (e) {
                sendError(e);
            }
            break;

        case CLP_WORKER_PROTOCOL.UPDATE_VERBOSITY:
            try {
                handler.changeVerbosity(e.data.verbosity);
            } catch (e) {
                sendError(e);
            }
            break;

        case CLP_WORKER_PROTOCOL.CHANGE_PAGE:
            try {
                handler.changePage(e.data.page, e.data.linePos);
            } catch (e) {
                sendError(e);
            }
            break;

        case CLP_WORKER_PROTOCOL.PRETTY_PRINT:
            try {
                handler.changePrettify(e.data.prettify);
            } catch (e) {
                sendError(e);
            }
            break;

        case CLP_WORKER_PROTOCOL.GET_LINE_FROM_EVENT:
            try {
                handler.changeEvent(e.data.desiredLogEventIdx);
            } catch (e) {
                sendError(e);
            }
            break;

        case CLP_WORKER_PROTOCOL.GET_EVENT_FROM_LINE:
            try {
                handler.changeLine(e.data.lineNumber, e.data.columnNumber);
            } catch (e) {
                sendError(e);
            }
            break;

        case CLP_WORKER_PROTOCOL.REDRAW_PAGE:
            try {
                handler.redraw(e.data.pageSize);
            } catch (e) {
                sendError(e);
            }
            break;

        default:
            break;
    }
};

onerror = (e) => {
    console.debug(e);
};
