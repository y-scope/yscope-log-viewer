import clpFfiJsModuleInit, {ClpIrStreamReader} from "clp-ffi-js";

import {Nullable} from "../../typings/common";
import {
    Decoder,
    DecodeResultType,
    FilteredLogEventMap,
    LOG_EVENT_FILE_END_IDX,
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

    // eslint-disable-next-line class-methods-use-this
    getFilteredLogEventMap (): FilteredLogEventMap {
        // eslint-disable-next-line no-warning-comments
        // TODO: Update this after log level filtering is implemented in clp-ffi-js
        console.error("getFilteredLogEventMap not implemented for IR decoder.");

        return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
    setLogLevelFilter (logLevelFilter: LogLevelFilter): boolean {
        // eslint-disable-next-line no-warning-comments
        // TODO: Update this after log level filtering is implemented in clp-ffi-js
        console.error("setLogLevelFilter not implemented for IR decoder.");

        return false;
    }

    build (): LogEventCount {
        return {
            numInvalidEvents: 0,
            numValidEvents: this.#streamReader.deserializeRange(0, LOG_EVENT_FILE_END_IDX),
        };
    }

    // eslint-disable-next-line class-methods-use-this
    setFormatterOptions (): boolean {
        return true;
    }

    decodeRange (
        beginIdx: number,
        endIdx: number,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        useFilter: boolean
    ): Nullable<DecodeResultType[]> {
        return this.#streamReader.decodeRange(beginIdx, endIdx);
    }
}

export default ClpIrDecoder;
