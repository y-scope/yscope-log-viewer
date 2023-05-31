import {ZstdCodec} from "../../../../customized-packages/zstd-codec/js";
import CLP_WORKER_PROTOCOL from "../CLP_WORKER_PROTOCOL";
import {readFile} from "../GetFile";
import {binarySearchWithTimestamp} from "../utils";
import {DataInputStream, DataInputStreamEOFError} from "./DataInputStream";
import FourByteClpIrStreamReader from "./FourByteClpIrStreamReader";
import ResizableUint8Array from "./ResizableUint8Array";
import SimplePrettifier from "./SimplePrettifier";
import {formatSizeInBytes} from "./utils";

/**
 * File manager to manage and track state of each file that is loaded.
 */
class FileManager {
    /**
     * Initializes the class and sets the default states.
     *
     * @param {string} fileInfo
     * @param {boolean} prettify
     * @param {number} logEventIdx
     * @param {number} initialTimestamp
     * @param {number} pageSize
     * @param {function} loadingMessageCallback
     * @param {function} updateStateCallback
     * @param {function} updateLogsCallback
     * @param {updateFileInfoCallback} updateFileInfoCallback
     */
    constructor (fileInfo, prettify, logEventIdx, initialTimestamp, pageSize,
        loadingMessageCallback, updateStateCallback, updateLogsCallback, updateFileInfoCallback) {
        this._fileInfo = fileInfo;
        this._prettify = prettify;
        this._initialTimestamp = initialTimestamp;
        this._logEventOffsets = [];
        this._logEventOffsetsFiltered = [];
        this.logEventMetadata = [];
        this._irStreamReader = null;
        this._displayedMinVerbosityIx = -1;
        this._arrayBuffer;
        this._outputResizableBuffer = null;
        this._availableVerbosityIndexes = new Set();
        this._timestampSorted = false;

        this._fileState = {
            name: null,
            path: null,
        };

        this.state = {
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
     * Callback when progress is updated in file getXMLHttpRequest.
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
            this.filterLogEvents(-1);

            const numberOfEvents = this._logEventOffsets.length;
            if (null !== this._initialTimestamp) {
                this.state.logEventIdx = this.getLogEventIdxFromTimestamp(this._initialTimestamp);
                console.debug(`Initial Timestamp: ${this._initialTimestamp}`);
                console.debug(`logEventIdx: ${this.state.logEventIdx}`);
            } else if (null === this.state.logEventIdx || this.state.logEventIdx > numberOfEvents ||
                this.state.logEventIdx <= 0) {
                this.state.logEventIdx = numberOfEvents;
            }

            this.createPages();
            this.computePageNumFromLogEventIdx();
            this.decodePage();
            this.computeLineNumFromLogEventIdx();

            this._updateStateCallback(CLP_WORKER_PROTOCOL.UPDATE_STATE, this.state);
        }).catch((reason) => {
            if (reason instanceof DataInputStreamEOFError) {
                // If the file is truncated, send back a user-friendly error
                this._loadingMessageCallback("IRStream truncated", true);
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
            this._timestampSorted = true;
            let prevTimestamp = 0;
            while (this._irStreamReader.indexNextLogEvent(this._logEventOffsets)) {
                const timestamp = this._logEventOffsets[this._logEventOffsets.length - 1].timestamp;
                if (timestamp < prevTimestamp) {
                    this._timestampSorted = false;
                }
                prevTimestamp = timestamp;
            }
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

        this.state.numberOfEvents = this._logEventOffsets.length;
    };

    /**
     * @param {number} timestamp The timestamp to search for as milliseconds
     * since the UNIX epoch.
     * @return {number} The logEventIdx for the log event whose timestamp is
     * greater than or equal to the given timestamp
     */
    getLogEventIdxFromTimestamp (timestamp) {
        const numberOfEvents = this._logEventOffsets.length;
        if (this._timestampSorted) {
            const targetIdx = binarySearchWithTimestamp(timestamp, this._logEventOffsets);
            return null === targetIdx ? numberOfEvents : targetIdx + 1;
        } else {
            for (let idx = 0; idx < numberOfEvents; idx++) {
                if (this._logEventOffsets[idx].timestamp >= timestamp) {
                    return idx + 1;
                }
            }
            return numberOfEvents;
        }
    }

    /**
     * Gets the page of the current log event
     */
    computePageNumFromLogEventIdx () {
        for (let index = 0; index < this._logEventOffsetsFiltered.length; index++) {
            const event = this._logEventOffsetsFiltered[index];
            const logEventIndex = event.mappedIndex + 1;
            if (logEventIndex >= this.state.logEventIdx) {
                this.state.page = Math.floor(index / this.state.pageSize)+1;
                return;
            }
        }
        this.state.page = this.state.pages;
    };

    /**
     * Creates pages from the filtered log events and the page size.
     */
    createPages () {
        if (this._logEventOffsetsFiltered.length <= this.state.pageSize) {
            this.state.page = 1;
            this.state.pages = 1;
        } else {
            const numOfEvents = this._logEventOffsetsFiltered.length;
            if (0 === numOfEvents % this.state.pageSize) {
                this.state.pages = Math.floor(numOfEvents/this.state.pageSize);
            } else {
                this.state.pages = Math.floor(numOfEvents/this.state.pageSize) + 1;
            }

            this.state.page = this.state.pages;
        }
    };

    /**
     * Decodes the logs for the selected page (state.page).
     */
    decodePage () {
        const numEventsAtLevel = this._logEventOffsetsFiltered.length;

        // If there are no logs at this verbosity level, return
        if (0 === numEventsAtLevel) {
            this._updateLogsCallback("No logs at selected verbosity level");
            return;
        }

        // Calculate where to start decoding from and how many events to decode
        // On final page, the numberOfEvents is likely less than pageSize
        const logEventsBeginIdx = ((this.state.page - 1) * this.state.pageSize);
        const numOfEvents = Math.min(this.state.pageSize, numEventsAtLevel - logEventsBeginIdx);

        // Create IRStream Reader with the input stream
        const dataInputStream = new DataInputStream(this._arrayBuffer);
        this._irStreamReader = new FourByteClpIrStreamReader(dataInputStream,
            this.state.prettify ? this._prettifyLogEventContent : null);

        // Create variables to store output from reader
        this._outputResizableBuffer = new ResizableUint8Array(511000000);
        this._availableVerbosityIndexes = new Set();
        this.logEventMetadata = [];

        for (let i = logEventsBeginIdx; i < logEventsBeginIdx + numOfEvents; i++) {
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
                    this.logEventMetadata
                );
                const lastEvent = this.logEventMetadata[this.logEventMetadata.length - 1];
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
        const logs = this._textDecoder.decode(this._outputResizableBuffer.getUint8Array());

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
    computeLogEventIdxFromLineNum () {
        // If there are no logs, return
        if (this.logEventMetadata.length === 0) {
            this.state.logEventIdx = null;
            return;
        }
        let trackedLineNumber = this.state.lineNumber;
        let numLines = 0;
        --trackedLineNumber;
        for (let i = 0; i < this.logEventMetadata.length; ++i) {
            const metadata = this.logEventMetadata[i];
            if (metadata.verbosityIx >= this._displayedMinVerbosityIx) {
                numLines += metadata.numLines;
                if (numLines > trackedLineNumber) {
                    this.state.logEventIdx = metadata.mappedIndex + 1;
                    break;
                }
            }
        }
    };

    /**
     * Get the line number from the log event.
     */
    computeLineNumFromLogEventIdx () {
        // If there are no logs, go to line 1
        if (0 === this._logEventOffsetsFiltered.length) {
            this.state.columnNumber = 1;
            this.state.lineNumber = 1;
        }

        if (0 === this.state.logEventIdx) {
            throw new Error("0 is not a valid logEventIdx");
        }

        let lineNumberFound = 1;
        for (let i = 0; i < this.logEventMetadata.length; ++i) {
            // Mapped index is zero indexed, so we need to add one more to it
            if (this.logEventMetadata[i].mappedIndex + 1 >= this.state.logEventIdx) {
                // We"ve passed the log event
                // foundLogEventIdx = this.logEventMetadata[i].mappedIndex + 1;
                break;
            }
            lineNumberFound += this.logEventMetadata[i].numLines;
        }

        this.state.columnNumber = 1;
        this.state.lineNumber = lineNumberFound;
    };

    /**
     * Filters the log events with the given verbosity.
     * @param {number} desiredMinVerbosityIx
     */
    filterLogEvents (desiredMinVerbosityIx) {
        this.state.verbosity = desiredMinVerbosityIx;
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
