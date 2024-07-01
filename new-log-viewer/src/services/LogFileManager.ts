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
import {formatSizeInBytes} from "../utils/file";
import {getUint8ArrayFrom} from "../utils/http";
import {getBasenameFromUrlOrDefault} from "../utils/url";
import JsonlDecoder from "./decoders/JsonlDecoder";


class LogFileManager {
    #pageSize: number;

    #fileData: Uint8Array | null = null;

    #fileName: string | null = null;

    #numEvents: number = 0;

    #decoder: Decoder | null = null;

    constructor (pageSize: number) {
        this.#pageSize = pageSize;
    }

    /**
     * Loads a file from a given source and decodes it using the appropriate decoder based on the
     * file extension.
     *
     * @param fileSrc The source of the file to load. This can be a string representing a URL, or a
     * File object.
     * @return A promise that resolves with the number of log events found in the file.
     * @throws {Error} If the file source type is not supported.
     */
    async loadFile (fileSrc: FileSrcType): Promise<number> {
        if ("string" === typeof fileSrc) {
            this.#fileName = getBasenameFromUrlOrDefault(fileSrc);
            this.#fileData = await getUint8ArrayFrom(fileSrc, () => null);
        } else {
            // TODO: support file loading via Open / Drag-n-drop
            throw new Error("Read from File not yet supported");
        }

        this.#initDecoder();

        return this.#numEvents;
    }

    setDecoderOptions (options: DecoderOptionsType) {
        if (null === this.#decoder) {
            throw new Error("loadFile() must be first called.");
        }
        this.#decoder.setDecoderOptions(options);
    }

    /**
     * Loads a page of log events based on the provided cursor.
     *
     * @param cursor The cursor indicating the page to load. See {@link CursorType}.
     * @return An object containing the logs as a string, a map of line numbers to log event
     * numbers, and the line number of the first line in the cursor identified event.
     * @throws {Error} - If the loadFile method has not been called before this method.
     */
    loadPage (cursor: CursorType): {
        logs: string,
        beginLineNumToLogEventNum: BeginLineNumToLogEventNumMap,
        cursorLineNum: number
    } {
        console.debug(`loadPage: cursor=${JSON.stringify(cursor)}`);
        if (null === this.#decoder) {
            throw new Error("loadFile() must be first called.");
        }

        const {beginLogEventNum, endLogEventNum} = this.#getCursorRange(cursor);
        const results = this.#decoder.decode(beginLogEventNum - 1, endLogEventNum);
        if (null === results) {
            throw new Error("Error occurred during decoding." +
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
     * Constructs and a decoder instance based on the file extension and let it build an index.
     *
     * @throws {Error} if #fileName or #fileData hasn't been init, or a decoder cannot be found.
     */
    #initDecoder = (): void => {
        if (null === this.#fileName || null === this.#fileData) {
            throw new Error("Unexpected usage");
        }

        if (this.#fileName.endsWith(".jsonl")) {
            this.#decoder = new JsonlDecoder(this.#fileData);
        } else {
            throw new Error(`A decoder cannot be found for ${this.#fileName}`);
        }

        if (this.#fileData.length > MAX_V8_STRING_LENGTH) {
            throw new Error(`Cannot handle files larger than ${
                formatSizeInBytes(MAX_V8_STRING_LENGTH)
            } due to a limitation in Chromium-based browsers.`);
        }

        this.#numEvents = this.#decoder.buildIdx();
        console.log(`Found ${this.#numEvents} log events.`);
    };

    /**
     * Retrieves the range of log event numbers based on the given cursor.
     *
     * @param cursor The cursor object containing the code and arguments.
     * @return The start and end log event numbers within the range.
     * @throws {Error} If the type of cursor is not supported.
     */
    #getCursorRange (cursor: CursorType) {
        const {code, args} = cursor;
        let beginLogEventIdx: number;

        switch (code) {
            case CURSOR_CODE.LAST_EVENT:
                beginLogEventIdx =
                    (Math.floor((this.#numEvents - 1) / this.#pageSize) * this.#pageSize);
                break;
            case CURSOR_CODE.PAGE_NUM:
                beginLogEventIdx = ((args.pageNum - 1) * this.#pageSize);
                break;
            default:
                throw new Error("other types of cursor not yet supported");
        }

        const beginLogEventNum = beginLogEventIdx + 1;
        const endLogEventNum = Math.min(this.#numEvents, beginLogEventNum + this.#pageSize - 1);
        return {beginLogEventNum, endLogEventNum};
    }
}

export default LogFileManager;
