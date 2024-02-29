import {Tarball} from "@obsidize/tar-browserify";
import JSZip from "jszip";
import pako from "pako";

import {ZstdCodec} from "../../../../customized-packages/zstd-codec/js";
import CLP_WORKER_PROTOCOL from "../CLP_WORKER_PROTOCOL";
import {readFile} from "../GetFile";
import {binarySearchWithTimestamp} from "../utils";
import {DataInputStream, DataInputStreamEOFError} from "./DataInputStream";
import {FILE_EXTENSION_TO_TYPE, FILE_TYPE_FULL_NAMES, FILE_TYPE_MAGIC_NUMBERS,
    FILE_TYPE_RECHECK_LIST, FILE_TYPES
} from "./FILE_FORMATS";
import FourByteClpIrStreamReader from "./FourByteClpIrStreamReader";
import ResizableUint8Array from "./ResizableUint8Array";
import SimplePrettifier from "./SimplePrettifier";
import {formatSizeInBytes} from "./utils";

/**
 * File manager to manage and track state of each file that is loaded.
 */
class FileManager {
    /**
     * Determines the file-type of a buffer by comparing its magic number
     * against known magic numbers.
     *
     * @param {Uint8Array|ArrayBuffer} data
     * @returns {string} The file's type as one of FILE_TYPES
     */
    static #getFileTypeByMagicNumber = (data) => {
        let fileType = FILE_TYPES.UNKNOWN;

        for (const [type, typeMagicNumber]
            of
            Object.entries(FILE_TYPE_MAGIC_NUMBERS)
        ) {
            const {length} = typeMagicNumber;
            const fileMagicNumber = (data instanceof ArrayBuffer) ?
                new Uint8Array(data, 0, length) :
                data.slice(0, length);
            const isMagicNumberMatching = typeMagicNumber.every(
                (value, index) => (value === fileMagicNumber[index])
            );

            if (isMagicNumberMatching) {
                fileType = type;
                break;
            }
        }

        return fileType;
    };

    /**
     * Decompresses and retrieves the content of a Zstandard-compressed file.
     * @static
     * @private
     * @param {Uint8Array} data Compressed data
     * @param {string} name Original file name
     * @returns {{content: ArrayBuffer, name: string}}
     * @throws {Error} if there was an issue loading or extracting the archive
     */
    static #getZstdFileContent = async (data, name) => {
        const zstd = await new Promise((resolve) => {
            ZstdCodec.run((z) => {
                resolve(z);
            });
        });
        const zstdCtx = new zstd.Streaming();

        return {
            content: zstdCtx.decompress(data).buffer,
            name,
        };
    };

    /**
     * Decompresses and retrieves the content of a Gzip-compressed file.
     * @static
     * @private
     * @param {Uint8Array} data Compressed data
     * @param {string} name Original file name
     * @returns {{content: Uint8Array, name: string}}
     * @throws {Error} if there was an issue loading or extracting the archive
     */
    static #getGzipFileContent = (data, name) => {
        return {
            content: pako.inflate(data),
            name,
        };
    };

    /**
     * Decompresses and retrieves the content of the first file within a
     * TAR GZIP archive.
     * @static
     * @private
     * @param {Uint8Array} data Compressed data
     * @param {string} name Original file name
     * @returns {{content: Uint8Array, name: string}} where name is the
     * original filename joined with the first file's name as a path.
     * @throws {Error} if there was an issue loading or extracting the archive
     */
    static #getTarGzipFirstFileContent = (data, name) => {
        const tarArchive = pako.inflate(data);
        const [entry] = Tarball.extract(tarArchive).filter(
            (e) => e.isFile()
        );
        const {content, fileName} = entry;

        name += `/${fileName}`;

        return {
            content,
            name,
        };
    };

    /**
     * Decompresses and retrieves the content of the first file within a ZIP
     * archive.
     * @static
     * @private
     * @param {Uint8Array} data Compressed data
     * @param {string} name Original file name
     * @returns {{content: Uint8Array, name: string}} where name is the
     * original filename joined with the first file's name as a path.
     * @throws {Error} if there was an issue loading or extracting the archive
     */
    static async #getZipFirstFileContent (data, name) {
        const zipArchive = await new JSZip().loadAsync(data);
        const [firstFilePath] = Object.keys(zipArchive.files);
        const content = await zipArchive.files[firstFilePath]
            .async("uint8array");

        name += `/${firstFilePath}`;

        return {
            content,
            name,
        };
    }

    /**
     * Initializes the class and sets the default states.
     *
     * @param {string} fileSrc
     * @param {boolean} prettify
     * @param {number} logEventIdx
     * @param {number} initialTimestamp
     * @param {number} pageSize
     * @param {function} loadingMessageCallback
     * @param {function} updateStateCallback
     * @param {function} updateLogsCallback
     * @param {function} updateFileInfoCallback
     */
    constructor (fileSrc, prettify, logEventIdx, initialTimestamp, pageSize,
        loadingMessageCallback, updateStateCallback, updateLogsCallback, updateFileInfoCallback) {
        this._fileSrc = fileSrc;
        this._prettify = prettify;
        this._initialTimestamp = initialTimestamp;
        this._logEventOffsets = [];
        this._logEventOffsetsFiltered = [];
        this.logEventMetadata = [];
        this._irStreamReader = null;
        this._displayedMinVerbosityIx = -1;
        this._arrayBuffer = null;
        this._outputResizableBuffer = null;
        this._availableVerbosityIndexes = new Set();
        this._timestampSorted = false;

        this._fileInfo = {
            data: null,
            name: null,
            path: null,
            type: FILE_TYPES.UNKNOWN,
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
     * Decode plain-text log buffer and update editor state
     * @param {Uint8Array|ArrayBuffer} decompressedLogFile
     * @private
     */
    _decodePlainTextLogAndUpdate (decompressedLogFile) {
        // Update decompression status
        this.state.decompressedHumanSize = formatSizeInBytes(decompressedLogFile.byteLength, false);
        this._loadingMessageCallback(`Decompressed size: ${this.state.decompressedHumanSize}.`);

        this._logs = this._textDecoder.decode(decompressedLogFile);
        this._updateLogsCallback(this._logs);

        // Update state to re-render a single page on the editor
        this.state.verbosity = -1;
        this.state.lineNumber = 1;
        this.state.columnNumber = 1;
        this.state.page = 1;
        this.state.pages = 1;
        this._updateStateCallback(CLP_WORKER_PROTOCOL.UPDATE_STATE, this.state);
    }

    /**
     * Decode IRStream log buffer and update editor state
     * @param {ArrayBuffer} decompressedIRStreamFile
     * @private
     */
    _decodeIRStreamLogAndUpdate (decompressedIRStreamFile) {
        // Need to cache this for repeated access
        this._arrayBuffer = decompressedIRStreamFile;

        this._buildIndex();
        this.filterLogEvents(-1);

        const numberOfEvents = this._logEventOffsets.length;
        if (null !== this._initialTimestamp) {
            this.state.logEventIdx = this.getLogEventIdxFromTimestamp(this._initialTimestamp);
            console.debug(`Initial Timestamp: ${this._initialTimestamp}`);
            console.debug(`logEventIdx: ${this.state.logEventIdx}`);
        } else if (null === this.state.logEventIdx
            || this.state.logEventIdx > numberOfEvents
            || this.state.logEventIdx <= 0) {
            this.state.logEventIdx = numberOfEvents;
        }

        this.createPages();
        this.computePageNumFromLogEventIdx();
        this.decodePage();
        this.computeLineNumFromLogEventIdx();

        this._updateStateCallback(CLP_WORKER_PROTOCOL.UPDATE_STATE, this.state);
    }

    /**
     * Determines the file type of the given data before decompression using
     * magic numbers and file extensions.
     *
     * @private
     * @param {Uint8Array} data
     * @param {string} name Original file name
     * @returns {string} The file's type as one of FILE_TYPES
     */
    _getLogFileTypeBeforeDecompress (data, name) {
        let type = FileManager.#getFileTypeByMagicNumber(data);

        if (FILE_TYPES.UNKNOWN === type) {
            // Check file extension as a fallback
            const fileExtension = Object.keys(FILE_EXTENSION_TO_TYPE).find(
                (extension) => name.endsWith(extension)
            );

            if (null !== fileExtension) {
                console.log("Found compatible type from file extension.");
                type = FILE_EXTENSION_TO_TYPE[fileExtension];
            }
        }

        this._loadingMessageCallback(
            `Determined file type: ${FILE_TYPE_FULL_NAMES[type]}`
        );

        return type;
    }

    /**
     * Decompresses the file content based on its detected file type and
     * returns the decompressed data.
     *
     * @private
     * @returns {Promise<Uint8Array|ArrayBuffer>}
     * @throws {Error} if there was an issue during decompression.
     */
    async _decompressFile () {
        const decompressMethods = {
            [FILE_TYPES.ZST]: await FileManager.#getZstdFileContent,
            [FILE_TYPES.GZ]: FileManager.#getGzipFileContent,
            [FILE_TYPES.TAR_GZ]: FileManager.#getTarGzipFirstFileContent,
            [FILE_TYPES.ZIP]: await FileManager.#getZipFirstFileContent,
        };

        let {data, name} = this._fileInfo;
        const {type} = this._fileInfo;

        if (type in decompressMethods) {
            ({
                content: data,
                name,
            } = await decompressMethods[type].call(this, data, name));

            // TODO: implement a file tree view for archives
            // Update the file name if src is an archive.
            this._fileInfo.name = name;
        }

        return data;
    }

    /**
     * Determines the file type before decoding based on the provided data and
     * the current file type.
     *
     * @private
     * @param {Uint8Array|ArrayBuffer} data
     * @param {string} typeBeforeDecode The file's type, determined before
     * decoding, as one of FILE_TYPES
     * @returns {string} The file's real type as one of FILE_TYPES
     */
    _getFileTypeBeforeDecode (data, typeBeforeDecode) {
        let type = typeBeforeDecode;

        if (FILE_TYPE_RECHECK_LIST.includes(typeBeforeDecode)) {
            const contentType = FileManager.#getFileTypeByMagicNumber(data);

            if (FILE_TYPES.UNKNOWN !== contentType) {
                type = contentType;
                this._loadingMessageCallback(
                    `Determined content type: ${FILE_TYPE_FULL_NAMES[type]}`
                );
            }
        }

        return type;
    }

    /**
     * Decodes the file data based on the determined file type and updates the
     * log content accordingly.
     *
     * @private
     * @param {Uint8Array|ArrayBuffer} data
     */
    _decodeFile (data) {
        const decodeMethods = {
            [FILE_TYPES.UNKNOWN]: this._decodePlainTextLogAndUpdate,
            [FILE_TYPES.CLP_IR]: this._decodeIRStreamLogAndUpdate,
            [FILE_TYPES.ZST]: this._decodePlainTextLogAndUpdate,
            [FILE_TYPES.TAR_GZ]: this._decodePlainTextLogAndUpdate,
            [FILE_TYPES.GZ]: this._decodePlainTextLogAndUpdate,
            [FILE_TYPES.ZIP]: this._decodePlainTextLogAndUpdate,
        };

        decodeMethods[this._fileInfo.type].call(this, data);
    }

    /**
     * Loads and processes a log file, including decompression and decoding.
     * Updates the file information and log content accordingly.
     */
    async loadLogFile () {
        // Get & read the file, and update file information
        this._fileInfo = {
            ...this._fileInfo,
            ...await readFile(this._fileSrc, this._updateFileLoadProgress),
        };

        // Calculate and display compressed file size in the UI.
        this.state.compressedHumanSize = formatSizeInBytes( this._fileInfo.data.byteLength, false);
        this._loadingMessageCallback(`Compressed size: ${this.state.compressedHumanSize}.`);

        // Determine the file type before decompression.
        this._fileInfo.type = this._getLogFileTypeBeforeDecompress(
            this._fileInfo.data,
            this._fileInfo.name
        );

        // Decompress the file data.
        const data = await this._decompressFile();

        // Recheck and update the file type if needed.
        this._fileInfo.type = this._getFileTypeBeforeDecode(data, this._fileInfo.type);

        // Update file information in the UI
        this._updateFileInfoCallback(this._fileInfo);

        // Decode file.
        this._decodeFile(data);
    }

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
