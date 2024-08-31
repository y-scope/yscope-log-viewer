import {
    Decoder,
    DecoderOptionsType,
} from "../typings/decoders";
import {MAX_V8_STRING_LENGTH} from "../typings/js";
import {
    BeginLineNumToLogEventNumMap,
    CURSOR_CODE,
    CursorType,
    FileSrcType,
} from "../typings/worker";
import {getUint8ArrayFrom} from "../utils/http";
import {getChunkNum} from "../utils/math";
import {formatSizeInBytes} from "../utils/units";
import {getBasenameFromUrlOrDefault} from "../utils/url";
import JsonlDecoder from "./decoders/JsonlDecoder";


/**
 * Loads a file from a given source.
 *
 * @param fileSrc The source of the file to load. This can be a string representing a URL, or a File
 * object.
 * @return A promise that resolves with the number of log events found in the file.
 * @throws {Error} If the file source type is not supported.
 */
const loadFile = async (fileSrc: FileSrcType)
    : Promise<{ fileName: string, fileData: Uint8Array }> => {
    let fileName: string;
    let fileData: Uint8Array;
    if ("string" === typeof fileSrc) {
        fileName = getBasenameFromUrlOrDefault(fileSrc);
        fileData = await getUint8ArrayFrom(fileSrc, () => null);
    } else {
        // eslint-disable-next-line no-warning-comments
        // TODO: support file loading via Open / Drag-n-drop
        throw new Error("Read from file not yet supported");
    }

    return {
        fileName,
        fileData,
    };
};

/**
 * Class to manage the retrieval and decoding of a given log file.
 */
class LogFileManager {
    readonly #pageSize: number;

    readonly #fileData: Uint8Array;

    readonly #fileName: string;

    #decoder: Decoder;

    #numEvents: number = 0;

    /**
     * Private constructor for LogFileManager. This is not intended to be invoked publicly.
     * Instead, use LogFileManager.create() to create a new instance of the class.
     *
     * @param fileName
     * @param fileData
     * @param pageSize Page size for setting up pagination.
     * @param decoderOptions Initial decoder options.
     */
    constructor (
        fileName: string,
        fileData: Uint8Array,
        pageSize: number,
        decoderOptions: DecoderOptionsType
    ) {
        this.#fileName = fileName;
        this.#fileData = fileData;
        this.#pageSize = pageSize;
        this.#decoder = this.#initDecoder(decoderOptions);
    }

    get numEvents () {
        return this.#numEvents;
    }

    /**
     * Creates a new LogFileManager.
     *
     * @param fileSrc The source of the file to load. This can be a string representing a URL, or a
     * File object.
     * @param pageSize Page size for setting up pagination.
     * @param decoderOptions Initial decoder options.
     * @return A Promise that resolves to the created LogFileManager instance.
     */
    static async create (
        fileSrc: FileSrcType,
        pageSize: number,
        decoderOptions: DecoderOptionsType
    ): Promise<LogFileManager> {
        const {fileName, fileData} = await loadFile(fileSrc);
        return new LogFileManager(fileName, fileData, pageSize, decoderOptions);
    }

    /**
     * Sets options for the decoder.
     *
     * @param options
     */
    setDecoderOptions (options: DecoderOptionsType) {
        this.#decoder.setDecoderOptions(options);
    }

    /**
     * Loads a page of log events based on the provided cursor.
     *
     * @param cursor The cursor indicating the page to load. See {@link CursorType}.
     * @return An object containing the logs as a string, a map of line numbers to log event
     * numbers, and the line number of the first line in the cursor identified event.
     * @throws {Error} if any error occurs during decode.
     */
    loadPage (cursor: CursorType): {
        logs: string,
        beginLineNumToLogEventNum: BeginLineNumToLogEventNumMap,
        cursorLineNum: number
    } {
        console.debug(`loadPage: cursor=${JSON.stringify(cursor)}`);

        const {beginLogEventNum, endLogEventNum} = this.#getCursorRange(cursor);
        const results = this.#decoder.decode(beginLogEventNum - 1, endLogEventNum);
        if (null === results) {
            throw new Error("Error occurred during decoding. " +
                `beginLogEventNum=${beginLogEventNum}, ` +
                `endLogEventNum=${endLogEventNum}`);
        }

        const messages: string[] = [];
        const beginLineNumToLogEventNum: BeginLineNumToLogEventNumMap = new Map();
        let currentLine = 1;
        results.forEach((r) => {
            const [
                msg,
                ,
                ,
                logEventNum,
            ] = r;

            messages.push(msg);
            beginLineNumToLogEventNum.set(currentLine, logEventNum);
            currentLine += msg.split("\n").length - 1;
        });

        return {
            logs: messages.join(""),
            beginLineNumToLogEventNum: beginLineNumToLogEventNum,
            cursorLineNum: 1,
        };
    }

    /**
     * Constructs a decoder instance based on the file extension.
     *
     * @param decoderOptions Initial decoder options.
     * @return The constructed decoder.
     * @throws {Error} if a decoder cannot be found.
     */
    #initDecoder = (decoderOptions: DecoderOptionsType): Decoder => {
        let decoder: Decoder;
        if (this.#fileName.endsWith(".jsonl")) {
            decoder = new JsonlDecoder(this.#fileData, decoderOptions);
        } else {
            throw new Error(`No decoder supports ${this.#fileName}`);
        }

        if (this.#fileData.length > MAX_V8_STRING_LENGTH) {
            throw new Error(`Cannot handle files larger than ${
                formatSizeInBytes(MAX_V8_STRING_LENGTH)
            } due to a limitation in Chromium-based browsers.`);
        }

        this.#numEvents = decoder.getEstimatedNumEvents();
        console.log(`Found ${this.#numEvents} log events.`);

        return decoder;
    };

    /**
     * Gets the range of log event numbers for the page containing the given cursor.
     *
     * @param cursor The cursor object containing the code and arguments.
     * @return The range.
     * @throws {Error} if the type of cursor is not supported.
     */
    #getCursorRange (cursor: CursorType): { beginLogEventNum: number, endLogEventNum: number } {
        if (0 === this.#numEvents) {
            return {
                beginLogEventNum: 1,
                endLogEventNum: 0,
            };
        }

        let beginLogEventIdx: number = 0;
        const {code, args} = cursor;
        if (CURSOR_CODE.PAGE_NUM === code) {
            beginLogEventIdx = ((args.pageNum - 1) * this.#pageSize);
        }
        if (CURSOR_CODE.LAST_EVENT === code || beginLogEventIdx > this.#numEvents) {
            // Set to the first event of the last page
            beginLogEventIdx = (getChunkNum(this.#numEvents, this.#pageSize) - 1) * this.#pageSize;
        } else if (CURSOR_CODE.TIMESTAMP === code) {
            throw new Error(`Unsupported cursor type: ${code}`);
        }
        const beginLogEventNum = beginLogEventIdx + 1;
        const endLogEventNum = Math.min(this.#numEvents, beginLogEventNum + this.#pageSize - 1);
        return {beginLogEventNum, endLogEventNum};
    }
}

export default LogFileManager;
