/* eslint-disable @typescript-eslint/no-unused-vars */
import {Nullable} from "../../../typings/common";
import {
    Decoder,
    DecodeResult,
    DecoderOptions,
    FilteredLogEventMap,
    LogEventCount,
    Metadata,
} from "../../../typings/decoders";
import {LogLevelFilter} from "../../../typings/logs";


class PlainTextDecoder implements Decoder {
    #logs: string[];

    constructor (dataArray: Uint8Array) {
        const textDecoder = new TextDecoder();
        this.#logs = textDecoder.decode(dataArray).split(/\r\n|\r|\n/);
    }

    static async create (dataArray: Uint8Array, _decoderOptions: DecoderOptions) {
        return Promise.resolve(new PlainTextDecoder(dataArray));
    }

    getEstimatedNumEvents (): number {
        return this.#logs.length;
    }

    // eslint-disable-next-line class-methods-use-this
    getFilteredLogEventMap (): FilteredLogEventMap {
        return null;
    }

    // eslint-disable-next-line class-methods-use-this
    getMetadata (): Metadata {
        return {};
    }

    // eslint-disable-next-line class-methods-use-this
    setLogLevelFilter (_logLevelFilter: LogLevelFilter): boolean {
        return false;
    }

    build (): LogEventCount {
        return {
            numValidEvents: this.#logs.length,
            numInvalidEvents: 0,
        };
    }

    // eslint-disable-next-line class-methods-use-this
    setFormatterOptions (_options: DecoderOptions): boolean {
        return false;
    }

    decodeRange (beginIdx: number, endIdx: number, _useFilter: boolean): Nullable<DecodeResult[]> {
        return this.#logs.slice(beginIdx, endIdx).map((log, i) => ({
            logEventNum: beginIdx + i,
            logLevel: 0,
            message: `${log}\n`,
            timestamp: BigInt(0),
            utcOffset: BigInt(0),
        }));
    }

    // eslint-disable-next-line class-methods-use-this
    findNearestLogEventByTimestamp (_timestamp: number): Nullable<number> {
        return null;
    }
}

export default PlainTextDecoder;
