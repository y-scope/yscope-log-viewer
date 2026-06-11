/* eslint-disable class-methods-use-this */

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


const NOT_IMPLEMENTED_ERROR_MESSAGE = "ClpSfaDecoder is not implemented.";

/**
 * Marks skeleton parameters as used while the decoder implementation is pending.
 *
 * @param values
 */
const markAsUsed = (...values: unknown[]): void => {
    for (const value of values) {
        if (value) {
            continue;
        }
    }
};


class ClpSfaDecoder implements Decoder {
    constructor (dataArray: Uint8Array, decoderOptions: DecoderOptions) {
        markAsUsed(dataArray, decoderOptions);
    }

    static async create (
        dataArray: Uint8Array,
        decoderOptions: DecoderOptions
    ): Promise<ClpSfaDecoder> {
        return Promise.resolve(new ClpSfaDecoder(dataArray, decoderOptions));
    }

    getEstimatedNumEvents (): number {
        throw new Error(NOT_IMPLEMENTED_ERROR_MESSAGE);
    }

    getFilteredLogEventMap (): FilteredLogEventMap {
        throw new Error(NOT_IMPLEMENTED_ERROR_MESSAGE);
    }

    getMetadata (): Metadata {
        throw new Error(NOT_IMPLEMENTED_ERROR_MESSAGE);
    }

    setLogLevelFilter (logLevelFilter: LogLevelFilter, kqlFilter: string): boolean {
        markAsUsed(logLevelFilter, kqlFilter);

        throw new Error(NOT_IMPLEMENTED_ERROR_MESSAGE);
    }

    build (): LogEventCount {
        throw new Error(NOT_IMPLEMENTED_ERROR_MESSAGE);
    }

    setFormatterOptions (options: DecoderOptions): boolean {
        markAsUsed(options);

        throw new Error(NOT_IMPLEMENTED_ERROR_MESSAGE);
    }

    decodeRange (
        beginIdx: number,
        endIdx: number,
        useFilter: boolean
    ): Nullable<DecodeResult[]> {
        markAsUsed(beginIdx, endIdx, useFilter);

        throw new Error(NOT_IMPLEMENTED_ERROR_MESSAGE);
    }

    findNearestLogEventByTimestamp (timestamp: number): Nullable<number> {
        markAsUsed(timestamp);

        throw new Error(NOT_IMPLEMENTED_ERROR_MESSAGE);
    }
}

export default ClpSfaDecoder;
