import {DecodeOptionsType} from "../typings/decoders";
import {
    BeginLineNumToLogEventNumMap,
    CursorType,
    FileSrcType,
} from "../typings/worker";
import {getUint8ArrayFrom} from "../utils/http";
import {getBasenameFromUrl} from "../utils/url";
import {
    Decoder,
    DecoderConstructor,
} from "./decoders/Decoder";
import JsonlDecoder from "./decoders/JsonlDecoder";


/**
 * A mapping of file name extensions to their respective decoders.
 */
const FILE_EXT_TO_DECODER: Readonly<Record<string, DecoderConstructor>> = Object.freeze({
    ".jsonl": JsonlDecoder as unknown as DecoderConstructor,
});

class LogFileManager {
    #pageSize: number;

    #fileData: Uint8Array | null = null;

    #fileName: string | null = null;

    #numEvents: number = 0;

    #decoder: Decoder | null = null;


    /**
     * Retrieves the decoder constructor based on the file extension.
     *
     * @param filename The filename from which to extract the file extension.
     * @return The constructor associated with the file extension, or null if not found.
     */
    static #getDecoderConstructor = (filename: string): DecoderConstructor | null => {
        for (const ext in FILE_EXT_TO_DECODER) {
            if (Object.hasOwn(FILE_EXT_TO_DECODER, ext)) {
                const decoderConstructor = FILE_EXT_TO_DECODER[ext];
                if (filename.endsWith(ext) && "undefined" !== typeof decoderConstructor) {
                    return decoderConstructor;
                }
            }
        }

        return null;
    };

    constructor (pageSize: number) {
        this.#pageSize = pageSize;
    }

    /**
    * Loads a file from a given source and decodes it using the appropriate decoder based on the file extension.
    *
    * @param {FileSrcType} fileSrc - The source of the file to load. This can be a string representing a URL, or a File object.
    * @return {Promise<number>} - A promise that resolves with the number of log events found in the file.
    * @throw {Error} - Throws an error if the file source type is not supported.
    */
    async loadFile (fileSrc: FileSrcType): Promise<number> {
        if ("string" === typeof fileSrc) {
            this.#fileName = getBasenameFromUrl(fileSrc);
            this.#fileData = await getUint8ArrayFrom(fileSrc, () => null);
        } else {
            // TODO: support file loading via Open / Drag-n-drop
            console.error("Read from File not yet supported");
        }

        if (null === this.#fileData || null === this.#fileName) {
            return 0;
        }

        const MatchingDecoder = LogFileManager.#getDecoderConstructor(this.#fileName);
        if (null === MatchingDecoder) {
            return 0;
        }

        this.#decoder = new MatchingDecoder(this.#fileData);
        this.#numEvents = this.#decoder.buildIdx();
        console.log(`Found ${this.#numEvents} log events.`);

        return this.#numEvents;
    }

    setDecodeOptions (options: DecodeOptionsType) {
        if (null === this.#decoder) {
            throw new Error("loadFile() must be first called.");
        }
        this.#decoder.setDecodeOptions(options);
    }

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
                m,
                ,
                ,
                logEventNum,
            ] = r;

            messages.push(m);
            beginLineNumToLogEventNum.set(currentLine, logEventNum);
            currentLine += m.split("\n").length - 1;
        });

        return {
            logs: messages.join(""),
            beginLineNumToLogEventNum: beginLineNumToLogEventNum,
            cursorLineNum: 1,
        };
    }
}

export default LogFileManager;
