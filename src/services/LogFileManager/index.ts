/* eslint max-lines: ["error", 450] */
import {
    Decoder,
    DecodeResult,
    DecoderOptions,
} from "../../typings/decoders";
import {MAX_V8_STRING_LENGTH} from "../../typings/js";
import {LogLevelFilter} from "../../typings/logs";
import {
    BeginLineNumToLogEventNumMap,
    CURSOR_CODE,
    CursorData,
    CursorType,
    EMPTY_PAGE_RESP,
    FileSrcType,
    QueryResults,
    WORKER_RESP_CODE,
    WorkerResp,
} from "../../typings/worker";
import {
    EXPORT_LOGS_CHUNK_SIZE,
    QUERY_CHUNK_SIZE,
} from "../../utils/config";
import {getChunkNum} from "../../utils/math";
import {defer} from "../../utils/time";
import {formatSizeInBytes} from "../../utils/units";
import ClpIrDecoder from "../decoders/ClpIrDecoder";
import JsonlDecoder from "../decoders/JsonlDecoder";
import {
    getEventNumCursorData,
    getLastEventCursorData,
    getPageNumCursorData,
    loadFile,
} from "./utils";


const MAX_QUERY_RESULT_COUNT = 1_000;

/**
 * Class to manage the retrieval and decoding of a given log file.
 */
class LogFileManager {
    readonly #fileName: string;

    readonly #numEvents: number = 0;

    readonly #pageSize: number;

    #queryId: number = 0;

    readonly #onDiskFileSizeInBytes: number;

    readonly #onQueryResults: (queryProgress: number, queryResults: QueryResults) => void;

    #decoder: Decoder;

    #queryCount: number = 0;

    /**
     * Private constructor for LogFileManager. This is not intended to be invoked publicly.
     * Instead, use LogFileManager.create() to create a new instance of the class.
     *
     * @param params
     * @param params.decoder
     * @param params.fileName
     * @param params.onDiskFileSizeInBytes
     * @param params.pageSize Page size for setting up pagination.
     * @param params.onQueryResults
     */
    constructor ({decoder, fileName, onDiskFileSizeInBytes, pageSize, onQueryResults}: {
        decoder: Decoder,
        fileName: string,
        onDiskFileSizeInBytes: number,
        pageSize: number,
        onQueryResults: (queryProgress: number, queryResults: QueryResults) => void,
    }) {
        this.#decoder = decoder;
        this.#fileName = fileName;
        this.#pageSize = pageSize;
        this.#onDiskFileSizeInBytes = onDiskFileSizeInBytes;
        this.#onQueryResults = onQueryResults;

        // Build index for the entire file.
        const buildResult = decoder.build();
        if (0 < buildResult.numInvalidEvents) {
            console.error("Invalid events found in decoder.build():", buildResult);
        }

        this.#numEvents = decoder.getEstimatedNumEvents();
        console.log(`Found ${this.#numEvents} log events.`);
    }

    get fileName () {
        return this.#fileName;
    }

    get onDiskFileSizeInBytes () {
        return this.#onDiskFileSizeInBytes;
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
     * @param onQueryResults
     * @return A Promise that resolves to the created LogFileManager instance.
     */
    static async create (
        fileSrc: FileSrcType,
        pageSize: number,
        decoderOptions: DecoderOptions,
        onQueryResults: (queryProgress: number, queryResults: QueryResults) => void,
    ): Promise<LogFileManager> {
        const {fileName, fileData} = await loadFile(fileSrc);
        const decoder = await LogFileManager.#initDecoder(fileName, fileData, decoderOptions);

        return new LogFileManager({
            decoder: decoder,
            fileName: fileName,
            onDiskFileSizeInBytes: fileData.length,
            pageSize: pageSize,

            onQueryResults: onQueryResults,
        });
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
            decoder = await ClpIrDecoder.create(fileData, decoderOptions);
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

    /* Sets any formatter options that exist in the decoder's options.
     * @param options
     */
    setFormatterOptions (options: DecoderOptions) {
        this.#decoder.setFormatterOptions(options);
    }

    /**
     * Sets the log level filter.
     *
     * @param logLevelFilter
     * @throws {Error} If the log level filter couldn't be set.
     */
    setLogLevelFilter (logLevelFilter: LogLevelFilter) {
        const result = this.#decoder.setLogLevelFilter(logLevelFilter);
        if (false === result) {
            throw new Error("Failed to set log level filter for the decoder.");
        }
    }

    /**
     * Loads log events in the range
     * [`beginLogEventIdx`, `beginLogEventIdx + EXPORT_LOGS_CHUNK_SIZE`), or all remaining log
     * events if `EXPORT_LOGS_CHUNK_SIZE` log events aren't available.
     *
     * @param beginLogEventIdx
     * @return An object containing the log events as a string.
     * @throws {Error} if any error occurs when decoding the log events.
     */
    loadChunk (beginLogEventIdx: number): {
        logs: string,
    } {
        const endLogEventIdx = Math.min(beginLogEventIdx + EXPORT_LOGS_CHUNK_SIZE, this.#numEvents);
        const results = this.#decoder.decodeRange(
            beginLogEventIdx,
            endLogEventIdx,
            false,
        );

        if (null === results) {
            throw new Error(
                `Failed to decode log events in range [${beginLogEventIdx}, ${endLogEventIdx})`
            );
        }

        const messages = results.map(([msg]) => msg);

        return {
            logs: messages.join(""),
        };
    }

    /**
     * Loads a page of log events based on the provided cursor.
     *
     * @param cursor The cursor indicating the page to load. See {@link CursorType}.
     * @return An object containing the logs as a string, a map of line numbers to log event
     * numbers, and the line number of the first line in the cursor identified event.
     * @throws {Error} if any error occurs during decode.
     */
    loadPage (cursor: CursorType): WorkerResp<WORKER_RESP_CODE.PAGE_DATA> {
        console.debug(`loadPage: cursor=${JSON.stringify(cursor)}`);
        const filteredLogEventMap = this.#decoder.getFilteredLogEventMap();
        const numActiveEvents: number = filteredLogEventMap ?
            filteredLogEventMap.length :
            this.#numEvents;

        if (0 === numActiveEvents) {
            return EMPTY_PAGE_RESP;
        }
        const {
            pageBegin,
            pageEnd,
            matchingEvent,
        } = this.#getCursorData(cursor, numActiveEvents);
        const results = this.#decoder.decodeRange(
            pageBegin,
            pageEnd,
            null !== filteredLogEventMap,
        );

        if (null === results) {
            throw new Error("Error occurred during decoding. " +
                `pageBegin=${pageBegin}, ` +
                `pageEnd=${pageEnd}`);
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
        const newNumPages: number = getChunkNum(numActiveEvents, this.#pageSize);
        const newPageNum: number = getChunkNum(pageBegin + 1, this.#pageSize);
        const matchingLogEventNum = 1 + (
            null !== filteredLogEventMap ?
                (filteredLogEventMap[matchingEvent] as number) :
                matchingEvent
        );

        return {
            beginLineNumToLogEventNum: beginLineNumToLogEventNum,
            cursorLineNum: 1,
            logEventNum: matchingLogEventNum,
            logs: messages.join(""),
            numPages: newNumPages,
            pageNum: newPageNum,
        };
    }

    /**
     * Creates a RegExp object based on the given query string and options, and starts querying the
     * first log chunk.
     *
     * @param queryString
     * @param isRegex
     * @param isCaseSensitive
     */
    startQuery (queryString: string, isRegex: boolean, isCaseSensitive: boolean): void {
        this.#queryId++;
        this.#queryCount = 0;

        // Send an empty query result with 0 progress to the render to init the results variable
        // because there could be results sent by previous task before `startQuery()` runs.
        this.#onQueryResults(0, new Map());

        // If the query string is empty, or there are no logs, return
        if ("" === queryString || 0 === this.#numEvents) {
            return;
        }

        // Construct query RegExp
        const regexPattern = isRegex ?
            queryString :
            queryString.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regexFlags = isCaseSensitive ?
            "" :
            "i";
        const queryRegex = new RegExp(regexPattern, regexFlags);

        this.#queryChunkAndScheduleNext(this.#queryId, 0, queryRegex);
    }

    /**
     * Processes decoded log events and populates the results map with matched entries.
     *
     * @param decodedEvents
     * @param queryRegex
     * @param results The map to store query results.
     */
    #processQueryDecodedEvents (
        decodedEvents: DecodeResult[],
        queryRegex: RegExp,
        results: QueryResults
    ): void {
        for (const [message, , , logEventNum] of decodedEvents) {
            const matchResult = message.match(queryRegex);
            if (null === matchResult || "number" !== typeof matchResult.index) {
                continue;
            }

            const pageNum = Math.ceil(logEventNum / this.#pageSize);
            if (false === results.has(pageNum)) {
                results.set(pageNum, []);
            }

            results.get(pageNum)?.push({
                logEventNum: logEventNum,
                message: message,
                matchRange: [
                    matchResult.index,
                    matchResult.index + matchResult[0].length,
                ],
            });

            this.#queryCount++;
            if (this.#queryCount >= MAX_QUERY_RESULT_COUNT) {
                break;
            }
        }
    }

    /**
     * Queries a chunk of log events, sends the results, and schedules the next chunk query if more
     * log events remain.
     *
     * @param queryId
     * @param chunkBeginIdx
     * @param queryRegex
     */
    #queryChunkAndScheduleNext (
        queryId: number,
        chunkBeginIdx: number,
        queryRegex: RegExp
    ): void {
        if (queryId !== this.#queryId) {
            // Current task no longer corresponds to the latest query in the LogFileManager.
            return;
        }
        const chunkEndIdx = Math.min(chunkBeginIdx + QUERY_CHUNK_SIZE, this.#numEvents);
        const results: QueryResults = new Map();
        const decodedEvents = this.#decoder.decodeRange(
            chunkBeginIdx,
            chunkEndIdx,
            null !== this.#decoder.getFilteredLogEventMap()
        );

        if (null === decodedEvents) {
            return;
        }

        this.#processQueryDecodedEvents(decodedEvents, queryRegex, results);

        // The query progress takes the maximum of the progress based on the number of events
        // queried over total log events, and the number of results over the maximum result limit.
        const progress = Math.max(
            chunkEndIdx / this.#numEvents,
            this.#queryCount / MAX_QUERY_RESULT_COUNT
        );

        this.#onQueryResults(progress, results);

        if (chunkEndIdx < this.#numEvents && MAX_QUERY_RESULT_COUNT > this.#queryCount) {
            defer(() => {
                this.#queryChunkAndScheduleNext(queryId, chunkEndIdx, queryRegex);
            });
        }
    }

    /**
     * Gets the data that corresponds to the cursor.
     *
     * @param cursor
     * @param numActiveEvents
     * @return Cursor data.
     * @throws {Error} if the type of cursor is not supported.
     */
    #getCursorData (cursor: CursorType, numActiveEvents: number): CursorData {
        const {code, args} = cursor;
        switch (code) {
            case CURSOR_CODE.PAGE_NUM:
                return getPageNumCursorData(
                    args.pageNum,
                    args.eventPositionOnPage,
                    numActiveEvents,
                    this.#pageSize,
                );
            case CURSOR_CODE.LAST_EVENT:
                return getLastEventCursorData(numActiveEvents, this.#pageSize);
            case CURSOR_CODE.EVENT_NUM:
                return getEventNumCursorData(
                    args.eventNum,
                    numActiveEvents,
                    this.#pageSize,
                    this.#decoder.getFilteredLogEventMap(),
                );
            default:
                throw new Error(`Unsupported cursor type: ${code}`);
        }
    }
}

export default LogFileManager;
