/* eslint-disable max-lines */

import {
    Decoder,
    DecoderOptions,
    LOG_EVENT_FILE_END_IDX,
} from "../typings/decoders";
import {MAX_V8_STRING_LENGTH} from "../typings/js";
import {LogLevelFilter} from "../typings/logs";
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
import ClpIrDecoder from "./decoders/ClpIrDecoder";
import JsonlDecoder from "./decoders/JsonlDecoder";


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

    readonly #numEvents: number = 0;

    #numFilteredEvents: number = 0;

    #firstLogEventNumOnPage: number[] = [];

    #lastLogEventNumOnPage: number[] = [];

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
        if (null === buildIdxResult) {
            console.error("null result from decoder.buildIdx()");
        } else if (0 < buildIdxResult.numInvalidEvents) {
            console.error("Invalid events found in decoder.buildIdx():", buildIdxResult);
        }

        this.#numEvents = decoder.getEstimatedNumEvents();
        this.#computeUnfilteredPageBoundaries();
        console.log(`Found ${this.#numEvents} log events.`);
    }

    get fileName () {
        return this.#fileName;
    }

    get numEvents () {
        return this.#numEvents;
    }

    get numFilteredEvents () {
        return this.#numFilteredEvents;
    }

    get firstLogEventNumOnPage () {
        return this.#firstLogEventNumOnPage;
    }

    get lastLogEventNumOnPage () {
        return this.#lastLogEventNumOnPage;
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
        decoderOptions: DecoderOptions
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
        decoderOptions: DecoderOptions
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
        const results = this.#decoder.decodeFilteredRange(beginLogEventNum - 1, endLogEventNum);
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
     * Sets the log level filter.
     *
     * @param logLevelFilter
     * @throws {Error} If changing the log level filter couldn't be set.
     */
    setLogLevelFilter (logLevelFilter: LogLevelFilter) {
        const result: boolean = this.#decoder.setLogLevelFilter(logLevelFilter);

        if (false === result) {
            throw new Error(`Failed to set log level filter for current decoder.`);
        }

        if (logLevelFilter) {
            this.#computeFilteredPageBoundaries();
        } else {
            this.#computeUnfilteredPageBoundaries();
        }
    }

    /**
     * Computes the log event number at the beginning and end of each page, accounting for the level
     * filter.
     */
    #computeFilteredPageBoundaries () {
        this.#firstLogEventNumOnPage.length = 0;
        this.#lastLogEventNumOnPage.length = 0;

        const filteredLogEventsIndices: number[] = this.#decoder.getFilteredLogEventIndices();
        this.#numFilteredEvents = filteredLogEventsIndices.length;

        for (let i = 0; i < this.#numFilteredEvents; i += this.#pageSize) {
            const firstLogEventOnPageIdx: number = filteredLogEventsIndices[i] as number;
            this.#firstLogEventNumOnPage.push(1 + firstLogEventOnPageIdx);

            const j = Math.min(i + this.#pageSize - 1, this.#numFilteredEvents - 1);
            const lastLogEventOnPageIdx: number = filteredLogEventsIndices[j] as number;
            this.#lastLogEventNumOnPage.push(1 + lastLogEventOnPageIdx);
        }
    }

    /**
     * Computes the log event number at the beginning and end of each page, assuming the events
     * aren't filtered.
     */
    #computeUnfilteredPageBoundaries () {
        this.#firstLogEventNumOnPage.length = 0;
        this.#lastLogEventNumOnPage.length = 0;

        this.#numFilteredEvents = this.#numEvents;

        for (let i = 0; i < this.#numFilteredEvents; i += this.#pageSize) {
            this.#firstLogEventNumOnPage.push(1 + i);

            // Need to minus one from page size to get correct index into filtered log events.
            let lastPageIdx: number = i + this.#pageSize - 1;

            // Guard to prevent indexing out of array on last page.
            if (lastPageIdx >= this.#numFilteredEvents) {
                lastPageIdx = this.#numFilteredEvents - 1;
            }

            this.#lastLogEventNumOnPage.push(1 + lastPageIdx);
        }
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
        if (CURSOR_CODE.LAST_EVENT === code || beginLogEventIdx > this.#numFilteredEvents) {
            // Set to the first event of the last page
            beginLogEventIdx =
                (getChunkNum(this.#numFilteredEvents, this.#pageSize) - 1) * this.#pageSize;
        } else if (CURSOR_CODE.TIMESTAMP === code) {
            throw new Error(`Unsupported cursor type: ${code}`);
        }
        const beginLogEventNum = beginLogEventIdx + 1;
        const endLogEventNum = Math.min(
            this.#numFilteredEvents,
            beginLogEventNum + this.#pageSize - 1
        );

        return {beginLogEventNum, endLogEventNum};
    }
}

export default LogFileManager;
