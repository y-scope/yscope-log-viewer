import BufferPool from "./BufferPool";
import FourByteClpIrStreamProtocolDecoder from "./FourByteClpIrStreamProtocolDecoder";
import FourByteVarBuf from "./FourByteVarBuf";
import IRTokenDecoder from "./IRTokenDecoder";
import LogtypeBuf from "./LogtypeBuf";
import PROTOCOL from "./PROTOCOL";
import {countByteOccurrencesInUtf8Uint8Array, uint8ArrayContains} from "./utils";

const NEWLINE_CODE_POINT = "\n".codePointAt(0);

/**
 * EOF error thrown by FourByteClpIrStreamReader
 */
class FourByteClpIrStreamReaderEOFError extends Error {
    /**
     * Constructor
     */
    constructor () {
        super("FourByteClpIrStreamReaderEOFError");
        this.name = "FourByteClpIrStreamReaderEOFError";
    }
}

/**
 * Reader for CLP IR streams that use the four-byte encoding
 */
class FourByteClpIrStreamReader {
    static textEncoder = new TextEncoder();
    static textDecoder = new TextDecoder();
    static VERBOSITIES = [
        {label: "≤ TRACE", uint8Array: FourByteClpIrStreamReader.textEncoder.encode("TRACE")},
        {label: "≤ DEBUG", uint8Array: FourByteClpIrStreamReader.textEncoder.encode("DEBUG")},
        {label: "≤ INFO", uint8Array: FourByteClpIrStreamReader.textEncoder.encode("INFO")},
        {label: "≤ WARN", uint8Array: FourByteClpIrStreamReader.textEncoder.encode("WARN")},
        {label: "≤ ERROR", uint8Array: FourByteClpIrStreamReader.textEncoder.encode("ERROR")},
        {label: "≤ FATAL", uint8Array: FourByteClpIrStreamReader.textEncoder.encode("FATAL")},
        {label: "UNKNOWN", uint8Array: FourByteClpIrStreamReader.textEncoder.encode("UNKNOWN")},
    ];

    /**
     * @callback LogEventContentFormatter
     * @param {Uint8Array} logEventContent
     * @return {[boolean, string]} A tuple: [whether formatting changed the
     * event, the formatted event]
     */

    /**
     * Constructor
     * @param {DataInputStream} dataInputStream
     * @param {LogEventContentFormatter} logEventContentFormatter
     */
    constructor (dataInputStream, logEventContentFormatter) {
        this._tokenDecoder = new IRTokenDecoder();

        this._dataInputStream = dataInputStream;
        this._logtype = new LogtypeBuf();
        this._varPool = new BufferPool(FourByteVarBuf);

        this._streamProtocolDecoder = new FourByteClpIrStreamProtocolDecoder(
            dataInputStream, this._tokenDecoder
        );

        this._logEventContentFormatter = logEventContentFormatter;
    }

    /**
     * Indexes the next log event in the stream. See `logEventOffsets` for the
     * data that's indexed.
     * @param {Array} logEventIndex An array to store index objects with the
     * keys:
     * "startIndex": The begin index of the event in the stream;
     * "endIndex": The end index of the event in the stream;
     * "verbosityIx": The verbosity index of the event;
     * "timestamp": The message's timestamp as milliseconds since the UNIX
     * epoch.
     * @return {boolean} Whether an event was read and indexed
     */
    indexNextLogEvent (logEventIndex) {
        try {
            const beginIdx = this._dataInputStream.getPos();
            // TODO _readLogEvent is not efficient for the purposes of indexing
            //  since it actually stores the log event in preparation for
            //  decoding whereas indexing the log event only needs to read
            //  the tag and length bytes.
            const {timestamp, verbosityIx} = this._readLogEvent();
            logEventIndex.push({
                "startIndex": beginIdx,
                "endIndex": this._dataInputStream.getPos(),
                "verbosityIx": verbosityIx,
                "timestamp": timestamp,
            });
        } catch (error) {
            if (error instanceof FourByteClpIrStreamReaderEOFError) {
                return false;
            } else {
                throw error;
            }
        }

        return true;
    }

    /**
     * Reads and decodes the next log event in the stream
     * @param {ResizableUint8Array} outputResizableBuffer Buffer to write the
     * decoded log event into
     * @param {Array} logEventMetadata An array to store metadata objects about
     * the decoded log events with the keys:
     * "beginOffset": The begin offset of the event in the output buffer
     * "endOffset": The end offset of the event in the output buffer
     * "numLines": The number of lines in the log event
     * "verbosityIx": The verbosity index of the log event
     * @return {boolean} Whether an event was read and decoded
     */
    readAndDecodeLogEvent (outputResizableBuffer, logEventMetadata) {
        let timestamp;
        let verbosityIx;
        let numValidVars;
        try {
            ({timestamp, verbosityIx, numValidVars} = this._readLogEvent());
        } catch (error) {
            if (error instanceof FourByteClpIrStreamReaderEOFError) {
                return false;
            } else {
                throw error;
            }
        }

        // Get the offset before we output anything to the buffer
        const beginOffset = outputResizableBuffer.getLength();

        this._tokenDecoder.decodeTimestamp(outputResizableBuffer, timestamp);

        const contentBeginOffset = outputResizableBuffer.getLength();

        // Decode logtype and variables
        this._tokenDecoder.loadLogtype(this._logtype);
        for (let i = 0; i < numValidVars; ++i) {
            const v = this._varPool.get(i);
            switch (this._tokenDecoder.decodeUpToNextVar(outputResizableBuffer)) {
                case LogtypeBuf.INTEGER_VARIABLE_DELIMITER:
                    v.decodeAsIntegerType();
                    break;
                case LogtypeBuf.FLOAT_VARIABLE_DELIMITER:
                    v.decodeAsFloatType();
                    break;
                case LogtypeBuf.VARIABLE_ID_DELIMITER:
                    // Do nothing
                    break;
                default:
                    throw new Error("Unexpected variable delimiter in logtype.");
            }

            // Output variable
            outputResizableBuffer.push(v.getValueUint8Array());
        }
        this._tokenDecoder.drainLogtype(outputResizableBuffer);

        const contentUint8Array = outputResizableBuffer.getUint8Array(contentBeginOffset);
        let numLines;
        if (null === this._logEventContentFormatter) {
            numLines = countByteOccurrencesInUtf8Uint8Array(contentUint8Array, NEWLINE_CODE_POINT);
        } else {
            const [isFormatted, formattedContent] =
                this._logEventContentFormatter(contentUint8Array);
            if (isFormatted) {
                // Delete the unformatted content and replace it
                // with the formatted content
                outputResizableBuffer.resize(contentBeginOffset);
                outputResizableBuffer.pushString(formattedContent);

                // NOTE: Counterintuitively, this is faster than
                // looping over the array while counting
                numLines = formattedContent.split("\n").length - 1;
            } else {
                numLines = countByteOccurrencesInUtf8Uint8Array(
                    contentUint8Array, NEWLINE_CODE_POINT
                );
            }
        }

        logEventMetadata.push({
            "beginOffset": beginOffset,
            "endOffset": outputResizableBuffer.getLength(),
            "numLines": numLines,
            "verbosityIx": verbosityIx,
        });

        return true;
    }

    decodeAndMatchLogEvent (outputResizableBuffer, searchString, isRegex, matchCase) {
        const {timestamp, _, numValidVars} = this._readLogEvent();
        this._tokenDecoder.decodeTimestamp(outputResizableBuffer, timestamp);

        // Decode logtype and variables
        this._tokenDecoder.loadLogtype(this._logtype);
        for (let i = 0; i < numValidVars; ++i) {
            const v = this._varPool.get(i);
            switch (this._tokenDecoder.decodeUpToNextVar(outputResizableBuffer)) {
                case LogtypeBuf.INTEGER_VARIABLE_DELIMITER:
                    v.decodeAsIntegerType();
                    break;
                case LogtypeBuf.FLOAT_VARIABLE_DELIMITER:
                    v.decodeAsFloatType();
                    break;
                case LogtypeBuf.VARIABLE_ID_DELIMITER:
                    // Do nothing
                    break;
                default:
                    throw new Error("Unexpected variable delimiter in logtype.");
            }

            // Output variable
            outputResizableBuffer.push(v.getValueUint8Array());
        }
        this._tokenDecoder.drainLogtype(outputResizableBuffer);

        const contentUint8Array = outputResizableBuffer.getUint8Array();
        const contentString = FourByteClpIrStreamReader.textDecoder.decode(contentUint8Array);

        let contentLowerCaseString = contentString;
        let searchLowerCaseString = searchString;
        if (matchCase === false) {
            contentLowerCaseString = contentLowerCaseString.toLowerCase();
            searchLowerCaseString = searchString.toLowerCase();
        }

        let match;
        if (isRegex) {
            match = contentLowerCaseString.match(searchString);
        } else if (contentLowerCaseString.includes(searchLowerCaseString)) {
            match = searchString;
        }

        return {match, contentString};
    }

    /**
     * @return {number} The Log4j verbosity index of the current log event
     * (if it can be detected)
     * @private
     */
    _getLog4jVerbosity () {
        for (let i = 0; i < FourByteClpIrStreamReader.VERBOSITIES.length; ++i) {
            const verbosityUint8Array = FourByteClpIrStreamReader.VERBOSITIES[i].uint8Array;

            // FIXME: This only supports verbosity levels starting at the 2nd
            //  character of the log type
            if (uint8ArrayContains(this._logtype.getValueUint8Array(), 1,
                verbosityUint8Array, 0)) {
                return i;
            }
        }

        // Return UNKNOWN verbosity
        return FourByteClpIrStreamReader.VERBOSITIES.length - 1;
    }

    /**
     * Reads a log event from the stream
     * @return {{timestamp: bigint, verbosityIx: number, numValidVars: number}}
     * The log event's timestamp, verbosity index, and
     * number of valid variables
     * @throws {FourByteClpIrStreamReaderEOFError} on EOF
     * @private
     */
    _readLogEvent () {
        let tag = this._streamProtocolDecoder.readTag(this._dataInputStream);
        if (PROTOCOL.PAYLOAD.EOF === tag) {
            throw new FourByteClpIrStreamReaderEOFError();
        }

        // Read variables if present in this message
        this._varPool.free();
        let numValidVars = 0;
        const decoder = this._streamProtocolDecoder;
        while (decoder.tryReadingVar(this._dataInputStream, tag, this._varPool.getNext())) {
            tag = decoder.readTag(this._dataInputStream);
            ++numValidVars;
        }
        // Read the logtype and timestamp present in every message
        this._streamProtocolDecoder.readLogtype(this._dataInputStream, tag, this._logtype);
        const verbosityIx = this._getLog4jVerbosity();

        const timestamp = this._streamProtocolDecoder.readTimestamp(this._dataInputStream);

        return {timestamp, verbosityIx, numValidVars};
    }
}

export default FourByteClpIrStreamReader;
