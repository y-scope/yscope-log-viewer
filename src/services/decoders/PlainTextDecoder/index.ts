import {Nullable} from "../../../typings/common";
import {
    Decoder,
    DecodeResult,
    FilteredLogEventMap,
    LogEventCount,
    Metadata,
} from "../../../typings/decoders";


class PlainTextDecoder implements Decoder {
    #logs: string[];

    constructor (dataArray: Uint8Array) {
        const textDecoder = new TextDecoder();
        this.#logs = textDecoder.decode(dataArray).split(/\r\n|\r|\n/);
    }

    static async create (dataArray: Uint8Array) {
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
    setLogLevelFilter (): boolean {
        return false;
    }

    build (): LogEventCount {
        return {
            numValidEvents: this.#logs.length,
            numInvalidEvents: 0,
        };
    }

    // eslint-disable-next-line class-methods-use-this
    setFormatterOptions (): boolean {
        return false;
    }

    decodeRange (beginIdx: number, endIdx: number): Nullable<DecodeResult[]> {
        return this.#logs.slice(beginIdx, endIdx).map((log, i) => ({
            logEventNum: beginIdx + i,
            logLevel: 0,
            message: `${log}\n`,
            timestamp: BigInt(0),
            utcOffset: BigInt(0),
        }));
    }

    // eslint-disable-next-line class-methods-use-this
    findNearestLogEventByTimestamp (): Nullable<number> {
        return null;
    }
}

export default PlainTextDecoder;
