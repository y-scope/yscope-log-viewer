import {CONFIG_KEY} from "../typings/config";
import {
    Decoder,
    DecoderOptionsType,
    LOG_EVENT_FILE_END_IDX,
} from "../typings/decoders";
import {MAX_V8_STRING_LENGTH} from "../typings/js";
import {
    BeginLineNumToLogEventNumMap,
    CURSOR_CODE,
    CursorType,
    FileSrcType,
    LOG_EVENT_ANCHOR,
} from "../typings/worker";
import {getConfig} from "../utils/config";
import {getUint8ArrayFrom} from "../utils/http";
import {getChunkNum} from "../utils/math";
import {formatSizeInBytes} from "../utils/units";
import {getBasenameFromUrlOrDefault} from "../utils/url";
import ClpIrDecoder from "./decoders/ClpIrDecoder";
import JsonlDecoder from "./decoders/JsonlDecoder";


/**
 * Gets the new log event number.
 *
 * @param cursor The cursor object containing the code and arguments.
 * @param beginLineNumToLogEventNum
 * @return The new log event number.
 * @throws {Error} There are no log events on the page.
 */
const getNewLogEventNum = (
    cursor: CursorType,
    beginLineNumToLogEventNum: BeginLineNumToLogEventNumMap
): number => {
    const {code, args} = cursor;
    const logEventNumOnPage: number[] = Array.from(beginLineNumToLogEventNum.values());
    // Default to last event on page.
    let NewLogEventNum: number|undefined = logEventNumOnPage.at(-1);

    if (CURSOR_CODE.PAGE_NUM === code) {
        if (LOG_EVENT_ANCHOR.FIRST === args.logEventAnchor) {
            NewLogEventNum = logEventNumOnPage.at(0);
        }
    }

    if (!NewLogEventNum) {
        throw Error("There are no log events on the page.");
    }

    return NewLogEventNum;
};

/**
 * Loads a file from a given source.
 *
 * @param fileSrc The source of the file to load. This can be a string representing a URL, or a File
 * object.
 * @return A promise that resolves with an object containing the file name and file data.
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
        fileName = fileSrc.name;
        fileData = new Uint8Array(await fileSrc.arrayBuffer());
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

    readonly #fileName: string;

    #decoder: Decoder;

    #numEvents: number = 0;

    /**
     * Private constructor for LogFileManager. This is not intended to be invoked publicly.
     * Instead, use LogFileManager.create() to create a new instance of the class.
     *
     * @param decoder
     * @param fileName
     * @param pageSize Page size for setting up pagination.
     */
    constructor (
        decoder: Decoder,
        fileName: string,
        pageSize: number,
    ) {
        this.#fileName = fileName;
        this.#pageSize = pageSize;
        this.#decoder = decoder;

        // Build index for the entire file
        const buildIdxResult = decoder.buildIdx(0, LOG_EVENT_FILE_END_IDX);
        if (null !== buildIdxResult && 0 < buildIdxResult.numInvalidEvents) {
            console.error("Invalid events found in decoder.buildIdx():", buildIdxResult);
        }

        this.#numEvents = decoder.getEstimatedNumEvents();
        console.log(`Found ${this.#numEvents} log events.`);
    }

    get fileName () {
        return this.#fileName;
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
        const decoder = await LogFileManager.#initDecoder(fileName, fileData, decoderOptions);

        return new LogFileManager(decoder, fileName, pageSize);
    }

    /**
     * Constructs a decoder instance based on the file extension.
     *
     * @param fileName
     * @param fileData
     * @param decoderOptions Initial decoder options.
     * @return The constructed decoder.
     * @throws {Error} if no decoder supports a file with the given extension.
     */
    static async #initDecoder (
        fileName: string,
        fileData: Uint8Array,
        decoderOptions: DecoderOptionsType
    ): Promise<Decoder> {
        let decoder: Decoder;
        if (fileName.endsWith(".jsonl")) {
            decoder = new JsonlDecoder(fileData, decoderOptions);
        } else if (fileName.endsWith(".clp.zst")) {
            decoder = await ClpIrDecoder.create(fileData);
        } else {
            throw new Error(`No decoder supports ${fileName}`);
        }

        if (fileData.length > MAX_V8_STRING_LENGTH) {
            throw new Error(`Cannot handle files larger than ${
                formatSizeInBytes(MAX_V8_STRING_LENGTH)
            } due to a limitation in Chromium-based browsers.`);
        }

        return decoder;
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
        beginLineNumToLogEventNum: BeginLineNumToLogEventNumMap,
        cursorLineNum: number
        logEventNum: number
        logs: string,
        pageNum: number
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

        const newLogEventNum = getNewLogEventNum(cursor, beginLineNumToLogEventNum);
        const newPageNum: number = getChunkNum(beginLogEventNum, getConfig(CONFIG_KEY.PAGE_SIZE));

        return {
            beginLineNumToLogEventNum: beginLineNumToLogEventNum,
            cursorLineNum: 1,
            logEventNum: newLogEventNum,
            logs: messages.join(""),
            pageNum: newPageNum,
        };
    }

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
