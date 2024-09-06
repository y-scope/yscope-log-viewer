import clpFfiJsModuleInit, {ClpIrStreamReader} from "clp-ffi-js";
import {Nullable} from "../../typings/common";
import {LogLevelFilter} from "../../typings/logs";
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

    getFilteredLogEvents (): number[] {
        // eslint-disable-next-line no-warning-comments
        // TODO: fix this after log level filtering is implemented in clp-ffi-js
        return Array.from({length: this.#streamReader.getNumEventsBuffered()}, (_, index) => index);
    }

    buildIdx (beginIdx: number, endIdx: number): Nullable<LogEventCount> {
        return {
            numInvalidEvents: 0,
            numValidEvents: this.#streamReader.deserializeRange(beginIdx, endIdx),
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
    changeLogLevelFilter (logLevelFilter: LogLevelFilter): boolean {
        // eslint-disable-next-line no-warning-comments
        // TODO fix this after log level filtering is implemented in clp-ffi-js
        return true;
    }

    decode (beginIdx: number, endIdx: number): Nullable<DecodeResultType[]> {
        return this.#streamReader.decodeRange(beginIdx, endIdx);
    }
}

export default ClpIrDecoder;
