import {
    DecodeOptionsType,
    Decoders,
} from "../typings/decoders";
import {
    BeginLineNumToLogEventNumMap,
    CursorType,
    FileSrcType,
} from "../typings/worker";
import {getUint8ArrayFrom} from "../utils/http";
import {getBasenameFromUrl} from "../utils/url";
import JsonlDecoder from "./decoders/JsonlDecoder";


class LogFileManager {
    #pageSize: number;

    #fileData: Uint8Array | null = null;

    #fileName: string | null = null;

    #numEvents: number = 0;

    #decoder: Decoders | null = null;


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

        this.#numEvents = this.#decoder.buildIdx();
        console.log(`Found ${this.#numEvents} log events.`);
    };

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
            this.#fileName = getBasenameFromUrl(fileSrc);
            this.#fileData = await getUint8ArrayFrom(fileSrc, () => null);
        } else {
            // TODO: support file loading via Open / Drag-n-drop
            throw new Error("Read from File not yet supported");
        }

        this.#initDecoder();

        return this.#numEvents;
    }

    setDecodeOptions (options: DecodeOptionsType) {
        if (null === this.#decoder) {
            throw new Error("loadFile() must be first called.");
        }
        this.#decoder.setDecodeOptions(options);
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

        const results: Array<[string, number, number, number]> = [];
        let startLogEventNum = (Math.floor(this.#numEvents / this.#pageSize) * this.#pageSize) + 1;
        if (null !== cursor) {
            if ("pageNum" in cursor) {
                startLogEventNum = ((cursor.pageNum - 1) * this.#pageSize) + 1;
            } else {
                // TODO: support file loading via Open / Drag-n-drop
                console.error("other types of cursor not yet supported");
            }
        }
        const endLogEventNum = Math.min(this.#numEvents, startLogEventNum + this.#pageSize - 1);

        this.#decoder.decode(results, startLogEventNum - 1, endLogEventNum);

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
}

export default LogFileManager;
