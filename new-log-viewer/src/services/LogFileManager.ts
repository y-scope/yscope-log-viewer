import {
    CursorType,
    FileSrcType,
    LineNumLogEventNumMap,
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


    async loadFile (fileSrc: FileSrcType): Promise<number> {
        if ("string" === typeof fileSrc) {
            this.#fileName = getBasenameFromUrl(fileSrc);
            this.#fileData = await getUint8ArrayFrom(fileSrc, () => null);
        } else {
            // FIXME
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

        // FIXME
        this.#decoder.setDecodeOptions({
            verbosityPropName: "log.level",
            timestampPropName: "@timestamp",
        });

        return this.#numEvents;
    }

    loadPage (cursor: CursorType): {
        logs: string,
        lines: LineNumLogEventNumMap,
        cursorLineNum: number
    } {
        console.debug(`loadPage: cursor=${JSON.stringify(cursor)}`);

        const results: Array<[string, number, number, number]> = [];
        let startLogEventNum = (Math.floor(this.#numEvents / this.#pageSize) * this.#pageSize) + 1;
        if (null !== cursor) {
            if ("pageNum" in cursor) {
                startLogEventNum = ((cursor.pageNum - 1) * this.#pageSize) + 1;
            } else {
                // FIXME
                console.error("other types of cursor not yet supported");
            }
        }
        const endLogEventNum = Math.min(this.#numEvents, startLogEventNum + this.#pageSize - 1);

        this.#decoder?.decode(results, startLogEventNum - 1, endLogEventNum);

        const messages: string[] = [];
        const lines: LineNumLogEventNumMap = new Map();
        let currentLine = 1;
        results.forEach((r) => {
            const [
                m,
                ,
                ,
                logEventNum,
            ] = r;

            messages.push(m);
            lines.set(currentLine, logEventNum);
            currentLine += m.split("\n").length - 1;
        });

        return {
            logs: messages.join(""),
            lines: lines,
            cursorLineNum: 1,
        };
    }
}

export default LogFileManager;
