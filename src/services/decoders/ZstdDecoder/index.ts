/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */

import {
    decompress,
    init,
} from "@bokuweb/zstd-wasm";

import {Nullable} from "../../../typings/common";
import {
    Decoder,
    DecodeResult,
    DecoderOptions,
    FilteredLogEventMap,
    LogEventCount,
    Metadata,
} from "../../../typings/decoders";
import {LogLevelFilter} from "../../../typings/logs.ts";


/**
 * A decoder for CLP single file archives. Single file archives are an
 * alternate archive format where CLP compressed output is stored in a
 * single file rather than in a directory with multiple files.
 * NOTE: Current implementation does not preserve timestamp formatting.
 */
class ZstdDecoder implements Decoder {
    #logs: string[];

    constructor (lines: string[]) {
        this.#logs = lines;
    }

    static async create (dataArray: Uint8Array): Promise<ZstdDecoder> {
        await init();
        const logArrayBuffer = decompress(dataArray);
        const textDecoder = new TextDecoder();
        const logs = textDecoder.decode(logArrayBuffer).split(/\r\n|\r|\n/);
        return new ZstdDecoder(logs);
    }

    getEstimatedNumEvents (): number {
        return this.#logs.length;
    }

    getFilteredLogEventMap (): FilteredLogEventMap {
        return null;
    }

    getMetadata (): Metadata {
        // This decoder does not provide metadata.
        return {};
    }

    setLogLevelFilter (logLevelFilter: LogLevelFilter): boolean {
        return false;
    }

    build (): LogEventCount {
        return {
            numValidEvents: this.#logs.length,
            numInvalidEvents: 0,
        };
    }

    setFormatterOptions (options: DecoderOptions): boolean {
        return false;
    }

    decodeRange (beginIdx: number, endIdx: number, useFilter: boolean): Nullable<DecodeResult[]> {
        return this.#logs.slice(beginIdx, endIdx).map((log, i) => {
            return {
                logEventNum: beginIdx + i,
                logLevel: 0,
                message: `${log}\n`,
                timestamp: BigInt(0),
                utcOffset: BigInt(0),
            };
        });
    }

    findNearestLogEventByTimestamp (timestamp: number): Nullable<number> {
        return null;
    }
}

export default ZstdDecoder;
