import clpFfiJsModuleInit, {ClpIrStreamReader} from "clp-ffi-js";

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

    /**
     * Creates a new ClpIrDecoder instance.
     *
     * @param dataArray The input data array to be passed to the decoder.
     * @return The created ClpIrDecoder instance.
     */
    static async create (dataArray: Uint8Array): Promise<ClpIrDecoder> {
        const module = await clpFfiJsModuleInit();
        const streamReader = new module.ClpIrStreamReader(dataArray);
        return new ClpIrDecoder(streamReader);
    }

    getEstimatedNumEvents (): number {
        return this.#streamReader.getNumEventsBuffered();
    }

    getNumFilteredEvents (): number {
        // eslint-disable-next-line no-warning-comments
        // TODO: fix this after log level filtering is implemented in clp-ffi-js
        return this.#streamReader.getNumEventsBuffered();
    }

    buildIdx (beginIdx: number, endIdx: number): Nullable<LogEventCount> {
        return {
            numInvalidEvents: 0,
            numValidEvents: this.#streamReader.deserializeRange(beginIdx, endIdx),
        };
    }

    // eslint-disable-next-line class-methods-use-this
    setDecoderOptions (): boolean {
        return true;
    }

    decode (beginIdx: number, endIdx: number): Nullable<DecodeResultType[]> {
        return this.#streamReader.decodeRange(beginIdx, endIdx);
    }
}

export default ClpIrDecoder;
