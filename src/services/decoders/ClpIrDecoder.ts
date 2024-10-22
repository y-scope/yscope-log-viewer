import clpFfiJsModuleInit, {ClpIrStreamReader} from "clp-ffi-js";

import {Nullable} from "../../typings/common";
import {
    Decoder,
    DecodeResultType,
    FilteredLogEventMap,
    LogEventCount,
} from "../../typings/decoders";
import {LogLevelFilter} from "../../typings/logs";


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

    getFilteredLogEventMap (): FilteredLogEventMap {
        return this.#streamReader.getFilteredLogEventMap();
    }

    setLogLevelFilter (logLevelFilter: LogLevelFilter): boolean {
        this.#streamReader.filterLogEvents(logLevelFilter);

        return true;
    }

    build (): LogEventCount {
        return {
            numInvalidEvents: 0,
            numValidEvents: this.#streamReader.deserializeStream(),
        };
    }

    // eslint-disable-next-line class-methods-use-this
    setFormatterOptions (): boolean {
        return true;
    }

    decodeRange (
        beginIdx: number,
        endIdx: number,
        useFilter: boolean
    ): Nullable<DecodeResultType[]> {
        return this.#streamReader.decodeRange(beginIdx, endIdx, useFilter);
    }
}

export default ClpIrDecoder;
