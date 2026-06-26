/* eslint-disable class-methods-use-this */

import {ClpArchiveReader} from "clp-ffi-js/sfa";

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
    #archiveReader: ClpArchiveReader;

    #decodedLogEvents: Nullable<DecodeResult[]> = null;

    constructor (archiveReader: ClpArchiveReader) {
        this.#archiveReader = archiveReader;
    }

    /**
     * Creates a new ClpSfaDecoder instance.
     *
     * @param dataArray The input data array to be passed to the decoder.
     * @param decoderOptions
     * @return The created ClpSfaDecoder instance.
     */
    static async create (
        dataArray: Uint8Array,
        decoderOptions: DecoderOptions
    ): Promise<ClpSfaDecoder> {
        markAsUsed(decoderOptions);

        return new ClpSfaDecoder(await ClpArchiveReader.create(dataArray));
    }

    getEstimatedNumEvents (): number {
        return Number(this.#archiveReader.getEventCount());
    }

    getFilteredLogEventMap (): FilteredLogEventMap {
        return null;
    }

    getMetadata (): Metadata {
        return {
            fileInfos: this.#archiveReader.getFileInfos().map((fileInfo) => ({
                fileName: fileInfo.fileName,
                logEventCount: Number(fileInfo.logEventCount),
                logEventIdxEnd: Number(fileInfo.logEventIdxEnd),
                logEventIdxStart: Number(fileInfo.logEventIdxStart),
            })),
            fileNames: this.#archiveReader.getFileNames(),
        };
    }

    setLogLevelFilter (logLevelFilter: LogLevelFilter, kqlFilter: string): boolean {
        markAsUsed(logLevelFilter, kqlFilter);

        return true;
    }

    build (): LogEventCount {
        return {
            numInvalidEvents: 0,
            numValidEvents: this.#getDecodedLogEvents().length,
        };
    }

    setFormatterOptions (options: DecoderOptions): boolean {
        markAsUsed(options);

        return false;
    }

    decodeRange (
        beginIdx: number,
        endIdx: number,
        useFilter: boolean
    ): Nullable<DecodeResult[]> {
        markAsUsed(useFilter);

        const decodedLogEvents = this.#getDecodedLogEvents();
        if (0 > beginIdx || endIdx > decodedLogEvents.length || endIdx < beginIdx) {
            return null;
        }

        return decodedLogEvents.slice(beginIdx, endIdx);
    }

    findNearestLogEventByTimestamp (timestamp: number): Nullable<number> {
        const decodedLogEvents = this.#getDecodedLogEvents();
        if (0 === decodedLogEvents.length) {
            return null;
        }

        let firstIdxAfterTimestamp = decodedLogEvents.findIndex((logEvent) => logEvent.timestamp >
            BigInt(timestamp));

        if (-1 === firstIdxAfterTimestamp) {
            firstIdxAfterTimestamp = decodedLogEvents.length - 1;
        }

        return 0 === firstIdxAfterTimestamp ?
            0 :
            firstIdxAfterTimestamp - 1;
    }

    #getDecodedLogEvents (): DecodeResult[] {
        if (null === this.#decodedLogEvents) {
            this.#decodedLogEvents = this.#archiveReader.decodeAll().map((logEvent) => ({
                logEventNum: Number(logEvent.logEventIdx) + 1,
                logLevel: 0,
                message: `${logEvent.message}\n`,
                timestamp: logEvent.timestamp,
                utcOffset: BigInt(0),
            }));
        }

        return this.#decodedLogEvents;
    }
}

export default ClpSfaDecoder;
