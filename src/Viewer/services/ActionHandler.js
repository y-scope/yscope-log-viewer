import CLP_WORKER_PROTOCOL from "./CLP_WORKER_PROTOCOL";
import FileManager from "./decoder/FileManager";
import {isBoolean, isNumeric} from "./decoder/utils";

// TODO: Move decompressing of file from FileManager to ActionHandler.
//  When there are multiple IRStreams in a single file, this will allow
//  the creation of multiple FileManagers. When this feature is implemented,
//  the action handler will contain multiple IRStreams and user can be prompted
//  for which IRStream they want to load in the current viewer.

/**
 * Manages all the actions that can be executed on provided file. In the future,
 * this action handler will also be used to execute jobs on file data.
 */
class ActionHandler {
    /**
     * Initialize the action handler.
     */
    constructor () {
        this._logFile = null;
    }

    /**
     * Creates a new FileManager object and initiates the download.
     *
     * @param {String|File} fileInfo
     * @param {boolean} prettify
     * @param {Number} logEventIdx
     * @param {Number} pageSize
     */
    loadFile (fileInfo, prettify, logEventIdx, pageSize) {
        this._logFile = new FileManager(fileInfo, prettify,
            logEventIdx, pageSize, this._loadingMessageCallback, this._updateStateCallback,
            this._updateLogsCallback, this._updateFileInfoCallback);
        this._logFile.decompressAndLoadFile();
    }

    /**
     * Filters the events at the given verbosity and rebuilds the pages.
     *
     * @param {number} desiredVerbosity
     */
    changeVerbosity (desiredVerbosity) {
        if (!isNumeric(desiredVerbosity)) {
            throw (new Error("Invalid verbosity provided."));
        }
        this._logFile._state.verbosity = desiredVerbosity;
        this._logFile.filterLogEvents(desiredVerbosity);
        this._logFile.createPages();
        this._logFile.getPageOfLogEvent();
        this._logFile.decodePage();
        this._logFile.getLineNumberOfLogEvent();

        // When changing verbosity, if the current log event gets removed
        // by the filter, get the new log event.
        this._logFile.getLogEventFromLineNumber();
        this._updateStateCallback(CLP_WORKER_PROTOCOL.UPDATE_STATE, this._logFile._state);
    }

    /**
     * Go to the selected page and decode the relevant logs. linePos
     * indicates if the new page should be loaded with selected line
     * on top or bottom of page.
     *
     * @param {number} page
     * @param {string} linePos
     */
    changePage (page, linePos) {
        if (!isNumeric(page)) {
            throw (new Error("Invalid page number provided."));
        }
        if (page <= 0 || page > this._logFile._state.pages) {
            throw (new Error("Invalid page number provided."));
        }
        this._logFile._state.page = page;
        this._logFile.decodePage();

        if (linePos === "top") {
            this._logFile._state.lineNumber = 1;
        } else if (linePos === "bottom") {
            this._logFile._state.lineNumber = this._logFile._logEventMetadata.reduce(
                function (a, b) {
                    return a + b.numLines;
                }, 0);
        } else {
            this._logFile._state.lineNumber = 1;
        }

        this._logFile.getLogEventFromLineNumber();
        this._updateStateCallback(CLP_WORKER_PROTOCOL.UPDATE_STATE, this._logFile._state);
    }

    /**
     * Set prettify state, rebuild the page and update line number
     * for the log event.
     *
     * @param {boolean} prettify
     */
    changePrettify (prettify) {
        if (!isBoolean(prettify)) {
            throw (new Error("Invalid prettify state provided"));
        }
        this._logFile._state.prettify = prettify;
        this._logFile.decodePage();
        this._logFile.getLineNumberOfLogEvent();
        this._updateStateCallback(CLP_WORKER_PROTOCOL.UPDATE_STATE, this._logFile._state);
    }

    /**
     * Goes to the specified log event. Go to new page if needed.
     *
     * @param {number} logEventIdx
     */
    changeEvent (logEventIdx) {
        if (!isNumeric(logEventIdx)) {
            throw (new Error("Invalid logEventIdx provided."));
        }
        if (logEventIdx > this._logFile._state.numberOfEvents) {
            console.debug("Log event provided was larger than the number of events.");
        } else if (logEventIdx <= 0) {
            console.debug("Log event provided was less than or equal to zero.");
        } else {
            this._logFile._state.logEventIdx = logEventIdx;
        }
        const currentPage = this._logFile._state.page;
        this._logFile.getPageOfLogEvent();
        // If the new event is on a new page, decode the page
        if (currentPage !== this._logFile._state.page) {
            this._logFile.decodePage();
        }
        this._logFile.getLineNumberOfLogEvent();
        this._updateStateCallback(CLP_WORKER_PROTOCOL.UPDATE_STATE, this._logFile._state);
    };

    /**
     * Get the log event given a line number.
     *
     * @param {number} lineNumber
     * @param {number} columnNumber
     */
    changeLine (lineNumber, columnNumber) {
        if (!isNumeric(lineNumber)) {
            throw (new Error("Invalid line number provided."));
        }
        this._logFile._state.lineNumber = lineNumber;
        this._logFile._state.columnNumber = columnNumber;
        this._logFile.getLogEventFromLineNumber();
        this._updateStateCallback(CLP_WORKER_PROTOCOL.UPDATE_STATE, this._logFile._state);
    };

    /**
     * Redraws the page with the new page size.
     *
     * @param {number} pageSize
     */
    redraw (pageSize) {
        if (!isNumeric(pageSize)) {
            throw (new Error("Invalid page size provided."));
        }
        this._logFile._state.pageSize = pageSize;
        this._logFile.createPages();
        this._logFile.getPageOfLogEvent();
        this._logFile.decodePage();
        this._logFile.getLineNumberOfLogEvent();
        this._updateStateCallback(CLP_WORKER_PROTOCOL.UPDATE_STATE, this._logFile._state);
    }

    /**
     * Send the newly decoded logs
     *
     * @param {string} logs
     */
    _updateLogsCallback = (logs) => {
        postMessage({
            code: CLP_WORKER_PROTOCOL.LOAD_LOGS,
            logs: logs,
        });
    };

    /**
     * Send the updated state.
     *
     * @param {number} code
     * @param {object} state
     */
    _updateStateCallback = (code, state) => {
        postMessage({
            code: code,
            state: state,
        });
    };

    /**
     * Sends loading status update and displays message in console.
     *
     * @param {string} msg
     * @param {boolean} error
     */
    _loadingMessageCallback = (msg, error) => {
        postMessage({
            code: CLP_WORKER_PROTOCOL.LOADING_MESSAGES,
            status: msg,
            error: error,
        });
        console.debug(msg);
    };


    /**
     * Send the file information.
     *
     * @param {string} fileState
     */
    _updateFileInfoCallback = (fileState) => {
        postMessage({
            code: CLP_WORKER_PROTOCOL.UPDATE_FILE_INFO,
            fileState: fileState,
        });
    };
}

export default ActionHandler;
