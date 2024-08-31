import clpFfijsModuleInit, {ClpIrStreamReader} from "clp-ffi-js";
import {Nullable} from "../../typings/common";
import {
    Decoder,
    DecodeResultType,
    LogEventCount,
} from "../../typings/decoders";


class ClpIrDecoder implements Decoder {
    #streamReader: ClpIrStreamReader;

    constructor (streamReader: ClpIrStreamReader) {
        this.#streamReader = streamReader;
    }

    static async create (dataArray: Uint8Array): Promise<ClpIrDecoder> {
        const module = await clpFfijsModuleInit();
        const streamReader = new module.ClpIrStreamReader(dataArray);
        return new ClpIrDecoder(streamReader);
    }

    getEstimatedNumEvents (): number {
        return this.#streamReader.getNumEventsBuffered();
    }

    buildIdx (beginIdx: number, endIdx: number): Nullable<LogEventCount> {
        return {
            numValidEvents: this.#streamReader.deserializeRange(beginIdx, endIdx),
            numInvalidEvents: 0,
        };
    }

    // TODO: add prettify option
    // eslint-disable-next-line class-methods-use-this
    setDecoderOptions (): boolean {
        return true;
    }

    decode (beginIdx: number, endIdx: number): Nullable<DecodeResultType[]> {
        return this.#streamReader.decodeRange(beginIdx, endIdx);
    }
}

export default ClpIrDecoder;
