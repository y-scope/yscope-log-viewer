/* eslint max-lines: ["error", 600] */
import jsBeautify from "js-beautify";

import {
    Decoder,
    DecodeResult,
    DecoderOptions,
} from "../../typings/decoders";
import {FileTypeInfo} from "../../typings/file";
import {LogLevelFilter} from "../../typings/logs";
import {
    QueryArgs,
    QueryResults,
} from "../../typings/query";
import {
    BeginLineNumToLogEventNumMap,
    CURSOR_CODE,
    CursorData,
    CursorType,
    EMPTY_PAGE_RESP,
    FileSrcType,
    PageData,
} from "../../typings/worker";
import {
    EXPORT_LOGS_CHUNK_SIZE,
    QUERY_CHUNK_SIZE,
} from "../../utils/config";
import {getChunkNum} from "../../utils/math";
import {defer} from "../../utils/time";
import {resolveDecoderAndFileType} from "./decodeUtils";
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

    readonly #fileTypeInfo: FileTypeInfo;

    readonly #numEvents: number = 0;

    readonly #pageSize: number;

    #queryId: number = 0;

    readonly #onDiskFileSizeInBytes: number;

    readonly #onExportChunk: (logs: string) => void;

    readonly #onQueryResults: (queryProgress: number, queryResults: QueryResults) => void;

    #decoder: Decoder;

    #queryCount: number = 0;

    #isPrettified: boolean = false;

    /**
     * Private constructor for LogFileManager. This is not intended to be invoked publicly.
     * Instead, use LogFileManager.create() to create a new instance of the class.
     *
     * @param params
     * @param params.decoder
     * @param params.fileName
     * @param params.fileTypeInfo
     * @param params.onDiskFileSizeInBytes
     * @param params.pageSize Page size for setting up pagination.
     * @param params.onExportChunk
     * @param params.onQueryResults
     */
    constructor ({
        decoder,
        fileName,
        fileTypeInfo,
        onDiskFileSizeInBytes,
        pageSize,
        onExportChunk,
        onQueryResults,
    }: {
        decoder: Decoder;
        fileName: string;
        fileTypeInfo: FileTypeInfo;
        onDiskFileSizeInBytes: number;
        pageSize: number;
        onExportChunk: (logs: string) => void;
        onQueryResults: (queryProgress: number, queryResults: QueryResults) => void;
    }) {
        this.#decoder = decoder;
        this.#fileName = fileName;
        this.#fileTypeInfo = fileTypeInfo;
        this.#pageSize = pageSize;
        this.#onDiskFileSizeInBytes = onDiskFileSizeInBytes;
        this.#onExportChunk = onExportChunk;
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

    get fileTypeInfo () {
        return this.#fileTypeInfo;
    }

    get onDiskFileSizeInBytes () {
        return this.#onDiskFileSizeInBytes;
    }

    get metadata () {
        return this.#decoder.getMetadata();
    }

    get numEvents () {
        return this.#numEvents;
    }

    /**
     * Creates a new LogFileManager.
     *
     * @param params
     * @param params.fileSrc The source of the file to load.
     * This can be a string representing a URL, or a File object.
     * @param params.pageSize Page size for setting up pagination.
     * @param params.decoderOptions Initial decoder options.
     * @param params.onExportChunk
     * @param params.onQueryResults
     * @return A Promise that resolves to the created LogFileManager instance.
     */
    static async create ({
        fileSrc,
        pageSize,
        decoderOptions,
        onExportChunk,
        onQueryResults,
    }: {
        fileSrc: FileSrcType;
        pageSize: number;
        decoderOptions: DecoderOptions;
        onExportChunk: (logs: string) => void;
        onQueryResults: (queryProgress: number, queryResults: QueryResults) => void;
    }): Promise<LogFileManager> {
        const {fileName, fileData} = await loadFile(fileSrc);
        const {decoder, fileTypeInfo} = await resolveDecoderAndFileType(
            fileName,
            fileData,
            decoderOptions
        );

        return new LogFileManager({
            decoder: decoder,
            fileName: fileName,
            fileTypeInfo: fileTypeInfo,
            onDiskFileSizeInBytes: fileData.length,
            pageSize: pageSize,

            onExportChunk: onExportChunk,
            onQueryResults: onQueryResults,
        });
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

    setIsPrettified (isPrettified: boolean) {
        this.#isPrettified = isPrettified;
    }

    /**
     * Exports a chunk of log events, sends the results to the renderer, and schedules the next
     * chunk if more log events remain.
     *
     * @param beginLogEventIdx
     * @throws {Error} if any error occurs when decoding the log events.
     */
    exportChunkAndScheduleNext (beginLogEventIdx: number) {
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

        const messages = results.map(({message}) => message);
        this.#onExportChunk(messages.join(""));

        if (endLogEventIdx < this.#numEvents) {
            defer(() => {
                this.exportChunkAndScheduleNext(endLogEventIdx);
            });
        }
    }

    /**
     * Loads a page of log events based on the provided cursor.
     *
     * @param cursor The cursor indicating the page to load. See {@link CursorType}.
     * @return An object containing the logs as a string, a map of line numbers to log event
     * numbers, and the line number of the first line in the cursor identified event.
     * @throws {Error} if any error occurs during decode.
     */
    loadPage (cursor: CursorType): PageData {
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
        results.forEach(({message, logEventNum}) => {
            const printedMsg = (this.#isPrettified) ?
                `${jsBeautify(message)}\n` :
                message;

            messages.push(printedMsg);
            beginLineNumToLogEventNum.set(currentLine, logEventNum);
            currentLine += message.split("\n").length - 1;
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
     * @param queryArgs
     * @param queryArgs.queryString
     * @param queryArgs.isRegex
     * @param queryArgs.isCaseSensitive
     * @throws {SyntaxError} if the query regex string is invalid.
     */
    startQuery ({queryString, isRegex, isCaseSensitive}: QueryArgs): void {
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

        try {
            const queryRegex = new RegExp(regexPattern, regexFlags);
            this.#queryChunkAndScheduleNext(this.#queryId, 0, queryRegex);
        } catch (e) {
            if (e instanceof SyntaxError) {
                console.error("Invalid regular expression:", e);
            }
            throw e;
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

        const filteredLogEventMap = this.#decoder.getFilteredLogEventMap();
        const numActiveEvents: number = (null !== filteredLogEventMap) ?
            filteredLogEventMap.length :
            this.#numEvents;

        if (0 === numActiveEvents) {
            return;
        }

        const chunkEndIdx = Math.min(chunkBeginIdx + QUERY_CHUNK_SIZE, numActiveEvents);
        const results: QueryResults = new Map();
        const decodedEvents = this.#decoder.decodeRange(
            chunkBeginIdx,
            chunkEndIdx,
            null !== filteredLogEventMap
        );

        if (null === decodedEvents) {
            return;
        }

        this.#processQueryDecodedEvents(decodedEvents, queryRegex, results);

        // The query progress takes the maximum of the progress based on the number of events
        // queried over total log events, and the number of results over the maximum result limit.
        const progress = Math.max(
            chunkEndIdx / numActiveEvents,
            this.#queryCount / MAX_QUERY_RESULT_COUNT
        );

        this.#onQueryResults(progress, results);

        if (chunkEndIdx < numActiveEvents && MAX_QUERY_RESULT_COUNT > this.#queryCount) {
            defer(() => {
                this.#queryChunkAndScheduleNext(queryId, chunkEndIdx, queryRegex);
            });
        }
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
        for (const {message, logEventNum} of decodedEvents) {
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
     * Gets the data that corresponds to the cursor.
     *
     * @param cursor
     * @param numActiveEvents
     * @return Cursor data.
     * @throws {Error} if the type of cursor is not supported.
     */
    #getCursorData (cursor: CursorType, numActiveEvents: number): CursorData {
        const {code, args} = cursor;

        let eventNum = 0;
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
                ({eventNum} = args);
                break;
            case CURSOR_CODE.TIMESTAMP: {
                const eventIdx = this.#decoder.findNearestLogEventByTimestamp(args.timestamp);
                if (null !== eventIdx) {
                    eventNum = eventIdx + 1;
                }
                break;
            }
            default:
                throw new Error(`Unsupported cursor code: ${code as string}`);
        }

        return getEventNumCursorData(
            eventNum,
            numActiveEvents,
            this.#pageSize,
            this.#decoder.getFilteredLogEventMap(),
        );
    }
}

export default LogFileManager;
