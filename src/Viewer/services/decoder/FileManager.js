import {ZstdCodec} from "../../../../customized-packages/zstd-codec/js";
import CLP_WORKER_PROTOCOL from "../CLP_WORKER_PROTOCOL";
import {readFile} from "../GetFile";
import {DataInputStream, DataInputStreamEOFError} from "./DataInputStream";
import FourByteClpIrStreamReader from "./FourByteClpIrStreamReader";
import ResizableUint8Array from "./ResizableUint8Array";
import SimplePrettifier from "./SimplePrettifier";
import {formatSizeInBytes, isBoolean, isNumeric} from "./utils";

/**
 * File manager to manage and track state of each file that is loaded.
 */
class FileManager {
    /**
     * Initializes the class and sets the default states.
     *
     * @param {string} fileInfo
     * @param {boolean} prettify
     * @param {function} loadingMessageCallback
     * @param {number} logEventIdx
     * @param {number} pageSize
     * @param {function} updateStateCallback
     * @param {function} updateLogsCallback
     * @param {updateFileInfoCallback} updateFileInfoCallback
     */
    constructor (fileInfo, prettify, loadingMessageCallback, logEventIdx,
        pageSize, updateStateCallback, updateLogsCallback, updateFileInfoCallback) {
        this._fileInfo = fileInfo;
        this._prettify = prettify;
        this._logEventOffsets = [];
        this._logEventOffsetsFiltered = [];
        this._logEventMetadata = [];
        this._irStreamReader = null;
        this._displayedMinVerbosityIx = -1;
        this._arrayBuffer;
        this._outputResizableBuffer = null;
        this._availableVerbosityIndexes = new Set();

        this._fileState = {
            name: null,
            path: null,
        };

        this._state = {
            pageSize: pageSize,
            pages: null,
            page: null,
            prettify: prettify,
            logEventIdx: logEventIdx,
            lineNumber: null,
            columnNumber: null,
            numberOfEvents: null,
            verbosity: null,
        };

        this._logs = "";

        this._loadState = {
            prevCheckTime: null,
        };

        this._textDecoder = new TextDecoder();
        this._prettifier = new SimplePrettifier();
        this._minAvailableVerbosityIx = FourByteClpIrStreamReader.VERBOSITIES.length - 1;

        this._loadingMessageCallback = loadingMessageCallback;
        this._updateStateCallback = updateStateCallback;
        this._updateLogsCallback = updateLogsCallback;
        this._updateFileInfoCallback = updateFileInfoCallback;

        this._PRETTIFICATION_THRESHOLD = 200;
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
        this._state.verbosity = desiredVerbosity;
        this._filterLogEvents(desiredVerbosity);
        this._createPages();
        this._getPageOfLogEvent();
        this._decodePage();
        const [colNumber, lineNumber] = this._getLineNumberOfLogEvent(this._state.logEventIdx);
        this._state.columnNumber = colNumber;
        this._state.lineNumber = lineNumber;

        // When changing verbosity, if the current log event gets removed
        // by the filter, get the new log event.
        this._getLogEventFromLineNumber();
        this._updateStateCallback(CLP_WORKER_PROTOCOL.UPDATE_STATE, this._state);
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
        if (page <= 0 || page > this._state.pages) {
            throw (new Error("Invalid page number provided."));
        }
        this._state.page = page;
        this._decodePage();

        if (linePos === "top") {
            this._state.lineNumber = 1;
        } else if (linePos === "bottom") {
            this._state.lineNumber = this._logEventMetadata.reduce( function (a, b) {
                return a + b.numLines;
            }, 0);
        } else {
            this._state.lineNumber = 1;
        }

        this._getLogEventFromLineNumber();
        this._updateStateCallback(CLP_WORKER_PROTOCOL.UPDATE_STATE, this._state);
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
        this._state.prettify = prettify;
        this._decodePage();
        const [colNumber, lineNumber] = this._getLineNumberOfLogEvent(this._state.logEventIdx);
        this._state.columnNumber = colNumber;
        this._state.lineNumber = lineNumber;
        this._updateStateCallback(CLP_WORKER_PROTOCOL.UPDATE_STATE, this._state);
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
        if (logEventIdx > this._state.numberOfEvents) {
            console.debug("Log event provided was larger than the number of events.");
        } else if (logEventIdx <= 0) {
            console.debug("Log event provided was less than or equal to zero.");
        } else {
            this._state.logEventIdx = logEventIdx;
        }
        const currentPage = this._state.page;
        this._state.page = this._findPageFromEvent(this._state.logEventIdx);
        if (currentPage !== this._state.page) {
            this._decodePage();
        }
        const [colNumber, lineNumber] = this._getLineNumberOfLogEvent(this._state.logEventIdx);
        this._state.columnNumber = colNumber;
        this._state.lineNumber = lineNumber;
        this._updateStateCallback(CLP_WORKER_PROTOCOL.UPDATE_STATE, this._state);
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
        this._state.lineNumber = lineNumber;
        this._state.columnNumber = columnNumber;
        this._getLogEventFromLineNumber();
        this._updateStateCallback(CLP_WORKER_PROTOCOL.UPDATE_STATE, this._state);
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
        this._state.pageSize = pageSize;
        this._createPages();
        this._decodePage();
        const [colNumber, lineNumber] = this._getLineNumberOfLogEvent(this._state.logEventIdx);
        this._state.columnNumber = colNumber;
        this._state.lineNumber = lineNumber;
        this._updateStateCallback(CLP_WORKER_PROTOCOL.UPDATE_STATE, this._state);
    }

    /**
     * Callback when progress is updated in file getXMLHttpRequest.
     *
     * @param {number} numBytesDownloaded Number of bytes downloaded
     * @param {number} fileSizeBytes Total file size
     * @private
     */
    _updateFileLoadProgress = (numBytesDownloaded, fileSizeBytes) => {
        const percentComplete = (numBytesDownloaded / fileSizeBytes) * 100;
        if (this._loadState.prevCheckTime != null) {
            const loadedTime = performance.now()-this._loadState.prevCheckTime;
            const downloadSpeed =
                `${formatSizeInBytes(numBytesDownloaded/(loadedTime/1000), false)}/s`;
            this._loadingMessageCallback(
                `Download Progress: ${percentComplete.toFixed(2)}% at ${downloadSpeed}`
            );
        } else {
            this._loadingMessageCallback(`Download Progress: ${percentComplete.toFixed(2)}%`);
            this._loadState.prevCheckTime = performance.now();
        }
    };

    /**
     * Callback when file is size is received from getXMLHttpRequest.
     *
     * @param {event} evt
     * @private
     */
    _updateFileSize = (evt) => {
        this._loadingMessageCallback(
            `Loading ${formatSizeInBytes(evt, false)} file from object store...`
        );
    };

    /**
     * Decompresses and loads file. Sends updated state to viewer.
     */
    decompressAndLoadFile () {
        Promise.all([
            new Promise((resolve) => {
                ZstdCodec.run((zstd) => resolve(new zstd.Streaming()));
            }),
            readFile(this._fileInfo, this._updateFileLoadProgress, this._updateFileSize),
        ]).then(([zstdStreaming, file]) => {
            this._fileState = file;
            this._updateFileInfoCallback(this._fileState);

            this._loadingMessageCallback(
                `Decompressing ${formatSizeInBytes(file.data.byteLength, false)}.`
            );
            this._arrayBuffer = zstdStreaming.decompress(file.data).buffer;
            const decompressedBytes = formatSizeInBytes(this._arrayBuffer.byteLength, false);
            this._loadingMessageCallback(`Decompressed ${decompressedBytes}.`);

            this._buildIndex();
            this._filterLogEvents(-1);

            const numberOfEvents = this._logEventOffsets.length;
            if (null === this._state.logEventIdx || this._state.logEventIdx > numberOfEvents ||
                this._state.logEventIdx <= 0) {
                this._state.logEventIdx = numberOfEvents;
            }

            this._createPages();
            this._state.page = this._findPageFromEvent(this._state.logEventIdx);

            this._decodePage();

            const [colNumber, lineNumber] = this._getLineNumberOfLogEvent(this._state.logEventIdx);
            this._state.columnNumber = colNumber;
            this._state.lineNumber = lineNumber;
            this._updateStateCallback(CLP_WORKER_PROTOCOL.UPDATE_STATE, this._state);
        }).catch((reason) => {
            if (reason instanceof DataInputStreamEOFError) {
                // If the file is truncated, send back a user-friendly error
                this._loadingMessageCallback("Error: IRStream truncated", true);
            } else {
                this._loadingMessageCallback(reason.message, true);
            }
            console.error(reason);
        });
    };

    /**
     * Builds file index from startIndex, endIndex, verbosity,
     * timestamp for each log event.
     */
    _buildIndex () {
        // Building log event offsets
        const dataInputStream = new DataInputStream(this._arrayBuffer);
        this._outputResizableBuffer = new ResizableUint8Array(511000000);
        this._irStreamReader = new FourByteClpIrStreamReader(dataInputStream,
            this._prettify ? this._prettifyLogEventContent : null);

        try {
            while (this._irStreamReader.indexNextLogEvent(this._logEventOffsets)) {}
        } catch (error) {
            // Ignore EOF errors since we should still be able
            // to print the decoded messages
            if (error instanceof DataInputStreamEOFError) {
                // TODO Give visual indication the stream is truncated to user
                console.error("Stream truncated!");
            } else {
                throw error;
            }
        }

        this._state.numberOfEvents = this._logEventOffsets.length;
    };

    /**
     * Gets the page of the current log event
     */
    _getPageOfLogEvent () {
        for (let index = 0; index < this._logEventOffsetsFiltered.length; index++) {
            const event = this._logEventOffsetsFiltered[index];
            const logEventIndex = event.mappedIndex + 1;
            if (logEventIndex >= this._state.logEventIdx) {
                this._state.page = Math.floor(index / this._state.pageSize)+1;
                break;
            }
        }
    };

    /**
     * Creates pages from the filtered log events and the page size.
     */
    _createPages () {
        if (this._logEventOffsetsFiltered.length <= this._state.pageSize) {
            this._state.page = 1;
            this._state.pages = 1;
        } else {
            const numOfEvents = this._logEventOffsetsFiltered.length;
            if (0 === numOfEvents % this._state.pageSize) {
                this._state.pages = Math.floor(numOfEvents/this._state.pageSize);
            } else {
                this._state.pages = Math.floor(numOfEvents/this._state.pageSize) + 1;
            }

            this._state.page = this._state.pages;
        }
    };

    /**
     * Finds the page where the selected event is on.
     *
     * @param {number} logEventIdx
     * @return {null|number}
     */
    _findPageFromEvent (logEventIdx) {
        // If logEventIdx is greater than the total
        // number of log events, limit the logEventIdx
        if (logEventIdx && logEventIdx > this._logEventOffsets.length) {
            logEventIdx = this._logEventOffsetsFiltered.length;
        }

        for (let eventIndex = 0; eventIndex < this._logEventOffsetsFiltered.length; eventIndex++) {
            const mappedIndex = this._logEventOffsetsFiltered[eventIndex].mappedIndex;
            if (mappedIndex >= logEventIdx) {
                return Math.floor(eventIndex / this._state.pageSize) + 1;
            }
        }

        return this._state.pages;
    };

    /**
     * Decodes the logs for the selected page (_state.page).
     */
    _decodePage () {
        const numOfEvents = this._logEventOffsetsFiltered.length;
        let logs;

        // If there are no logs at this verbosity level, return
        if (0 === numOfEvents) {
            logs = "No logs at selected verbosity level";
            this._updateLogsCallback(logs);
            return;
        }

        // Calculate where to start decoding from and how many events to decode
        // Corner case for the final page where the number of
        // events is likely less than pageSize.
        let logEventTarget;
        let numberOfEvents;
        if (this._state.page === this._state.pages) {
            numberOfEvents = numOfEvents - ((this._state.page-1) * this._state.pageSize);
            logEventTarget = numOfEvents - numberOfEvents;
        } else {
            numberOfEvents = (numOfEvents > this._state.pageSize)?this._state.pageSize:numOfEvents;
            logEventTarget = ((this._state.page-1) * this._state.pageSize);
        }

        const dataInputStream = new DataInputStream(this._arrayBuffer);
        this._outputResizableBuffer = new ResizableUint8Array(511000000);
        this._irStreamReader = new FourByteClpIrStreamReader(dataInputStream,
            this._state.prettify ? this._prettifyLogEventContent : null);

        this._availableVerbosityIndexes = new Set();
        this._logEventMetadata = [];
        for (let i = logEventTarget; i < logEventTarget + numberOfEvents; i++) {
            const event = this._logEventOffsetsFiltered[i];
            const decoder = this._irStreamReader._streamProtocolDecoder;

            this._irStreamReader._dataInputStream.seek(event.startIndex);

            // Set the timestamp before decoding the message.
            // If it is first message, use timestamp in metadata.
            if (event.mappedIndex === 0) {
                decoder._reset();
            } else {
                decoder._setTimestamp(this._logEventOffsets[event.mappedIndex-1].timestamp);
            }

            try {
                this._irStreamReader.readAndDecodeLogEvent(
                    this._outputResizableBuffer,
                    this._logEventMetadata
                );
                const lastEvent = this._logEventMetadata[this._logEventMetadata.length - 1];
                this._availableVerbosityIndexes.add(lastEvent["verbosityIx"]);
                lastEvent.mappedIndex = event.mappedIndex;
            } catch (error) {
                // Ignore EOF errors since we should still be able
                // to print the decoded messages
                if (error instanceof DataInputStreamEOFError) {
                    // TODO Give visual indication that the stream is truncated
                    console.error("Stream truncated.");
                } else {
                    console.log("random error");
                    throw error;
                }
            }
        }

        // Decode the text and set the available verbosities
        logs = this._textDecoder.decode(this._outputResizableBuffer.getUint8Array());

        for (const verbosityIx of this._availableVerbosityIndexes) {
            if (verbosityIx < this._minAvailableVerbosityIx) {
                this._minAvailableVerbosityIx = verbosityIx;
            }
        }
        this._displayedMinVerbosityIx = this._minAvailableVerbosityIx;
        this._logs = logs.trim();
        this._updateLogsCallback(this._logs);
    };

    /**
     * Get the long event from the selected line number
     */
    _getLogEventFromLineNumber () {
        // If there are no logs, return
        if (this._logEventMetadata.length === 0) {
            this._state.logEventIdx = null;
            return;
        }
        let trackedLineNumber = this._state.lineNumber;
        let numLines = 0;
        --trackedLineNumber;
        for (let i = 0; i < this._logEventMetadata.length; ++i) {
            const metadata = this._logEventMetadata[i];
            if (metadata.verbosityIx >= this._displayedMinVerbosityIx) {
                numLines += metadata.numLines;
                if (numLines > trackedLineNumber) {
                    this._state.logEventIdx = metadata.mappedIndex + 1;
                    break;
                }
            }
        }
    };

    /**
     * Get the line number from the log event.
     *
     * @param {number} logEventIdx
     * @return {[number,number]}
     */
    _getLineNumberOfLogEvent (logEventIdx) {
        // If there are no logs, go to line 1
        if (0 === this._logEventOffsetsFiltered.length) {
            return [1, 1];
        }

        if (0 === logEventIdx) {
            throw new Error("0 is not a valid logEventIdx");
        }

        let lineNumberFound = 1;
        for (let i = 0; i < this._logEventMetadata.length; ++i) {
            // Mapped index is zero indexed, so we need to add one more to it
            if (this._logEventMetadata[i].mappedIndex + 1 >= logEventIdx) {
                // We"ve passed the log event
                // foundLogEventIdx = this._logEventMetadata[i].mappedIndex + 1;
                break;
            }
            lineNumberFound += this._logEventMetadata[i].numLines;
        }

        const colNumber = 1;
        return [colNumber, lineNumberFound];
    };

    /**
     * Filters the log events with the given verbosity.
     *
     * @param {number} desiredMinVerbosityIx
     */
    _filterLogEvents (desiredMinVerbosityIx) {
        this._state.verbosity = desiredMinVerbosityIx;
        this._logEventOffsetsFiltered = [];
        for (let i = 0; i < this._logEventOffsets.length; i++) {
            const verbosity = Number(this._logEventOffsets[i].verbosityIx);

            // Save the index of the event in the unfiltered array.
            // When decoding a message, we need the timestamp from
            // the previous event since the timestamps are delta encoded.
            this._logEventOffsets[i].mappedIndex = i;

            if (verbosity >= desiredMinVerbosityIx) {
                this._logEventOffsetsFiltered.push(this._logEventOffsets[i]);
            }
        }
    };

    /**
     * Prettifies the given log event content, if necessary
     *
     * @param {Uint8Array} contentUint8Array The content as a Uint8Array
     * @return {[boolean, (string|*)]} A tuple containing a boolean indicating
     * whether the content was prettified, and if so, the prettified content.
     */
    _prettifyLogEventContent = (contentUint8Array) => {
        if (contentUint8Array.length > this._PRETTIFICATION_THRESHOLD) {
            return this._prettifier.prettify(this._textDecoder.decode(contentUint8Array));
        } else {
            return [false, null];
        }
    };
}
export default FileManager;
